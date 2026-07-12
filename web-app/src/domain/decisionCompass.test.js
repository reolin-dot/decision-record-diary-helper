import test from 'node:test'
import assert from 'node:assert/strict'
import { getCompassResult } from './decisionCompass.js'

test('decision compass prioritizes calm, information, then action size', () => {
  assert.equal(getCompassResult({ clear: true, enoughInfo: true, calm: false, smallStep: true }).tone, 'pause')
  assert.equal(getCompassResult({ clear: true, enoughInfo: false, calm: true, smallStep: true }).tone, 'explore')
  assert.equal(getCompassResult({ clear: true, enoughInfo: true, calm: true, smallStep: false }).tone, 'shape')
  assert.equal(getCompassResult({ clear: true, enoughInfo: true, calm: true, smallStep: true }).tone, 'ready')
})
