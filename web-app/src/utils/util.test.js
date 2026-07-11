import test from 'node:test'
import assert from 'node:assert/strict'
import { addMonths } from './util.js'

test('clamps month additions to the target month end', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28')
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29')
  assert.equal(addMonths('2026-11-30', 3), '2027-02-28')
})
