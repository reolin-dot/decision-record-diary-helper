import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useIdentity } from '../../context/IdentityContext.js'
import { useToast } from '../../components/Toast.jsx'
import { useModal } from '../../components/Modal.jsx'
import storage from '../../storage/LocalStorageAdapter.js'
import { isInstalledApp, requestAppInstall } from '../../pwaInstall.js'
import './profile.css'

const SETTINGS = [
  { icon: '🗂️', label: '成长档案', action: 'growthArchive' },
  { icon: '🗓️', label: '月度成长报告', action: 'monthlyReport' },
  { icon: '💧', label: '提醒中心', action: 'watering' },
  { icon: '💡', label: '成长片段', action: 'growthSnippets' },
  { icon: '🤖', label: '数据导出与 AI 分析', action: 'dataExport' },
  { icon: '📝', label: '重新测试决策风格', action: 'styleTest' },
  { icon: '📊', label: '决策记录', action: 'decisionList' },
  { icon: '🍂', label: '最近删除', action: 'recentlyDeleted' },
]

function computeBadges(stats) {
  return [
    { icon: '🌱', name: '首次记录', unlocked: stats.totalDecisions > 0 },
    { icon: '🔥', name: '连续 7 天', unlocked: stats.streak >= 7 },
    { icon: '🌸', name: '首次开花', unlocked: stats.bloomedCount > 0 },
    { icon: '🌳', name: '决策大树', unlocked: stats.totalDecisions >= 10 },
    { icon: '📚', name: '锦囊达人', unlocked: false },
    { icon: '👑', name: '月度复盘王', unlocked: stats.bloomedCount >= 3 },
  ]
}

