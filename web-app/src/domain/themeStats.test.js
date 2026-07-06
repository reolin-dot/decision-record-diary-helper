import test from 'node:test'
import assert from 'node:assert/strict'
import { buildThemeStats, getThemeDecisions } from './themeStats.js'

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
