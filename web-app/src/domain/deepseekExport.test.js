import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDeepSeekPayload } from './deepseekExport.js'

test('keeps the selected option index in the AI export', () => {
  const payload = buildDeepSeekPayload({
    decisions: [{ id: 'd1', title: '选择', options: ['A', 'B'], choice: 1 }],
    decisionStyle: null,
  })

  assert.equal(payload.decisions[0].choice, 1)
})
