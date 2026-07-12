import { useState } from 'react'
import { useIdentity } from '../../context/IdentityContext.js'
import { useToast } from '../../components/Toast.jsx'
import './login.css'

export default function Login() {
  const toast = useToast()
  const {
    user,
    isConfigured,
    isLoading,
    isPasswordRecovery,
    signIn,
    register,
    signOut,
    requestPasswordReset,
    updatePassword,
  } = useIdentity()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)

  const submitPasswordAuth = async (event) => {
    event.preventDefault()
    if (isPasswordRecovery ? !password : !email.trim() || (mode !== 'recover' && !password)) return

    setLoading(true)
    const result = isPasswordRecovery
      ? await updatePassword(password)
      : mode === 'recover'
        ? await requestPasswordReset(email)
        : mode === 'register'
          ? await register(email, password)
          : await signIn(email, password)
    setLoading(false)

    if (!result.ok) {
      toast.show(result.error)
      return
    }

    if (isPasswordRecovery) {
      setPassword('')
      toast.show('密码已更新', { type: 'success' })
    } else if (mode === 'recover') {
      setMode('login')
      toast.show('重置链接已发送，请在当前浏览器打开邮件', { type: 'success' })
    } else {
      toast.show(mode === 'register' ? '注册成功' : '登录成功', { type: 'success' })
    }
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
        <h2>{isPasswordRecovery ? '设置新密码' : user ? '已经登录' : mode === 'recover' ? '重置密码' : (mode === 'register' ? '注册账号' : '邮箱密码登录')}</h2>
        <p>{isPasswordRecovery ? '输入新密码，保存后即可继续使用账号。' : '登录后可以使用云端备份；日常记录仍会优先保存在这台设备上。'}</p>

        {isLoading ? (
          <p>正在确认登录状态...</p>
        ) : isPasswordRecovery ? (
          <form onSubmit={submitPasswordAuth} className="login-form">
            <input
              className="form-input"
              type="password"
              value={password}
              placeholder="输入新密码"
              minLength={6}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="btn-primary" disabled={loading}>
              {loading ? '保存中...' : '保存新密码'}
            </button>
          </form>
        ) : user ? (
          <div className="login-session">
            <span>{user.email}</span>
            <button className="btn-secondary" onClick={handleSignOut}>退出登录</button>
          </div>
        ) : (
          <form onSubmit={submitPasswordAuth} className="login-form">
            {mode !== 'recover' && <div className="login-tabs">
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
            </div>}
            <input
              className="form-input"
              type="email"
              value={email}
              placeholder="输入邮箱"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            {mode !== 'recover' && <input
              className="form-input"
              type="password"
              value={password}
              placeholder="输入密码"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
            />}
            <button className="btn-primary" disabled={loading}>
              {loading ? '处理中...' : mode === 'recover' ? '发送重置链接' : (mode === 'register' ? '注册' : '登录')}
            </button>
            {mode === 'recover' && (
              <p className="login-recovery-note">请使用当前浏览器打开重置邮件；换浏览器可能无法进入设置新密码页面。</p>
            )}
            {mode === 'login' && (
              <button type="button" className="login-link" onClick={() => setMode('recover')}>忘记密码？</button>
            )}
            {mode === 'recover' && (
              <button type="button" className="login-link" onClick={() => setMode('login')}>返回登录</button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
