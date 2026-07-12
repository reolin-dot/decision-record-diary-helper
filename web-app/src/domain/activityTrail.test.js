import test from 'node:test'
import assert from 'node:assert/strict'
import { buildActivityTrail } from './activityTrail.js'

test('activity trail counts records and reviews without adding check-in data', () => {
  const trail = buildActivityTrail([{
    id: 'd1', createdAt: '2026-07-12', wateringHistory: [{ date: '2026-07-13' }, { date: '2026-07-13' }],
  }], '2026-07-13', 2)
  assert.deepEqual(trail, [{ date: '2026-07-12', count: 1 }, { date: '2026-07-13', count: 2 }])
})
