import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js'
import { buildAuthRedirectUrl } from '../../lib/authRedirect.js'
import { useToast } from '../../components/Toast.jsx'
import './login.css'

export default function Login() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return undefined

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const submitPasswordAuth = async (event) => {
    event.preventDefault()
    if (!supabase || !email.trim() || !password) return

    setLoading(true)
    const authCall = mode === 'register'
      ? supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: buildAuthRedirectUrl() },
        })
      : supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

    const { data, error } = await authCall
    setLoading(false)

    if (error) {
      toast.show(error.message)
      return
    }

    toast.show(
      mode === 'register' && !data.session ? '注册成功，请去邮箱确认' : '登录成功',
      { type: 'success' },
    )
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    toast.show('已退出登录')
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="login-page">
        <div className="login-card">
          <span className="login-kicker">账号登录</span>
          <h2>还没配置 Supabase</h2>
          <p>在 `web-app/.env` 里填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 后，重启开发服务器。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-kicker">账号登录</span>
        <h2>{session ? '已经登录' : (mode === 'register' ? '注册账号' : '邮箱密码登录')}</h2>
        <p>当前版本先接入账号身份，后续再把本地决策同步到云端。</p>

        {session ? (
          <div className="login-session">
            <span>{session.user.email}</span>
            <button className="btn-secondary" onClick={signOut}>退出登录</button>
          </div>
        ) : (
          <form onSubmit={submitPasswordAuth} className="login-form">
            <div className="login-tabs">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => setMode('login')}
              >
                登录
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => setMode('register')}
              >
                注册
              </button>
            </div>
            <input
              className="form-input"
              type="email"
              value={email}
              placeholder="输入邮箱"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="form-input"
              type="password"
              value={password}
              placeholder="输入密码"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="btn-primary" disabled={loading}>
              {loading ? '处理中...' : (mode === 'register' ? '注册' : '登录')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
