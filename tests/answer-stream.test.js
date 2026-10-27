import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readAnswerStream } from '../src/utils/answerStream.js'
test('client retains Traditional Chinese across byte boundaries and a final SSE without newline', async () => {
  const text = '綜合印象：保持判斷與自主。'
  const bytes = new TextEncoder().encode('data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }))
  const stream = new ReadableStream({start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close() }})
  let actual = ''
  await readAnswerStream(stream.getReader(), value => { actual += value })
  assert.equal(actual, text)
  assert.equal(stream.locked, false)
})
test('client ignores malformed events and hidden thoughts', async () => {
  const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: broken\ndata: {"candidates":[{"content":{"parts":[{"thought":true,"text":"hidden"},{"text":"Visible answer"}]}}]}\ndata: [DONE]\n')); c.close() } })
  let text = ''
  await readAnswerStream(stream.getReader(), value => { text += value })
  assert.equal(text, 'Visible answer')
})
