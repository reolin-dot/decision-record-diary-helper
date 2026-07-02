import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDecisionPatterns } from './decisionPatterns.js'

test('returns no cards before decisions exist', () => {
  const patterns = buildDecisionPatterns()

  assert.equal(patterns.patternCards.length, 0)
  assert.equal(patterns.overview, '还没有足够记录形成模式')
})

test('finds the most common recent decision label', () => {
  const patterns = buildDecisionPatterns({
    decisions: [
      { id: '1', title: '要不要换岗位', category: 'career', createdAt: '2026-07-02' },
      { id: '2', title: '要不要接 offer', category: 'career', createdAt: '2026-07-01' },
      { id: '3', title: '要不要买电脑', category: 'spending', createdAt: '2026-06-30' },
    ],
  })

  assert.equal(patterns.patternCards[0].title, '职业选择')
  assert.match(patterns.patternCards[0].body, /2 条/)
  assert.equal(patterns.patternCards[0].actionPath, '/decision/1')
})

test('prioritizes due reviews as the risk signal', () => {
  const patterns = buildDecisionPatterns({
    today: '2026-07-02',
    decisions: [
      {
        id: '1',
        title: '到期的决定',
        category: 'learning',
        status: 'pending',
        reviewDate: '2026-07-01',
        actionStarted: false,
        createdAt: '2026-06-20',
      },
    ],
  })

  assert.equal(patterns.patternCards[1].title, '1 个决策等复盘')
  assert.equal(patterns.riskSignals[0].evidence, '到期的决定')
  assert.equal(patterns.riskSignals[0].actionPath, '/watering')
})
