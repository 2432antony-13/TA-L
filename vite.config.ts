import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function extractPrompt(body: any): string {
  if (!Array.isArray(body.contents)) return JSON.stringify(body)
  return body.contents
    .flatMap((content: any) => content.parts || [])
    .map((part: any) => part.text)
    .filter(Boolean)
    .join('\n')
}

function writeProviderStream(
  providerStream: ReadableStream<Uint8Array>,
  res: ServerResponse,
) {
  const reader = providerStream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const pump = async () => {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const event = line.trim()
        if (!event) continue
        if (event === 'data: [DONE]') {
          res.write('data: [DONE]\n\n')
          continue
        }
        if (!event.startsWith('data: ')) continue
        try {
          const data = JSON.parse(event.slice(6))
          // Keep DeepSeek's reasoning_content server-side.
          const text = data.choices?.[0]?.delta?.content
          if (!text) continue
          const payload = { candidates: [{ content: { parts: [{ text }] } }] }
          res.write(`data: ${JSON.stringify(payload)}\n\n`)
        } catch {
          // Ignore non-content provider events.
        }
      }
    }
    res.end()
  }

  return pump()
}

function localReadingApi(env: Record<string, string>): PluginOption {
  return {
    name: 'local-reading-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/reading') || req.method !== 'POST') {
          next()
          return
        }

        const deepSeekKey = env.DEEPSEEK_API_KEY
        if (!deepSeekKey) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: { message: 'Set DEEPSEEK_API_KEY in .env.local.' } }))
          return
        }

        try {
          const body = await readBody(req)
          const isFast = req.url.includes('fast=1')
          const model = env.DEEPSEEK_MODEL || 'deepseek-v4-pro'
          const baseUrl = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '')
          const providerResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${deepSeekKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: extractPrompt(body) }],
              stream: true,
              thinking: { type: isFast ? 'disabled' : 'enabled' },
              max_tokens: isFast ? 1800 : 6000,
              ...(isFast
                ? { temperature: 0.7 }
                : { reasoning_effort: env.DEEPSEEK_REASONING_EFFORT || 'high' }),
            }),
          })

          if (!providerResponse.ok || !providerResponse.body) {
            res.statusCode = providerResponse.status
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              error: { message: `DeepSeek request failed (${providerResponse.status})` },
            }))
            return
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache, no-transform')
          await writeProviderStream(providerResponse.body, res)
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({
            error: { message: error instanceof Error ? error.message : 'Local API error' },
          }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localReadingApi(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5176,
      allowedHosts: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@mediapipe')) return 'gesture-engine'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('react')) return 'react'
            return undefined
          },
        },
      },
    },
  }
})
