// FollowUpChat.tsx — 追问聊天组件（流式版，带重试）
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FollowUpMessage {
    role: 'user' | 'assistant'
    content: string
    isError?: boolean
}

interface FollowUpChatProps {
    sessionId: string | null
    originalQuestion: string
    cards: { name: string; isReversed: boolean }[]
    personality: 'T' | 'F' | null
    initialReading: string
    initialSuggestions: string[]
}

const MAX_FOLLOW_UPS = 3
const MAX_RETRIES = 3 // 与 useGeminiAPI.ts 保持一致

export function FollowUpChat({
    sessionId,
    originalQuestion,
    cards,
    personality,
    initialReading,
    initialSuggestions,
}: FollowUpChatProps) {
    const [messages, setMessages] = useState<FollowUpMessage[]>([])
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(initialSuggestions)
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [turnCount, setTurnCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const messagesRef = useRef(messages)
    messagesRef.current = messages
    const turnCountRef = useRef(turnCount)
    turnCountRef.current = turnCount
    const lastFailedQuestionRef = useRef<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    // 构建追问 prompt
    const buildFollowUpPrompt = useCallback((question: string) => {
        const cardDesc = cards.map((c, i) => {
            const positions = ['过去', '现在', '未来']
            return `${positions[i]}位：${c.name}（${c.isReversed ? '逆位' : '正位'}）`
        }).join('\n')

        const validMessages = messagesRef.current.filter(m => !m.isError)
        const prevFollowUps: { q: string; a: string }[] = []
        for (let i = 0; i < validMessages.length - 1; i++) {
            if (validMessages[i].role === 'user' && validMessages[i + 1]?.role === 'assistant') {
                prevFollowUps.push({ q: validMessages[i].content, a: validMessages[i + 1].content })
            }
        }

        const prevContext = prevFollowUps
            .map((f, i) => `追问${i + 1}：${f.q}\n回答${i + 1}：${f.a}`)
            .join('\n\n')

        const safeInitialReading = (initialReading || '').substring(0, 300) + '...'

        return `你是一位塔罗牌解读师。
背景：用户在进行塔罗占卜后发起了追问。
【原始问题】${originalQuestion}
【牌面】${cardDesc}
【初始解读摘要】${safeInitialReading}
${prevContext ? `【前期追问】\n${prevContext}` : ''}

用户的具体追问：${question}

回答要求（严格限制）：
1. 深度分析！字数控制在 100-200 字以内。
2. 直接切入重点，不要寒暄。
3. 结合牌面给出一个核心洞察，并详细阐述逻辑。
4. ${turnCountRef.current < 2
                ? `最后给出 2 个建议追问（JSON格式）：\n\`\`\`json\n{"suggested_questions": ["问题1", "问题2"]}\n\`\`\``
                : '最后一次追问，无需建议。'}
`
    }, [cards, originalQuestion, initialReading])

    // 保存记录到后端（异步，不阻塞主流程）
    const saveFollowUpToHistory = useCallback(async (question: string, answer: string) => {
        if (!sessionId) return
        const deviceId = localStorage.getItem('tarot_device_uuid')
        if (!deviceId) return
        try {
            await fetch('/api/followup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Id': deviceId
                },
                body: JSON.stringify({ sessionId, question, answer, action: 'save' })
            })
        } catch (e) {
            console.error('Failed to save history:', e)
        }
    }, [sessionId])

    // 取消请求
    const cancelRequest = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
    }, [])

    // 发送追问（流式 + 自动重试）
    const sendFollowUp = useCallback(async (question: string) => {
        if (isLoading || isComplete) return

        cancelRequest()

        // 添加用户消息和空的助手消息占位
        setMessages(prev => {
            const cleaned = prev.filter(m => !m.isError)
            if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === 'user' && cleaned[cleaned.length - 1].content === question) {
                return [...cleaned, { role: 'assistant', content: '' }]
            }
            return [...cleaned, { role: 'user', content: question }, { role: 'assistant', content: '' }]
        })

        lastFailedQuestionRef.current = question
        setSuggestedQuestions([])
        setInputValue('')
        setIsLoading(true)

        const abortController = new AbortController()
        abortRef.current = abortController

        const systemPrompt = buildFollowUpPrompt(question)
        let lastError: any = null

        // 重试循环（与 useGeminiAPI.ts 一致）
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (abortController.signal.aborted) break

                const response = await fetch('/api/gemini?fast=1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                        safetySettings: [
                            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
                        ],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
                    }),
                    signal: abortController.signal,
                })

                // 遇到 503/429 过载，等待后重试
                if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
                    const waitMs = attempt * 3000  // 3s, 6s
                    console.warn(`[FollowUp Retry ${attempt}/${MAX_RETRIES}] API 过载 (${response.status})，${waitMs / 1000}s 后重试...`)
                    await new Promise(r => setTimeout(r, waitMs))
                    continue
                }

                if (!response.ok) {
                    const errText = await response.text()
                    throw new Error(`HTTP ${response.status}: ${errText}`)
                }
                if (!response.body) throw new Error('No response body')

                // 流式读取（buffer-based，更健壮）
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''
                let fullText = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''  // 保留不完整的最后一行

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue
                        const jsonStr = line.slice(6).trim()
                        if (!jsonStr || jsonStr === '[DONE]') continue
                        try {
                            const data = JSON.parse(jsonStr)
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
                            if (text) {
                                fullText += text
                                // 实时更新 UI，隐藏末尾的 JSON 块
                                const displayText = fullText.replace(/```json[\s\S]*$/, '')
                                setMessages(prev => {
                                    const newMsgs = [...prev]
                                    const lastMsg = newMsgs[newMsgs.length - 1]
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        lastMsg.content = displayText
                                    }
                                    return newMsgs
                                })
                            }
                        } catch { /* SSE parse error, skip */ }
                    }
                }

                // 处理 buffer 中剩余数据
                if (buffer.startsWith('data: ')) {
                    const jsonStr = buffer.slice(6).trim()
                    if (jsonStr && jsonStr !== '[DONE]') {
                        try {
                            const data = JSON.parse(jsonStr)
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
                            if (text) fullText += text
                        } catch { /* ignore */ }
                    }
                }

                // 提取建议问题
                const jsonMatch = fullText.match(/```json\s*\n?([\s\S]*?)\n?\s*```/)
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1])
                        if (parsed.suggested_questions && Array.isArray(parsed.suggested_questions)) {
                            setSuggestedQuestions(parsed.suggested_questions)
                        }
                    } catch { /* ignore */ }
                }

                // 最终展示文本（去掉 JSON 块）
                const finalCleanText = fullText.replace(/```json[\s\S]*?```/g, '').trim()
                setMessages(prev => {
                    const newMsgs = [...prev]
                    const lastMsg = newMsgs[newMsgs.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = finalCleanText
                    }
                    return newMsgs
                })

                // 异步保存记录（不影响用户体验）
                saveFollowUpToHistory(question, finalCleanText)

                lastFailedQuestionRef.current = null
                setTurnCount(prev => prev + 1)
                if (turnCountRef.current + 1 >= MAX_FOLLOW_UPS) setIsComplete(true)

                setIsLoading(false)
                abortRef.current = null
                return  // 成功，退出重试循环

            } catch (e: any) {
                if (e?.name === 'AbortError') {
                    setIsLoading(false)
                    abortRef.current = null
                    return
                }
                lastError = e
                if (attempt < MAX_RETRIES) {
                    const waitMs = attempt * 3000
                    console.warn(`[FollowUp Retry ${attempt}/${MAX_RETRIES}] 错误: ${e.message}，${waitMs / 1000}s 后重试...`)
                    await new Promise(r => setTimeout(r, waitMs))
                }
            }
        }

        // 全部重试失败
        console.error('Follow-up error (all retries failed):', lastError)
        setMessages(prev => {
            const newMsgs = [...prev]
            const lastMsg = newMsgs[newMsgs.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
                return [...prev.slice(0, -1), { role: 'assistant', content: '网络错误，请点击重试。', isError: true }]
            }
            return [...prev, { role: 'assistant', content: '网络错误，请点击重试。', isError: true }]
        })
        setIsLoading(false)
        abortRef.current = null
    }, [isLoading, isComplete, buildFollowUpPrompt, saveFollowUpToHistory, cancelRequest, sessionId, originalQuestion, cards, personality, initialReading])

    // 重试
    const handleRetry = useCallback(() => {
        const lastQ = lastFailedQuestionRef.current
        if (lastQ) sendFollowUp(lastQ)
    }, [sendFollowUp])

    const handleSubmit = () => {
        if (inputValue.trim()) sendFollowUp(inputValue.trim())
    }

    const lastMessage = messages[messages.length - 1]
    const hasError = lastMessage?.isError === true

    return (
        <motion.div
            className="mt-6 border-t border-white/10 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
        >
            {!isExpanded ? (
                <motion.button
                    onClick={() => setIsExpanded(true)}
                    className="w-full py-3 border border-purple-500/40 text-purple-300 rounded-xl hover:bg-purple-500/10 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <span>💬</span>
                    <span>想深入了解？点击开启追问</span>
                    <span className="text-xs text-gray-500">（最多 {MAX_FOLLOW_UPS} 次）</span>
                </motion.button>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-purple-300/80">
                        <span>💬</span>
                        <span>深度追问</span>
                        <span className="text-xs text-gray-500">({turnCount}/{MAX_FOLLOW_UPS} 次)</span>
                    </div>

                    {/* 消息列表 */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        <AnimatePresence>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={`${i}-${msg.isError}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3 rounded-xl text-sm ${msg.role === 'user'
                                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-100 ml-8'
                                        : msg.isError
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-200 mr-8'
                                            : 'bg-white/5 border border-white/10 text-starlight/90 mr-8'
                                        }`}
                                >
                                    <span className="text-xs text-gray-500 mb-1 block">
                                        {msg.role === 'user' ? '你的追问' : msg.isError ? '⚠️ 出了点问题' : '🔮 解读'}
                                    </span>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    {msg.isError && !isLoading && (
                                        <motion.button
                                            onClick={handleRetry}
                                            className="mt-2 px-4 py-1.5 text-xs bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            🔄 重试
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 bg-white/5 rounded-xl text-sm text-gray-400 mr-8"
                            >
                                <div className="flex items-center justify-between">
                                    <motion.span
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        ✨ 正在解读...
                                    </motion.span>
                                    <button
                                        onClick={cancelRequest}
                                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {suggestedQuestions.length > 0 && !isComplete && !hasError && (
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => sendFollowUp(q)}
                                    disabled={isLoading}
                                    className="px-3 py-2 text-xs bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-200 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                                >
                                    {q}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {!isComplete && turnCount < MAX_FOLLOW_UPS && !hasError && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                placeholder="输入你的追问..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !inputValue.trim()}
                                className="px-4 py-2 text-sm bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-200 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                            >
                                发送
                            </button>
                        </div>
                    )}

                    {isComplete && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-gray-400 py-2">
                            ✨ 本次占卜的追问已结束，如需继续请开始新的占卜
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    )
}

export default FollowUpChat
