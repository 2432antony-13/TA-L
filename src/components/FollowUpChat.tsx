// FollowUpChat.tsx — 追问聊天组件（流式版，带重试）
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

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
const MAX_RETRIES = 3

export function FollowUpChat({
    sessionId,
    originalQuestion,
    cards,
    personality,
    initialReading,
    initialSuggestions,
}: FollowUpChatProps) {
    const { language, t } = useLanguage()
    const [messages, setMessages] = useState<FollowUpMessage[]>([])
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(initialSuggestions)
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [turnCount, setTurnCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const messagesRef = useRef(messages)
    const turnCountRef = useRef(turnCount)
    const lastFailedQuestionRef = useRef<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        messagesRef.current = messages
        turnCountRef.current = turnCount
    }, [messages, turnCount])

    // 构建追问 prompt
    const buildFollowUpPrompt = useCallback((question: string) => {
        const isChinese = language === 'zh-CN'
        const positions = [t('past'), t('present'), t('future')]
        const cardDesc = cards.map((c, i) => {
            return `${positions[i]}: ${c.name} (${c.isReversed ? t('reversed') : t('upright')})`
        }).join('\n')

        const validMessages = messagesRef.current.filter(m => !m.isError)
        const prevFollowUps: { q: string; a: string }[] = []
        for (let i = 0; i < validMessages.length - 1; i++) {
            if (validMessages[i].role === 'user' && validMessages[i + 1]?.role === 'assistant') {
                prevFollowUps.push({ q: validMessages[i].content, a: validMessages[i + 1].content })
            }
        }

        const prevContext = prevFollowUps
            .map((f, i) => isChinese
                ? `追问${i + 1}：${f.q}\n回答${i + 1}：${f.a}`
                : `Follow-up ${i + 1}: ${f.q}\nAnswer ${i + 1}: ${f.a}`)
            .join('\n\n')

        const safeInitialReading = (initialReading || '').substring(0, 300) + '...'

        if (isChinese) {
            return `你是一个以塔罗牌为反思媒介的叙事助手，不是预言者。
用户正在对先前解读发起追问。
【原始问题】${originalQuestion}
【牌面】${cardDesc}
【初始解读摘要】${safeInitialReading}
${prevContext ? `【前期追问】\n${prevContext}` : ''}

用户的具体追问：${question}

要求：
1. 100-200 字，直接回应，不寒暄。
2. 结合用户明确提供的信息和牌面象征，给出一个核心观察及其理由。
3. 不得把推测当事实，不预测具体结果，不展示内部思维链。
4. ${personality === 'T' ? '偏重清晰、务实、可执行。' : '承认情绪但不迎合，表达温和而具体。'}
5. ${turnCountRef.current < 2
                ? `最后给出 2 个建议追问（JSON格式）：\n\`\`\`json\n{"suggested_questions": ["问题1", "问题2"]}\n\`\`\``
                : '最后一次追问，无需建议。'}
`
        }

        return `You are a reflective narrative assistant using tarot symbolism as a prompt, not a fortune-teller.
The user is asking a follow-up to an earlier reading.
Original question: ${originalQuestion}
Cards:
${cardDesc}
Initial reading excerpt: ${safeInitialReading}
${prevContext ? `Earlier follow-ups:\n${prevContext}` : ''}

User follow-up: ${question}

Requirements:
1. Respond directly in 90-160 words without an introduction.
2. Use only supplied information and card symbolism to offer one central observation and its rationale.
3. Do not present inference as fact, predict a specific result, or reveal hidden chain-of-thought.
4. ${personality === 'T' ? 'Be clear, practical, and actionable.' : 'Acknowledge emotion without flattering the user; stay warm and specific.'}
5. ${turnCountRef.current < 2
                ? `End with two suggested questions in this JSON block:\n\`\`\`json\n{"suggested_questions":["Question 1","Question 2"]}\n\`\`\``
                : 'This is the final follow-up; do not suggest more questions.'}
`
    }, [cards, originalQuestion, initialReading, language, personality, t])

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
                body: JSON.stringify({ sessionId, question, answer, action: 'save', language })
            })
        } catch (e) {
            console.error('Failed to save history:', e)
        }
    }, [sessionId, language])

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

        // Retry transient provider failures.
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (abortController.signal.aborted) break

                const response = await fetch('/api/reading?fast=1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Device-Id': localStorage.getItem('tarot_device_uuid') || '',
                    },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                        language,
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
                return [...prev.slice(0, -1), { role: 'assistant', content: t('networkRetry'), isError: true }]
            }
            return [...prev, { role: 'assistant', content: t('networkRetry'), isError: true }]
        })
        setIsLoading(false)
        abortRef.current = null
    }, [isLoading, isComplete, buildFollowUpPrompt, saveFollowUpToHistory, cancelRequest, language, t])

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
                    <span>{t('followUpOpen')}</span>
                    <span className="text-xs text-gray-500">{t('followUpLimit', { count: MAX_FOLLOW_UPS })}</span>
                </motion.button>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-purple-300/80">
                        <span>💬</span>
                        <span>{t('followUpTitle')}</span>
                        <span className="text-xs text-gray-500">{t('followUpCount', { current: turnCount, max: MAX_FOLLOW_UPS })}</span>
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
                                        {msg.role === 'user' ? t('yourFollowUp') : msg.isError ? t('followUpErrorTitle') : t('interpretation')}
                                    </span>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    {msg.isError && !isLoading && (
                                        <motion.button
                                            onClick={handleRetry}
                                            className="mt-2 px-4 py-1.5 text-xs bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-200 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {t('retry')}
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
                                        {t('followUpLoading')}
                                    </motion.span>
                                    <button
                                        onClick={cancelRequest}
                                        className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                                    >
                                        {t('cancel')}
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
                                placeholder={t('followUpPlaceholder')}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !inputValue.trim()}
                                className="px-4 py-2 text-sm bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-200 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                            >
                                {t('send')}
                            </button>
                        </div>
                    )}

                    {isComplete && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-gray-400 py-2">
                            {t('followUpComplete')}
                        </motion.div>
                    )}
                </div>
            )}
        </motion.div>
    )
}

export default FollowUpChat
