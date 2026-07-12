import test from 'node:test'
import assert from 'node:assert/strict'
import { getDailyMemory } from './dailyMemory.js'

test('daily memory only chooses a reviewed decision and stays stable that day', () => {
  const decisions = [
    { id: 'a', title: '未复盘', wateringHistory: [] },
    { id: 'b', title: '已复盘', wateringHistory: [{ lesson: '先试试看' }] },
  ]
  assert.equal(getDailyMemory(decisions, '2026-07-13').decision.id, 'b')
  assert.equal(getDailyMemory(decisions, '2026-07-13').lesson, '先试试看')
})
