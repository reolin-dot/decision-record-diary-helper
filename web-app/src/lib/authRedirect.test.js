import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAuthRedirectUrl,
  buildPasswordRecoveryRedirectUrl,
  getPasswordRecoveryRoute,
} from './authRedirect.js'

test('builds a Supabase auth redirect URL without hash routes', () => {
  const url = buildAuthRedirectUrl({
    origin: 'https://www.decidiary.icu',
    pathname: '/',
  })

  assert.equal(url, 'https://www.decidiary.icu/')
})

test('routes a Supabase recovery callback to the password form', () => {
  assert.equal(getPasswordRecoveryRoute({
    hash: '#access_token=secret&type=recovery',
    search: '',
  }), '/login')

  assert.equal(getPasswordRecoveryRoute({
    hash: '#/login',
    search: '?recovery=1',
  }), '/login')
})

test('marks password recovery redirects without using the router hash', () => {
  assert.equal(
    buildPasswordRecoveryRedirectUrl('https://www.decidiary.icu/'),
    'https://www.decidiary.icu/?recovery=1',
  )
})
