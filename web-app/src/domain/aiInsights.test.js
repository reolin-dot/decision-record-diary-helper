import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAiInsight,
  getLatestAiInsights,
  normalizeAiInsightInput,
} from './aiInsights.js'

test('normalizes pasted AI insight text into a saveable payload', () => {
  const input = normalizeAiInsightInput({
    title: '  我的 7 月复盘  ',
    content: '  优势：能主动复盘。\n\n建议：下次先设停止点。  ',
  })

  assert.equal(input.title, '我的 7 月复盘')
  assert.equal(input.content, '优势：能主动复盘。\n\n建议：下次先设停止点。')
})

test('builds an AI insight with stable defaults', () => {
  const insight = buildAiInsight({
    title: '',
    content: '整体画像：你会认真收集信息。',
    source: 'deepseek',
    createdAt: '2026-07-02T08:00:00.000Z',
  })

  assert.equal(insight.title, 'DeepSeek 成长洞察')
  assert.equal(insight.source, 'deepseek')
  assert.equal(insight.content, '整体画像：你会认真收集信息。')
  assert.equal(insight.createdAt, '2026-07-02T08:00:00.000Z')
  assert.ok(insight.id.startsWith('ai_'))
})

test('returns latest non-deleted AI insights first', () => {
  const insights = [
    { id: '1', title: 'older', createdAt: '2026-07-01T08:00:00.000Z' },
    { id: '2', title: 'deleted', createdAt: '2026-07-03T08:00:00.000Z', _deleted: true },
    { id: '3', title: 'newer', createdAt: '2026-07-02T08:00:00.000Z' },
  ]

  const latest = getLatestAiInsights(insights)

  assert.deepEqual(latest.map(item => item.id), ['3', '1'])
})
