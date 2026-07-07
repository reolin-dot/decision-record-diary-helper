import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthRedirectUrl } from './authRedirect.js'

test('builds a Supabase auth redirect URL without hash routes', () => {
  const url = buildAuthRedirectUrl({
    origin: 'https://www.decidiary.icu',
    pathname: '/',
  })

  assert.equal(url, 'https://www.decidiary.icu/')
})
