import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

// ============================================
// IP 速率限制配置
// ============================================
const DAILY_LIMIT = 50  // 每个 IP 每天最多请求次数
const ipUsageMap = new Map<string, { count: number; date: string }>()

// 获取客户端真实 IP（支持 cpolar 等反向代理）
function getClientIP(req: IncomingMessage): string {
  // 优先读取 X-Forwarded-For（cpolar/nginx 等代理会设置这个头）
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    // X-Forwarded-For 可能是逗号分隔的多个 IP，取第一个（最原始的客户端 IP）
    const ips = (Array.isArray(forwarded) ? forwarded[0] : forwarded).split(',')
    return ips[0].trim()
  }
  // 其次读取 X-Real-IP
  const realIP = req.headers['x-real-ip']
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP
  }
  // 最后读取 socket 的远程地址
  return req.socket.remoteAddress || 'unknown'
}

// 获取今天的日期字符串（用于判断是否跨天）
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]  // e.g. "2026-02-01"
}

// 检查并更新 IP 使用量
function checkAndUpdateUsage(ip: string): { allowed: boolean; remaining: number } {
  const today = getTodayStr()
  const usage = ipUsageMap.get(ip)

  if (!usage || usage.date !== today) {
    // 新的一天，重置计数
    ipUsageMap.set(ip, { count: 1, date: today })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }

  if (usage.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  usage.count++
  return { allowed: true, remaining: DAILY_LIMIT - usage.count }
}

// 速率限制中间件插件
function rateLimitPlugin(): PluginOption {
  return {
    name: 'rate-limit-middleware',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // 只对 Gemini API 请求进行限制
        if (req.url?.startsWith('/api/gemini')) {
          // 追问请求不计入配额
          const isFollowUp = req.headers['x-follow-up'] === 'true'
          if (isFollowUp) {
            next()
            return
          }
          const ip = getClientIP(req)
          const { allowed, remaining } = checkAndUpdateUsage(ip)

          console.log(`[Rate Limit] IP: ${ip}, 今日剩余: ${remaining}, 允许: ${allowed}`)

          if (!allowed) {
            res.statusCode = 429
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              error: {
                code: 429,
                message: '今日占卜次数已用尽（每日限 10 次）。明天再来吧~ 🌙',
                status: 'RATE_LIMITED'
              }
            }))
            return
          }

          // 添加剩余次数到响应头（前端可以读取并展示）
          res.setHeader('X-RateLimit-Remaining', remaining.toString())
        }

        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载 .env 文件中的环境变量（VITE_ 前缀的变量）
  const env = loadEnv(mode, process.cwd(), '')
  const deepseekKey = env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || ''
  const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''
  const geminiModel = env.VITE_GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.0-flash'
  const deepseekModel = env.DEEPSEEK_MODEL || env.VITE_DEEPSEEK_MODEL || 'deepseek-chat'

  if (deepseekKey && deepseekKey !== 'your_deepseek_api_key_here') {
    console.log(`✅ 已加载 DeepSeek API Key，模型: ${deepseekModel}`)
  } else if (geminiKey) {
    console.log(`⚠️ 使用 Gemini API Key 作为备用，模型: ${geminiModel}`)
  } else {
    console.warn('⚠️ 未找到有效 API Key (DEEPSEEK_API_KEY / VITE_GEMINI_API_KEY)')
    console.warn('   请在项目根目录 .env 文件中填写 DEEPSEEK_API_KEY=你的Key')
  }

  // 本地开发 DeepSeek 代理中间件
  const deepseekMiddlewarePlugin = (): PluginOption => ({
    name: 'deepseek-proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url?.startsWith('/api/gemini') && req.method === 'POST') {
          const currentDeepseekKey = env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || ''
          if (currentDeepseekKey && currentDeepseekKey !== 'your_deepseek_api_key_here') {
            let bodyStr = ''
            req.on('data', chunk => { bodyStr += chunk })
            req.on('end', async () => {
              try {
                const reqJson = JSON.parse(bodyStr || '{}')
                let prompt = ''
                if (reqJson.contents && Array.isArray(reqJson.contents)) {
                  const parts = reqJson.contents.flatMap((c: any) => c.parts || [])
                  prompt = parts.map((p: any) => p.text).filter(Boolean).join('\n')
                } else {
                  prompt = JSON.stringify(reqJson)
                }

                const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentDeepseekKey}`
                  },
                  body: JSON.stringify({
                    model: deepseekModel,
                    messages: [{ role: 'user', content: prompt }],
                    stream: true,
                    temperature: reqJson.generationConfig?.temperature || 0.7,
                  })
                })

                if (!dsRes.ok) {
                  const errText = await dsRes.text()
                  res.statusCode = dsRes.status
                  res.setHeader('Content-Type', 'application/json')
                  res.end(errText)
                  return
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
                res.setHeader('Cache-Control', 'no-cache, no-transform')
                res.setHeader('Connection', 'keep-alive')

                if (dsRes.body) {
                  const reader = (dsRes.body as any).getReader()
                  const decoder = new TextDecoder()
                  let buffer = ''
                  let isThinking = false
                  let hasSentThinkingClose = false

                  while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                      const trimmed = line.trim()
                      if (!trimmed) continue
                      if (trimmed === 'data: [DONE]') {
                        if (isThinking && !hasSentThinkingClose) {
                          const closeTag = '\n</Thinking>\n\n'
                          res.write(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: closeTag }] } }] })}\n\n`)
                          hasSentThinkingClose = true
                        }
                        res.write('data: [DONE]\n\n')
                        continue
                      }

                      if (trimmed.startsWith('data: ')) {
                        try {
                          const data = JSON.parse(trimmed.slice(6))
                          const delta = data.choices?.[0]?.delta || {}
                          let textToEmit = ''

                          if (delta.reasoning_content) {
                            if (!isThinking) {
                              isThinking = true
                              textToEmit += '<Thinking>\n'
                            }
                            textToEmit += delta.reasoning_content
                          }

                          if (delta.content) {
                            if (isThinking && !hasSentThinkingClose) {
                              textToEmit = '\n</Thinking>\n\n' + textToEmit
                              hasSentThinkingClose = true
                            }
                            textToEmit += delta.content
                          }

                          if (textToEmit) {
                            const payload = { candidates: [{ content: { parts: [{ text: textToEmit }] } }] }
                            res.write(`data: ${JSON.stringify(payload)}\n\n`)
                          }
                        } catch { /* skip */ }
                      }
                    }
                  }
                  res.end()
                  return
                }
              } catch (e: any) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: e.message }))
                return
              }
            })
            return
          }
        }
        next()
      })
    }
  })

  return {
    plugins: [
      react(),
      deepseekMiddlewarePlugin(),
      rateLimitPlugin()  // 添加速率限制插件
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5176,      // 固定端口
      allowedHosts: true, // 允许所有域名
      proxy: {
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: () => `/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${geminiKey}`,
          secure: true,
          timeout: 120000,
          proxyTimeout: 120000,
        },
        '/api/followup': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: () => `/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          secure: true,
          timeout: 60000,
        },
      },
    },
  }
})

