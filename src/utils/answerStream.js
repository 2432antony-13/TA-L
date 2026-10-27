/** Consume the public answer stream, retaining UTF-8 and SSE fragments. */
export async function readAnswerStream(reader, onText) {
  const decoder = new TextDecoder()
  let buffer = ''
  function consume(line) {
    if (!line.startsWith('data:')) return
    const payload = line.slice(5).trim()
    if (!payload || payload === '[DONE]') return
    try {
      const data = JSON.parse(payload)
      for (const part of data.candidates?.[0]?.content?.parts || []) {
        if (!part.thought && typeof part.text === 'string') onText(part.text)
      }
    } catch { /* A malformed provider event cannot become displayed text. */ }
  }
  try {
    while (true) {
      let timer
      let result
      try {
        result = await Promise.race([reader.read(), new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('stream-timeout')), 30_000)
        })])
      } finally { clearTimeout(timer) }
      if (result.done) break
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      lines.forEach(consume)
    }
    buffer += decoder.decode()
    if (buffer.trim()) consume(buffer)
  } finally { reader.releaseLock() }
}
