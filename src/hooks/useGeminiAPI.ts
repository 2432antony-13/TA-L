// useGeminiAPI.ts - Gemini API 集成 Hook
import { useState, useCallback, useRef, useEffect } from 'react'

interface TarotReadingRequest {
    cards: {
        name: string
        isReversed: boolean
        position: string  // 过去/现在/未来
    }[]
    question: string
    personality: 'T' | 'F' | null  // 用户性格类型
}

interface UseGeminiAPIResult {
    getReading: (request: TarotReadingRequest) => Promise<void>
    isLoading: boolean
    isStreaming: boolean
    error: string | null
    result: {
        thinking: string
        reading: string
        suggestedQuestions: string[]
    }
    resetResult: () => void
}

// 流式 API 路径
const GEMINI_API_URL = `/api/gemini`
const HISTORY_API_URL = `/api/history`

// 获取或生成设备 UUID
function getDeviceUUID(): string {
    let uuid = localStorage.getItem('tarot_device_uuid')
    if (!uuid) {
        uuid = crypto.randomUUID()
        localStorage.setItem('tarot_device_uuid', uuid)
    }
    return uuid
}

export function useGeminiAPI(): UseGeminiAPIResult {
    const [isLoading, setIsLoading] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState({ thinking: '', reading: '', suggestedQuestions: [] as string[] })

    // 用于中断请求
    const abortControllerRef = useRef<AbortController | null>(null)
    const deviceIdRef = useRef<string>('')

    useEffect(() => {
        deviceIdRef.current = getDeviceUUID()
    }, [])

    const getReading = useCallback(async (request: TarotReadingRequest) => {
        setIsLoading(true)
        setIsStreaming(false)
        setError(null)
        setResult({ thinking: '', reading: '', suggestedQuestions: [] })

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        // 全局超时：120 秒后自动中断
        const globalTimeout = setTimeout(() => {
            abortControllerRef.current?.abort()
        }, 120000)

        const prompt = buildTarotPrompt(request)
        const deviceId = deviceIdRef.current

        let fullText = ''
        let finalThinking = ''
        let finalReading = ''

        const MAX_RETRIES = 3
        let lastError: any = null

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Device-Id': deviceId
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        safetySettings: [
                            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
                        ],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 4096,
                        }
                    }),
                    signal: abortControllerRef.current.signal
                })

                // 503 / 429 过载：等待后重试
                if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
                    const waitMs = attempt * 2000  // 2s, 4s, 6s
                    console.warn(`[Retry ${attempt}/${MAX_RETRIES}] 模型过载 (${response.status})，${waitMs / 1000}秒后重试...`)
                    await new Promise(r => setTimeout(r, waitMs))
                    continue
                }

                setIsLoading(false)
                setIsStreaming(true)

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }))

                    // 专门处理 504 超时
                    if (response.status === 504) {
                        throw new Error('请求超时 (504)。AI 思考时间过长，请稍后再试或简化问题。')
                    }

                    throw new Error(errorData.error?.message || `请求失败 (${response.status})`)
                }

                if (!response.body) throw new Error('ReadableStream not supported')

                const reader = response.body.getReader()

                await processGeminiStream(reader, (textDelta) => {
                    fullText += textDelta

                    const thinkingMatch = fullText.match(/<Thinking>([\s\S]*?)<\/Thinking>/)
                    if (thinkingMatch) {
                        finalThinking = thinkingMatch[1]
                        finalReading = fullText.replace(/<Thinking>[\s\S]*?<\/Thinking>/, '').trim()
                    } else if (fullText.includes('<Thinking>')) {
                        const start = fullText.indexOf('<Thinking>') + 10
                        finalThinking = fullText.slice(start)
                        finalReading = ''
                    } else {
                        finalReading = fullText
                    }

                    setResult({ thinking: finalThinking, reading: finalReading, suggestedQuestions: [] })
                })

                clearTimeout(globalTimeout)
                setIsStreaming(false)

                // 解析追问建议
                let suggestions: string[] = []
                const jsonMatch = fullText.match(/```json\s*\n?([\s\S]*?)\n?\s*```/)
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1])
                        suggestions = parsed.suggested_questions || []
                    } catch (e) { /* ignore parse error */ }
                }

                // 移除 JSON 块
                if (suggestions.length > 0) {
                    finalReading = finalReading.replace(/```json[\s\S]*?```/, '').trim()
                }

                setResult({ thinking: finalThinking, reading: finalReading, suggestedQuestions: suggestions })

                // 保存历史记录
                if (finalReading) {
                    await saveHistory(request, finalReading, finalThinking, deviceId)
                }

                return  // 成功，退出重试循环

            } catch (err: any) {
                if (err.name === 'AbortError') {
                    clearTimeout(globalTimeout)
                    if (finalReading.trim().length > 50) {
                        setResult({ thinking: finalThinking, reading: finalReading + '\n\n⚠️ 解读可能不完整，连接已中断。', suggestedQuestions: [] })
                    }
                    setIsStreaming(false)
                    setIsLoading(false)
                    return
                }
                lastError = err
                if (attempt < MAX_RETRIES) {
                    const waitMs = attempt * 2000
                    console.warn(`[Retry ${attempt}/${MAX_RETRIES}] 错误: ${err.message}，${waitMs / 1000}秒后重试...`)
                    await new Promise(r => setTimeout(r, waitMs))
                }
            }
        }

        // 所有重试均失败
        clearTimeout(globalTimeout)
        setError(lastError?.message || '网络请求错误')
        setIsStreaming(false)
        setIsLoading(false)
        throw lastError
    }, [])

    const resetResult = useCallback(() => {
        setResult({ thinking: '', reading: '', suggestedQuestions: [] })
    }, [])

    return { getReading, isLoading, isStreaming, error, result, resetResult }
}

