import { Redis } from '@upstash/redis'

export const config = {
    runtime: 'edge',
}

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
    return url && token ? new Redis({ url, token }) : null
}

async function enforceRateLimit(req, isFast) {
    const redis = getRedis()
    if (!redis) return { allowed: true, remaining: null }

    const deviceId = req.headers.get('x-device-id')
    const forwardedIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const identifier = (deviceId || forwardedIp || 'unknown').slice(0, 128)
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identifier))
    const hash = Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 24)
    const day = new Date().toISOString().slice(0, 10)
    const limit = isFast ? 100 : 25
    const key = `reading_rate:${isFast ? 'fast' : 'full'}:${day}:${hash}`

    try {
        const count = await redis.incr(key)
        if (count === 1) await redis.expire(key, 90_000)
        return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
    } catch (error) {
        console.error('Rate-limit storage error:', error)
        return { allowed: true, remaining: null }
    }
}

function extractPrompt(body) {
    if (!body) return ''
    if (typeof body === 'string') return body
    if (Array.isArray(body.messages)) return body.messages
    if (Array.isArray(body.contents)) {
        return body.contents
            .flatMap(content => content.parts || [])
            .map(part => part.text)
            .filter(Boolean)
            .join('\n')
    }
    return JSON.stringify(body)
}

function getCorsHeaders(req) {
    const configuredOrigins = (process.env.ALLOWED_ORIGIN || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
    const allowedOrigins = [
        'https://taro-sepia.vercel.app',
        'https://www.taro24.fun',
        'https://taro24.fun',
        ...configuredOrigins,
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:5176',
    ]
    const origin = req.headers.get('origin')
    return {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id, X-Follow-Up',
        'Vary': 'Origin',
    }
}

function transformDeepSeekStream(stream) {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let buffer = ''
    let sentDone = false

    return stream.pipeThrough(new TransformStream({
        transform(chunk, controller) {
            buffer += decoder.decode(chunk, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
                const event = line.trim()
                if (!event) continue
                if (event === 'data: [DONE]') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    sentDone = true
                    continue
                }
                if (!event.startsWith('data: ')) continue

                try {
                    const data = JSON.parse(event.slice(6))
                    // reasoning_content is intentionally not forwarded to the browser.
                    const text = data.choices?.[0]?.delta?.content
                    if (!text) continue
                    const payload = {
                        candidates: [{ content: { parts: [{ text }] } }],
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
                } catch {
                    // Ignore provider keep-alive or malformed events.
                }
            }
        },
        flush(controller) {
            if (!sentDone) controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        },
    }))
}

export default async function handler(req) {
    const corsHeaders = getCorsHeaders(req)
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const url = new URL(req.url)
        const isFast = url.searchParams.get('fast') === '1'
        const rateLimit = await enforceRateLimit(req, isFast)
        if (!rateLimit.allowed) {
            const isChinese = body.language !== 'en'
            return new Response(JSON.stringify({
                error: {
                    message: isChinese
                        ? '今日 AI 请求次数已达上限，请明日再试。'
                        : 'Today’s AI request limit has been reached. Please return tomorrow.',
                },
            }), {
                status: 429,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Retry-After': '3600',
                },
            })
        }
        const rateHeaders = rateLimit.remaining === null
            ? {}
            : { 'X-RateLimit-Remaining': String(rateLimit.remaining) }
        const deepSeekKey = process.env.DEEPSEEK_API_KEY
        const geminiKey = process.env.GEMINI_API_KEY

        if (deepSeekKey && deepSeekKey !== 'your_deepseek_api_key_here') {
            const model = process.env.DEEPSEEK_MODEL || process.env.VITE_DEEPSEEK_MODEL || 'deepseek-v4-flash'
            const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
            const prompt = extractPrompt(body)
            const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }]
            const requestPayload = {
                model,
                messages,
                stream: true,
                thinking: { type: isFast ? 'disabled' : 'enabled' },
                max_tokens: isFast ? 1800 : 6000,
                ...(isFast
                    ? { temperature: 0.7 }
                    : { reasoning_effort: process.env.DEEPSEEK_REASONING_EFFORT || 'high' }),
            }

            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepSeekKey}`,
                },
                body: JSON.stringify(requestPayload),
            })

            if (!response.ok) {
                const providerError = await response.text()
                console.error('DeepSeek API error:', response.status, providerError.slice(0, 500))
                return new Response(JSON.stringify({
                    error: { message: `DeepSeek request failed (${response.status})` },
                }), {
                    status: response.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            return new Response(transformDeepSeekStream(response.body), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'X-Accel-Buffering': 'no',
                    'X-AI-Model': model,
                    ...rateHeaders,
                },
            })
        }

        if (!geminiKey) {
            return new Response(JSON.stringify({
                error: { message: 'DEEPSEEK_API_KEY is not configured.' },
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const model = isFast ? 'gemini-2.5-flash' : (process.env.GEMINI_MODEL || 'gemini-2.5-flash')
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`
        const response = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: body.contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: isFast ? 1800 : 6000,
                },
            }),
        })

        if (!response.ok) {
            const providerError = await response.text()
            console.error('Gemini API error:', response.status, providerError.slice(0, 500))
            return new Response(JSON.stringify({
                error: { message: `Fallback request failed (${response.status})` },
            }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        return new Response(response.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'X-Accel-Buffering': 'no',
                'X-AI-Model': model,
                ...rateHeaders,
            },
        })
    } catch (error) {
        console.error('Reading API error:', error)
        return new Response(JSON.stringify({
            error: { message: 'Internal Server Error' },
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
}
