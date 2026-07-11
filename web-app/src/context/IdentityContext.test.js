import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { IdentityProvider, useIdentity } from './IdentityContext.js'

test('hides Supabase auth calls behind the identity interface', async () => {
  const calls = []
  const client = {
    auth: {
      signInWithPassword: async input => {
        calls.push(['signIn', input])
        return { data: { session: {} }, error: null }
      },
      signUp: async input => {
        calls.push(['register', input])
        return { data: { session: null }, error: null }
      },
      resetPasswordForEmail: async (email, options) => {
        calls.push(['resetPassword', { email, options }])
        return { data: {}, error: null }
      },
      updateUser: async input => {
        calls.push(['updatePassword', input])
        return { data: { user: {} }, error: null }
      },
      signOut: async () => ({ error: { message: '退出失败' } }),
    },
  }
  let identity
  function Capture() {
    identity = useIdentity()
    return null
  }

  renderToStaticMarkup(React.createElement(
    IdentityProvider,
    { client, getRedirectUrl: () => 'https://example.com/app' },
    React.createElement(Capture),
  ))

  assert.deepEqual(await identity.signIn(' user@example.com ', 'secret'), { ok: true })
  assert.deepEqual(await identity.register('user@example.com', 'secret'), {
    ok: true,
    requiresEmailConfirmation: true,
  })
  assert.deepEqual(await identity.signOut(), { ok: false, error: '退出失败' })
  assert.deepEqual(await identity.requestPasswordReset(' user@example.com '), { ok: true })
  assert.deepEqual(await identity.updatePassword('new-secret'), { ok: true })
  assert.deepEqual(calls, [
    ['signIn', { email: 'user@example.com', password: 'secret' }],
    ['register', {
      email: 'user@example.com',
      password: 'secret',
      options: { emailRedirectTo: 'https://example.com/app' },
    }],
    ['resetPassword', {
      email: 'user@example.com',
      options: { redirectTo: 'https://example.com/app?recovery=1' },
    }],
    ['updatePassword', { password: 'new-secret' }],
  ])
})