// 保存历史记录
async function saveHistory(request: TarotReadingRequest, reading: string, thinking: string, deviceId: string) {
    try {
        await fetch(HISTORY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-Id': deviceId
            },
            body: JSON.stringify({
                timestamp: Date.now(),
                question: request.question,
                personality: request.personality,
                cards: request.cards,
                reading: reading,
                thinking: thinking
            })
        })
    } catch (e) {
        console.error('Failed to save history:', e)
    }
}

// ----------------------------------------------------------------------

async function processGeminiStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onText: (text: string) => void
) {
    const decoder = new TextDecoder()
    let buffer = ''
    const CHUNK_TIMEOUT = 30000 // 单个 chunk 最多等 30 秒

    while (true) {
        // 为每个 chunk 设置超时，防止流挂起
        const readPromise = reader.read()
        const timeoutPromise = new Promise<{ done: true, value: undefined }>((resolve) => {
            setTimeout(() => resolve({ done: true, value: undefined }), CHUNK_TIMEOUT)
        })

        const { done, value } = await Promise.race([readPromise, timeoutPromise])
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim()
                if (jsonStr === '[DONE]' || !jsonStr) continue
                try {
                    const data = JSON.parse(jsonStr)
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                    if (text) onText(text)
                } catch (e) {
                    console.warn('SSE parse error:', e)
                }
            }
        }
    }

    if (buffer.trim() && buffer.startsWith('data: ')) {
        const jsonStr = buffer.slice(6).trim()
        if (jsonStr && jsonStr !== '[DONE]') {
            try {
                const data = JSON.parse(jsonStr)
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) onText(text)
            } catch (e) { /* ignore */ }
        }
    }
}

// ----------------------------------------------------------------------

function buildTarotPrompt(request: TarotReadingRequest): string {
    const basePrompt = request.personality === 'T'
        ? buildPromptForT
        : buildPromptForF

    const cardDescriptions = request.cards.map((card, index) => {
        const positions = ['过去', '现在', '未来']
        return `${positions[index]}位：${card.name}（${card.isReversed ? '逆位' : '正位'}）`
    }).join('\n')

    return basePrompt(request.question, cardDescriptions)
}

const SYSTEM_INSTRUCTION = `
STRICT RULES:
1. <Thinking> block: ≤50 Chinese characters. Only 1-2 key insights. No bullet lists.
2. Reading: Each section ≤40 Chinese characters. Be direct and concise.
3. End with EXACTLY this JSON (2 questions in Chinese):
\`\`\`json
{"suggested_questions": ["追问1", "追问2"]}
\`\`\`
`

function buildPromptForT(question: string, cardDescriptions: string): string {
    return `
${SYSTEM_INSTRUCTION}

你是塔罗理性顾问，只关注事实与利弊，禁用玄学/感性词汇，语气冷静专业。

用户提问：${question}
牌面：${cardDescriptions}

<Thinking>（此处填写，≤50字的核心洞察）</Thinking>

## 局势研判
- 核心矛盾：
- 趋势：

## 风险
- 显性：
- 隐性：

## 行动建议
1.
2.
`
}

function buildPromptForF(question: string, cardDescriptions: string): string {
    return `
${SYSTEM_INSTRUCTION}

你是塔罗心灵疗愈师，温柔共情，用画面和意象说话，不预测吉凶，不说教。

用户提问：${question}
牌面：${cardDescriptions}

<Thinking>（此处填写，≤50字的核心洞察）</Thinking>

## 心的共鸣
我感觉到...

## 牌面故事
[用一个意象串联三张牌]
## 温柔提醒
[向内探索的建议]
`
}

export default useGeminiAPI
