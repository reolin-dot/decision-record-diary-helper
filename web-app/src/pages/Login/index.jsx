import { useState } from 'react'
import { useIdentity } from '../../context/IdentityContext.js'
import { useToast } from '../../components/Toast.jsx'
import './login.css'

export default function Login() {
  const toast = useToast()
  const { user, isConfigured, isLoading, signIn, register, signOut } = useIdentity()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)

  const submitPasswordAuth = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    const result = mode === 'register'
      ? await register(email, password)
      : await signIn(email, password)
    setLoading(false)

    if (!result.ok) {
      toast.show(result.error)
      return
    }

    toast.show(
      result.requiresEmailConfirmation ? '注册成功，请去邮箱确认' : '登录成功',
      { type: 'success' },
    )
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.ok) {
      toast.show(result.error)
      return
    }
    toast.show('已退出登录')
  }

  if (!isConfigured) {
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
        <h2>{user ? '已经登录' : (mode === 'register' ? '注册账号' : '邮箱密码登录')}</h2>
        <p>当前版本先接入账号身份，后续再把本地决策同步到云端。</p>

        {isLoading ? (
          <p>正在确认登录状态...</p>
        ) : user ? (
          <div className="login-session">
            <span>{user.email}</span>
            <button className="btn-secondary" onClick={handleSignOut}>退出登录</button>
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
