import test from 'node:test'
import assert from 'node:assert/strict'
import { filterGrowthSnippets, getGrowthSnippets } from './growthSnippets.js'

test('filters growth snippets by review type and keyword', () => {
  const snippets = getGrowthSnippets([
    {
      id: 'd1',
      title: '接新项目',
      wateringHistory: [
        { date: '2026-07-01', type: 'current', lesson: '先确认项目边界' },
        { date: '2026-07-03', type: 'result', lesson: '沟通成本要提前估算' },
      ],
    },
  ])

  assert.equal(filterGrowthSnippets(snippets, { type: 'result' }).length, 1)
  assert.equal(filterGrowthSnippets(snippets, { keyword: '边界' }).length, 1)
  assert.equal(filterGrowthSnippets(snippets, { type: 'result', keyword: '边界' }).length, 0)
})
