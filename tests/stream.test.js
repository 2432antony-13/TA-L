import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transformDeepSeekStream } from '../api/reading.js'
const frame = delta => 'data: ' + JSON.stringify({ choices: [{ delta }] })
async function collect(text, width = 1) {
    const bytes = new TextEncoder().encode(text)
    const stream = new ReadableStream({ start(controller) {
        for (let i = 0; i < bytes.length; i += width) controller.enqueue(bytes.slice(i, i + width))
        controller.close()
    } })
    return new Response(transformDeepSeekStream(stream)).text()
}
test('split UTF-8 and a final event without newline preserve answer content', async () => {
    const output = await collect(frame({ content: '完整結尾 🌿', reasoning_content: 'PRIVATE' }))
    assert.ok(output.includes('完整結尾 🌿'))
    assert.ok(!output.includes('PRIVATE'))
    assert.equal(output.match(/data: \[DONE\]/g).length, 1)
})
test('explicit completion is emitted once and ignores post-completion payloads', async () => {
    const output = await collect(frame({ content: 'answer' }) + '\r\n\r\ndata: [DONE]\n' + frame({ content: 'late' }))
    assert.ok(output.includes('answer'))
    assert.ok(!output.includes('late'))
    assert.equal(output.match(/data: \[DONE\]/g).length, 1)
})
test('reasoning-only and malformed frames never leak into the result', async () => {
    const output = await collect(frame({ reasoning_content: 'PRIVATE' }) + '\ndata: invalid\n')
    assert.equal(output, 'data: [DONE]\n\n')
})
