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
  const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''
  const model = env.VITE_GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.0-flash'

  if (!apiKey) {
    console.warn('⚠️ 未找到 GEMINI API Key，本地 /api/gemini 代理将无法工作。')
    console.warn('   请在项目根目录创建 .env 文件并添加: VITE_GEMINI_API_KEY=你的Key')
  } else {
    console.log(`✅ 已加载 API Key，模型: ${model}`)
  }

  return {
    plugins: [
      react(),
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
          rewrite: () => `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
          secure: true,
          timeout: 120000,
          proxyTimeout: 120000,
        },
        '/api/followup': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: () => `/v1beta/models/${model}:generateContent?key=${apiKey}`,
          secure: true,
          timeout: 60000,
        },
      },
    },
  }
})