export default function Profile() {
  const navigate = useNavigate()
  const { stats, decisionStyle, userInfo, aiInsights, reloadFromStorage } = useApp()
  const { user, isConfigured, isLoading, deleteAccount } = useIdentity()
  const toast = useToast()
  const modal = useModal()

  const badges = computeBadges(stats)
  const styleLabel = decisionStyle?.type || '理性型决策者'
  const latestAiInsight = aiInsights?.[0] || null

  const handleTapSetting = (action) => {
    switch (action) {
      case 'watering':
        navigate('/watering')
        break
      case 'growthArchive':
        navigate('/growth-archive')
        break
      case 'monthlyReport':
        navigate('/monthly-report')
        break
      case 'growthSnippets':
        navigate('/growth-snippets')
        break
      case 'styleTest':
        navigate('/style-test')
        break
      case 'decisionList':
        navigate('/decision-list')
        break
      case 'recentlyDeleted':
        navigate('/recently-deleted')
        break
      case 'dataExport':
        navigate('/data-export')
        break
    }
  }

  const openLogin = () => {
    navigate('/login')
  }

  const handleInstall = async () => {
    const result = await requestAppInstall()
    if (result.accepted) return toast.show('已经放到桌面，随时可以回来', { type: 'success' })
    if (!result.supported) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      toast.show(isIOS ? '点浏览器的分享按钮，再选“添加到主屏幕”' : '打开浏览器菜单，选择“安装应用”或“添加到主屏幕”')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = await modal.confirm({
      title: '永久注销账号？',
      content: '账号、云端数据和本机数据都会删除，且无法恢复。请先导出备份。',
      confirmText: '永久注销',
      cancelText: '取消',
    })
    if (!confirmed) return
    const result = await deleteAccount()
    if (!result.ok) {
      toast.show(`注销失败：${result.error}`)
      return
    }
    storage.clearAll()
    reloadFromStorage()
    toast.show('账号与本机数据已删除', { type: 'success' })
    navigate('/', { replace: true })
  }

  return (
    <div className="profile-page">
      <div className="pf-header">
        <div className="pf-avatar-wrap">
          <span className="pf-avatar">👤</span>
        </div>
        <div className="pf-user">
          <span className="pf-name">{userInfo?.name || '决策者'}</span>
          <span className="pf-style-tag">{styleLabel}</span>
        </div>
      </div>

      <div className="pf-stats">
        <div className="pf-stat-item">
          <span className="pf-stat-num">{stats.totalDecisions || 0}</span>
          <span className="pf-stat-label">总决策数</span>
        </div>
        <div className="pf-stat-divider" />
        <div className="pf-stat-item">
          <span className="pf-stat-num">{stats.reviewRate || '0%'}</span>
          <span className="pf-stat-label">复盘完成率</span>
        </div>
        <div className="pf-stat-divider" />
        <div className="pf-stat-item">
          <span className="pf-stat-num">{stats.growthLoopRate || '0%'}</span>
          <span className="pf-stat-label">盛开率</span>
        </div>
        <div className="pf-stat-divider" />
        <div className="pf-stat-item">
          <span className="pf-stat-num">{stats.streak || 0}</span>
          <span className="pf-stat-label">连续天数</span>
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">成就徽章</span>
        <div className="pf-badge-grid">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className={`pf-badge ${badge.unlocked ? 'badge-unlocked' : ''}`}
            >
              <span className="pf-badge-icon">{badge.icon}</span>
              <span className="pf-badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">成长洞察</span>
        {latestAiInsight ? (
          <div className="pf-insight-card" onClick={() => navigate('/data-export')}>
            <div className="pf-insight-head">
              <span className="pf-insight-title">{latestAiInsight.title}</span>
              <span className="pf-insight-date">{(latestAiInsight.createdAt || '').slice(0, 10)}</span>
            </div>
            <span className="pf-insight-content">{latestAiInsight.content}</span>
            <span className="pf-insight-action">查看全部洞察 ›</span>
          </div>
        ) : (
          <div className="pf-insight-empty" onClick={() => navigate('/data-export')}>
            <span className="pf-insight-empty-title">还没有保存 AI 洞察</span>
            <span className="pf-insight-empty-desc">可以先把本地记录复制到 DeepSeek 分析，再把结果保存回来。</span>
          </div>
        )}
      </div>

      <div className="pf-section">
        <span className="pf-section-title">数据保存</span>
        <div className="pf-local-note">
          <span className="pf-local-note-icon">🌿</span>
          <span>
            当前数据保存在本机浏览器。换设备、清缓存或更换浏览器可能看不到原记录，建议定期在“数据导出”里备份。
          </span>
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">账号与数据保护</span>
        <div className="pf-settings-list">
          <div className="pf-setting" onClick={openLogin}>
            <span className="pf-setting-icon">🔐</span>
            <span className="pf-setting-label">{user ? '已登录账号' : '账号登录'}</span>
            <span className="pf-setting-hint">
              {isLoading ? '确认中' : user?.email || (isConfigured ? '邮箱登录' : '未配置')}
            </span>
          </div>
          <div className="pf-setting" onClick={() => navigate(user ? '/data-export' : '/login')}>
            <span className="pf-setting-icon">☁️</span>
            <span className="pf-setting-label">云备份与跨设备恢复</span>
            <span className="pf-setting-hint">{user ? '手动备份可用' : '登录后开放'}</span>
          </div>
          {user && (
            <div className="pf-setting pf-setting-danger" onClick={handleDeleteAccount}>
              <span className="pf-setting-icon">🗑️</span>
              <span className="pf-setting-label">永久注销账号</span>
              <span className="pf-setting-hint">同时删除云端与本机数据</span>
            </div>
          )}
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">设置</span>
        <div className="pf-settings-list">
          {!isInstalledApp() && (
            <div className="pf-setting" onClick={handleInstall}>
              <span className="pf-setting-icon">📲</span>
              <span className="pf-setting-label">安装到桌面</span>
              <span className="pf-setting-hint">像应用一样打开</span>
            </div>
          )}
          {SETTINGS.map((item) => (
            <div
              key={item.label}
              className="pf-setting"
              onClick={() => handleTapSetting(item.action)}
            >
              <span className="pf-setting-icon">{item.icon}</span>
              <span className="pf-setting-label">{item.label}</span>
              <span className="pf-setting-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
