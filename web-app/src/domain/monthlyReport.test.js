import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMonthlyReport } from './monthlyReport.js'

test('builds a monthly report from decisions and review history', () => {
  const report = buildMonthlyReport([
    {
      id: 'd1',
      title: '要不要换方向',
      category: 'career',
      createdAt: '2026-07-01',
      status: 'reviewed',
      wateringHistory: [
        { date: '2026-07-05', type: 'result', lesson: '先做小验证' },
      ],
    },
    {
      id: 'd2',
      title: '六月的旧决策',
      category: 'learning',
      createdAt: '2026-06-20',
      status: 'pending',
      reviewDate: '2026-07-01',
      wateringHistory: [],
    },
  ], { today: '2026-07-06' })

  assert.equal(report.month, '2026-07')
  assert.equal(report.decisionCount, 1)
  assert.equal(report.reviewCount, 1)
  assert.equal(report.snippetCount, 1)
  assert.equal(report.topCategory, '职业选择')
  assert.match(report.nextFocus, /到期决策/)
})
