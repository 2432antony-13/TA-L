import { useCallback, useEffect, useRef, useState } from 'react'
import type { Language } from '../i18n/LanguageContext'

interface TarotReadingRequest {
  cards: {
    name: string
    isReversed: boolean
    position: string
  }[]
  question: string
  personality: 'T' | 'F' | null
  interviewProfile?: string
  language: Language
}

interface UseAIReadingResult {
  getReading: (request: TarotReadingRequest) => Promise<string | null>
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  result: {
    reading: string
    suggestedQuestions: string[]
  }
  resetResult: () => void
}

const READING_API_URL = '/api/reading'
const HISTORY_API_URL = '/api/history'

function getDeviceUUID(): string {
  let uuid = localStorage.getItem('tarot_device_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID()
    localStorage.setItem('tarot_device_uuid', uuid)
  }
  return uuid
}

export function useAIReading(): UseAIReadingResult {
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState({ reading: '', suggestedQuestions: [] as string[] })
  const abortControllerRef = useRef<AbortController | null>(null)
  const deviceIdRef = useRef('')

  useEffect(() => {
    deviceIdRef.current = getDeviceUUID()
  }, [])

  const getReading = useCallback(async (request: TarotReadingRequest) => {
    setIsLoading(true)
    setIsStreaming(false)
    setError(null)
    setResult({ reading: '', suggestedQuestions: [] })

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    const timeout = setTimeout(() => abortControllerRef.current?.abort(), 120_000)
    const prompt = buildTarotPrompt(request)
    const deviceId = deviceIdRef.current
    const isChinese = request.language === 'zh-CN'
    let fullText = ''
    let finalReading = ''
    let lastError: unknown = null

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(READING_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            language: request.language,
          }),
          signal: abortControllerRef.current.signal,
        })

        if ((response.status === 429 || response.status === 503) && attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2_000))
          continue
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }))
          if (response.status === 504) {
            throw new Error(isChinese ? '请求超时，请稍后再试或简化问题。' : 'The request timed out. Please retry or simplify the question.')
          }
          throw new Error(data.error?.message || `Request failed (${response.status})`)
        }

        if (!response.body) throw new Error('Streaming is not supported by this browser.')

        setIsLoading(false)
        setIsStreaming(true)
        await processAIStream(response.body.getReader(), textDelta => {
          fullText += textDelta
          finalReading = fullText
          setResult({ reading: finalReading, suggestedQuestions: [] })
        })

        clearTimeout(timeout)
        setIsStreaming(false)

        const suggestions = extractSuggestions(fullText)
        if (suggestions.length > 0) {
          finalReading = fullText.replace(/```json[\s\S]*?```/, '').trim()
        }
        setResult({ reading: finalReading, suggestedQuestions: suggestions })

        if (finalReading) {
          return await saveHistory(request, finalReading, deviceId)
        }
        return null
      } catch (caughtError) {
        const err = caughtError as Error
        if (err.name === 'AbortError') {
          clearTimeout(timeout)
          if (finalReading.trim().length > 50) {
            const suffix = isChinese
              ? '\n\n> 解读可能不完整，连接已中断。'
              : '\n\n> This reading may be incomplete because the connection ended.'
            setResult({ reading: finalReading + suffix, suggestedQuestions: [] })
          }
          setIsStreaming(false)
          setIsLoading(false)
          return null
        }

        if (err.message === 'stream-timeout') {
          clearTimeout(timeout)
          setError(isChinese ? '流式响应超时，请重试。' : 'The streaming response timed out. Please retry.')
          setIsStreaming(false)
          setIsLoading(false)
          return null
        }

        lastError = err
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, attempt * 2_000))
        }
      }
    }

    clearTimeout(timeout)
    const finalError = lastError instanceof Error ? lastError : new Error(isChinese ? '网络请求错误' : 'Network request failed')
    setError(finalError.message)
    setIsStreaming(false)
    setIsLoading(false)
    throw finalError
  }, [])

  const resetResult = useCallback(() => {
    abortControllerRef.current?.abort()
    setResult({ reading: '', suggestedQuestions: [] })
    setError(null)
    setIsLoading(false)
    setIsStreaming(false)
  }, [])

  return { getReading, isLoading, isStreaming, error, result, resetResult }
}

function extractSuggestions(text: string): string[] {
  const jsonMatch = text.match(/```json\s*\n?([\s\S]*?)\n?\s*```/)
  if (!jsonMatch) return []
  try {
    const parsed = JSON.parse(jsonMatch[1])
    return Array.isArray(parsed.suggested_questions)
      ? parsed.suggested_questions.filter((item: unknown): item is string => typeof item === 'string').slice(0, 2)
      : []
  } catch {
    return []
  }
}

