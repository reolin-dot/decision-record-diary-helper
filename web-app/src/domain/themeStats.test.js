import test from 'node:test'
import assert from 'node:assert/strict'
import { buildThemeInsight, buildThemeNextAction, buildThemeStats, getThemeDecisions, getThemeGrowthSnippets } from './themeStats.js'

test('builds theme stats from active decisions', () => {
  const stats = buildThemeStats([
    { id: 'd1', category: 'career', title: 'offer' },
    { id: 'd2', category: 'career', title: '转岗' },
    { id: 'd3', category: 'learning', title: '课程' },
    { id: 'd4', category: 'career', title: '草稿', isDraft: true },
    { id: 'd5', category: 'time', title: '删除', _deleted: true },
  ])

  assert.deepEqual(stats.map(item => [item.title, item.count, item.ratio]), [
    ['职业选择', 2, 67],
    ['学习成长', 1, 33],
  ])
})

test('labels coach and free-form decisions', () => {
  const stats = buildThemeStats([
    { id: 'd1', category: 'coach-choice', title: '锦囊' },
    { id: 'd2', category: 'unknown', title: '自由' },
  ])

  assert.deepEqual(stats.map(item => item.title), ['决策锦囊', '自由记录'])
})

test('gets decisions for one theme', () => {
  const decisions = [
    { id: 'd1', category: 'career', title: '旧职业', createdAt: '2026-06-01' },
    { id: 'd2', category: 'learning', title: '学习', createdAt: '2026-07-01' },
    { id: 'd3', category: 'career', title: '新职业', createdAt: '2026-07-02' },
  ]

  assert.deepEqual(getThemeDecisions(decisions, 'career').map(item => item.id), ['d3', 'd1'])
})

test('builds a readable theme insight', () => {
  assert.match(buildThemeInsight({ title: '职业选择', count: 3, ratio: 75 }), /一半以上/)
  assert.match(buildThemeInsight({ title: '学习成长', count: 1, ratio: 20 }), /刚出现/)
  assert.match(buildThemeInsight(null), /先记录/)
})

test('gets growth snippets for one theme', () => {
  const snippets = getThemeGrowthSnippets([
    {
      id: 'd1',
      category: 'career',
      title: '职业',
      wateringHistory: [{ date: '2026-07-02', lesson: '先小范围验证' }],
    },
    {
      id: 'd2',
      category: 'learning',
      title: '学习',
      wateringHistory: [{ date: '2026-07-03', lesson: '每天半小时' }],
    },
  ], 'career')

  assert.deepEqual(snippets.map(item => item.text), ['先小范围验证'])
})

test('builds next action for a theme', () => {
  assert.equal(buildThemeNextAction([], 'career', '2026-07-07').path, '/record')

  const due = buildThemeNextAction([
    { id: 'd1', category: 'career', status: 'pending', reviewDate: '2026-07-01' },
  ], 'career', '2026-07-07')
  assert.equal(due.path, '/watering')
  assert.match(due.text, /到期/)

  const withSnippet = buildThemeNextAction([
    {
      id: 'd2',
      category: 'career',
      status: 'reviewed',
      wateringHistory: [{ date: '2026-07-03', lesson: '先试一周' }],
    },
  ], 'career', '2026-07-07')
  assert.equal(withSnippet.path, '/record')
})
