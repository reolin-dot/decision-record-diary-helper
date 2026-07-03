import test from 'node:test'
import assert from 'node:assert/strict'
import { checkDataHealth } from './dataHealth.js'

test('returns healthy for normal local data', () => {
  const result = checkDataHealth({
    decisions: [
      {
        id: 'd1',
        title: '要不要换方向',
        createdAt: '2026-07-03',
        options: ['换', '不换'],
        status: 'pending',
        reviewStage: 'none',
        stage: 'sprout',
        wateringHistory: [],
      },
    ],
    aiInsights: [{ id: 'ai1', content: '最近更重视行动。' }],
    decisionStyle: { type: '行动型' },
  })

  assert.equal(result.status, 'healthy')
  assert.equal(result.summary.decisions, 1)
})

test('reports duplicate decision ids as errors', () => {
  const result = checkDataHealth({
    decisions: [
      { id: 'same', title: 'A', createdAt: '2026-07-03', options: [] },
      { id: 'same', title: 'B', createdAt: '2026-07-03', options: [] },
    ],
  })

  assert.equal(result.status, 'error')
  assert.equal(result.issues[0].code, 'duplicate_id')
})

test('reports missing optional display fields as warnings', () => {
  const result = checkDataHealth({
    decisions: [{ id: 'd1', options: 'bad' }],
    aiInsights: [{ id: 'ai1', content: '' }],
  })

  assert.equal(result.status, 'warning')
  assert.ok(result.warnings.some(item => item.code === 'missing_title'))
  assert.ok(result.warnings.some(item => item.code === 'invalid_options'))
  assert.ok(result.warnings.some(item => item.code === 'empty_ai_insight'))
})
