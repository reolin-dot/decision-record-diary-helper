import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { buildAuthRedirectUrl } from '../lib/authRedirect.js'

const IdentityContext = createContext(null)

async function runAuth(call) {
  try {
    const { data, error } = await call()
    return error ? { ok: false, error: error.message } : { ok: true, data }
  } catch (error) {
    return { ok: false, error: error?.message || '账号操作失败，请稍后重试' }
  }
}

export function IdentityProvider({ children, client = supabase, getRedirectUrl = buildAuthRedirectUrl }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(client))
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!client) {
      setIsLoading(false)
      return undefined
    }

    let active = true
    client.auth.getSession()
      .then(({ data }) => {
        if (active) setSession(data.session)
      })
      .catch(() => {
        if (active) setSession(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (active) {
        setSession(nextSession)
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
          window.location.hash = '/login'
        }
        setIsLoading(false)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [client])

  const signIn = useCallback(async (email, password) => {
    if (!client) return { ok: false, error: '账号功能尚未配置' }
    const result = await runAuth(() => client.auth.signInWithPassword({
      email: email.trim(),
      password,
    }))
    return result.ok ? { ok: true } : result
  }, [client])

  const register = useCallback(async (email, password) => {
    if (!client) return { ok: false, error: '账号功能尚未配置' }
    const result = await runAuth(() => client.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: getRedirectUrl() },
    }))
    return result.ok
      ? { ok: true, requiresEmailConfirmation: !result.data.session }
      : result
  }, [client, getRedirectUrl])

  const signOut = useCallback(async () => {
    if (!client) return { ok: false, error: '账号功能尚未配置' }
    const result = await runAuth(() => client.auth.signOut())
    return result.ok ? { ok: true } : result
  }, [client])

  const requestPasswordReset = useCallback(async (email) => {
    if (!client) return { ok: false, error: '账号功能尚未配置' }
    const result = await runAuth(() => client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getRedirectUrl(),
    }))
    return result.ok ? { ok: true } : result
  }, [client, getRedirectUrl])

  const updatePassword = useCallback(async (password) => {
    if (!client) return { ok: false, error: '账号功能尚未配置' }
    const result = await runAuth(() => client.auth.updateUser({ password }))
    if (result.ok) setIsPasswordRecovery(false)
    return result.ok ? { ok: true } : result
  }, [client])

  const value = useMemo(() => ({
    user: session?.user || null,
    isConfigured: Boolean(client),
    isLoading,
    isPasswordRecovery,
    signIn,
    register,
    signOut,
    requestPasswordReset,
    updatePassword,
  }), [client, isLoading, isPasswordRecovery, register, requestPasswordReset, session, signIn, signOut, updatePassword])

  return createElement(IdentityContext.Provider, { value }, children)
}

export function useIdentity() {
  const context = useContext(IdentityContext)
  if (!context) throw new Error('useIdentity must be used within IdentityProvider')
  return context
}