async function saveHistory(
  request: TarotReadingRequest,
  reading: string,
  deviceId: string,
): Promise<string | null> {
  try {
    const response = await fetch(HISTORY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        question: request.question,
        personality: request.personality,
        cards: request.cards,
        reading,
        language: request.language,
      }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.record?.id || null
  } catch (saveError) {
    console.error('Failed to save history:', saveError)
    return null
  }
}

async function processAIStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onText: (text: string) => void,
) {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const readPromise = reader.read()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('stream-timeout')), 30_000)
    })
    const { done, value } = await Promise.race([readPromise, timeoutPromise])
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonText = line.slice(6).trim()
      if (!jsonText || jsonText === '[DONE]') continue
      try {
        const data = JSON.parse(jsonText)
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) onText(text)
      } catch {
        // An incomplete SSE line stays in the buffer; malformed provider events are ignored.
      }
    }
  }
}

function buildTarotPrompt(request: TarotReadingRequest): string {
  const isChinese = request.language === 'zh-CN'
  const cards = request.cards
    .map(card => `${card.position}: ${card.name} (${card.isReversed ? (isChinese ? '逆位' : 'reversed') : (isChinese ? '正位' : 'upright')})`)
    .join('\n')

  if (isChinese) {
    return buildChinesePrompt(request, cards)
  }
  return buildEnglishPrompt(request, cards)
}

function buildChinesePrompt(request: TarotReadingRequest, cards: string): string {
  const style = request.personality === 'T'
    ? '理性分析：强调因果、边界、可执行建议，避免空泛安慰。'
    : '深度共情：承认情绪但不迎合，以克制的文学表达帮助用户观察自身处境。'
  const profile = request.interviewProfile
    ? `\n## 用户表达偏好\n${request.interviewProfile}\n请将其仅作为语气与关注重点的参考，不要复述画像，也不要据此推断未提供的事实。\n`
    : ''

  return `# 角色
你是一个以塔罗牌为反思媒介的叙事解读助手，而不是预言者。

# 用户问题
${request.question}

# 牌阵（过去、现在、未来）
${cards}
${profile}
# 回应风格
${style}

# 输出要求
1. 先用一句话说明：以下内容是基于用户问题与牌面象征的解释，不是事实认定或未来保证。
2. 依次写“过去”“现在”“未来”，说明每张牌的象征如何关联用户问题。
3. 写“整体脉络”，只组合用户已提供的信息和牌面象征，不臆测职业、关系、健康、身份或具体事件。
4. 写“可尝试的行动”，给出 2 至 3 个具体、低风险、可自行判断的建议。
5. 对未知信息明确使用“如果”“可能”“可以考虑”等条件表达；不得把推测写成事实。
6. 不预测具体人、事、时间、地点或结果。涉及医疗、心理危机、法律、财务等高风险问题时，提醒寻求合格专业人士。
7. 不展示内部推理过程、思维链或隐藏分析。正文使用简体中文。

最后附上两个简短追问，严格使用以下 JSON 代码块格式：
\`\`\`json
{"suggested_questions":["追问1","追问2"]}
\`\`\``
}

function buildEnglishPrompt(request: TarotReadingRequest, cards: string): string {
  const style = request.personality === 'T'
    ? 'Rational: emphasize causal structure, boundaries, and practical next steps without generic reassurance.'
    : 'Empathetic: acknowledge emotion without flattering the user, using vivid but restrained language to support reflection.'
  const profile = request.interviewProfile
    ? `\n## Communication preferences\n${request.interviewProfile}\nUse this only to tune tone and focus. Do not repeat the profile or infer facts the user did not provide.\n`
    : ''

  return `# Role
You are a reflective narrative assistant that uses tarot symbolism as a prompt, not as fortune-telling.

# User question
${request.question}

# Three-card spread (past, present, future)
${cards}
${profile}
# Response style
${style}

# Output requirements
1. Begin with one sentence stating that the interpretation is based on the question and card symbolism, not a factual finding or guarantee.
2. Explain Past, Present, and Future in order, connecting each card's symbolism to the question.
3. Add an Overall Pattern section. Combine only supplied facts and card symbolism; do not invent a profession, relationship, health condition, identity, or event.
4. Add Practical Options with two or three concrete, low-risk actions the user can evaluate.
5. Mark uncertainty with conditional language such as "if," "may," and "could consider." Never present an inference as fact.
6. Do not predict specific people, events, dates, places, or outcomes. For medical, mental-health crisis, legal, or financial issues, direct the user to a qualified professional.
7. Do not reveal hidden reasoning, chain-of-thought, or internal analysis. Write the response in English.

End with two short follow-up questions in exactly this JSON code-block format:
\`\`\`json
{"suggested_questions":["Question 1","Question 2"]}
\`\`\``
}

export default useAIReading
