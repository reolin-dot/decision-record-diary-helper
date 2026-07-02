import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildMoodValue,
  parseMoodValue,
  toggleMood,
} from './moods.js'

test('toggles moods without removing other selected moods', () => {
  const selected = toggleMood(['焦虑', '平静'], '纠结')

  assert.deepEqual(selected, ['焦虑', '平静', '纠结'])
})

test('toggles an existing mood off', () => {
  const selected = toggleMood(['焦虑', '平静'], '焦虑')

  assert.deepEqual(selected, ['平静'])
})

test('builds a readable mood value with custom mood text', () => {
  const value = buildMoodValue(['焦虑', '其他'], '有点期待')

  assert.equal(value, '焦虑、其他：有点期待')
})

test('parses old single mood values as one selected mood', () => {
  const parsed = parseMoodValue('纠结')

  assert.deepEqual(parsed, { selectedMoods: ['纠结'], customMood: '' })
})
