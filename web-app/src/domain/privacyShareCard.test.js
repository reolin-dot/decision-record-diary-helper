import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPrivacyShareCardCopy } from './privacyShareCard.js'

test('privacy share copy includes counts but no decision content', () => {
  const copy = buildPrivacyShareCardCopy({
    month: '2026-07', decisionCount: 2, reviewCount: 1, snippetCount: 1,
    topSnippets: [{ text: '不能对外说的复盘' }], topCategory: '工作选择',
  })
  const text = Object.values(copy).join(' ')
  assert.match(text, /记录 2 次/)
  assert.doesNotMatch(text, /不能对外说|工作选择/)
})
