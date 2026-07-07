import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import './login.css'

function getRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}#/login`
}

export default function Login() {
  const toast = useToast()
  const [email, setEmail] = useState('')
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

  const sendMagicLink = async (event) => {
    event.preventDefault()
    if (!supabase || !email.trim()) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: getRedirectUrl() },
    })
    setLoading(false)

    if (error) {
      toast.show(error.message)
      return
    }

    toast.show('登录链接已发送，请去邮箱查收', { type: 'success' })
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
        <h2>{session ? '已经登录' : '用邮箱登录'}</h2>
        <p>当前版本先接入账号身份，后续再把本地决策同步到云端。</p>

        {session ? (
          <div className="login-session">
            <span>{session.user.email}</span>
            <button className="btn-secondary" onClick={signOut}>退出登录</button>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="login-form">
            <input
              className="form-input"
              type="email"
              value={email}
              placeholder="输入邮箱"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="btn-primary" disabled={loading}>
              {loading ? '发送中...' : '发送登录链接'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
