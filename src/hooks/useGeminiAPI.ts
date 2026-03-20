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
    interviewProfile?: string  // ENTJ 访谈生成的个性画像
}

interface UseGeminiAPIResult {
    getReading: (request: TarotReadingRequest) => Promise<string | null>
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
                            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
                            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
                        ],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 6000,
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
                    const savedId = await saveHistory(request, finalReading, finalThinking, deviceId)
                    return savedId  // 返回后端生成的 record id
                }

                return null  // 成功但未保存

            } catch (err: any) {
                if (err.name === 'AbortError') {
                    clearTimeout(globalTimeout)
                    if (finalReading.trim().length > 50) {
                        setResult({ thinking: finalThinking, reading: finalReading + '\n\n⚠️ 解读可能不完整，连接已中断。', suggestedQuestions: [] })
                    }
                    setIsStreaming(false)
                    setIsLoading(false)
                    return null
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
async function saveHistory(request: TarotReadingRequest, reading: string, thinking: string, deviceId: string): Promise<string | null> {
    try {
        const res = await fetch(HISTORY_API_URL, {
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
        if (res.ok) {
            const data = await res.json()
            return data.record?.id || null
        }
    } catch (e) {
        console.error('Failed to save history:', e)
    }
    return null
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

    let prompt = basePrompt(request.question, cardDescriptions)

    // 如果有访谈画像，在 # Task 前注入
    if (request.interviewProfile) {
        const profileBlock = `
## 用户个性画像（来自访谈）
${request.interviewProfile}

> 请将以上画像作为理解用户的背景参考，在解读中自然地融入对用户性格特质的理解和共鸣。不要直接复述画像内容，而是让你的语言风格、建议方向和关注重点自然地贴合这个人的特质。
`
        prompt = prompt.replace('# Task', profileBlock + '\n# Task')
    }

    return prompt
}

function buildPromptForT(question: string, cardDescriptions: string): string {
    return `
# Role
你是塔罗解读引擎，当前模式：T（理性分析师）

# Context
## 提问
${question}

## 牌阵
过去·现在·未来三牌阵 | ${cardDescriptions}

# Task
请先在 <Thinking> 标签中简要分析（包括牌面关联、元素分析、逻辑推演），然后进行正式解读。

<Thinking>
...简要分析思考过程...
</Thinking>

## 1. 客观局势剖析
## 2. 逻辑演进脉络
## 3. 务实行动策略

风格要求：
- 保持高度的客观与理性，注重因果关系的分析与元素生克的推演。
- 语言风格严谨、冷峻、务实，拒绝任何情绪化的感性宣泄或过度安慰。
- 整体篇幅需详实，在“逻辑演进脉络”中必须逐一详细推演“过去、现在、未来”的发展轨迹（结构深度对标详细的情感解读，但内核为纯粹的逻辑拆解）。

# Constraints
- 不预测具体人事时地物
- 敏感话题追加求助资源
- 保持可能性语气，禁用"一定/必然/绝对"

最后附上2个建议追问（JSON格式）：
\`\`\`json
{"suggested_questions": ["追问1", "追问2"]}
\`\`\`
`
}

function buildPromptForF(question: string, cardDescriptions: string): string {
    return `
# Role
你是塔罗解读引擎，当前模式：F（心灵疗愈师）

# Context
## 提问
${question}

## 牌阵
过去·现在·未来三牌阵 | ${cardDescriptions}

# Task
请先在 <Thinking> 标签中感受用户的能量场和牌面传达的情绪（包括色彩、直觉、情感链接），然后进行正式解读。

<Thinking>
...简要感受和思考...
</Thinking>

## 1. 过去：情绪的源头与释放
## 2. 现在：当下的共鸣与觉察
## 3. 未来：心灵的走向与微光
## 4. 疗愈与前行的建议

风格要求：
- 保持深度的共情与倾听感，注重情绪的疗愈与直觉的引导，像一位温暖的心理咨询师。
- 语言风格温柔、包容、充满力量，每一段可以使用1个轻柔的问句来引导用户自我觉察。
- 整体篇幅需详实，必须逐一详细解读“过去”、“现在”、“未来”三张牌背后的情绪流动规律与潜意识暗示。
- 第4部分“疗愈与前行的建议”中，请结合牌面给出 2-3 个具体、具有落地性且贴近生活的“自我疗愈小行动”（比如写日记、做特定的冥想、或是放下某一种执念等），实实在在地帮助用户。

# Constraints
- 不预测具体人事时地物
- 敏感话题追加求助资源
- 保持可能性语气，禁用"一定/必然/绝对"

最后附上2个建议追问（JSON格式）：
\`\`\`json
{"suggested_questions": ["追问1", "追问2"]}
\`\`\`
`
}

export default useGeminiAPI
