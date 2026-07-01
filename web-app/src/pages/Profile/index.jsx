import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import './profile.css'

const SETTINGS = [
  { icon: '💧', label: '提醒中心', action: 'watering' },
  { icon: '💡', label: '成长片段', action: 'growthSnippets' },
  { icon: '🤖', label: '数据导出与 AI 分析', action: 'dataExport' },
  { icon: '📝', label: '重新测试决策风格', action: 'styleTest' },
  { icon: '📊', label: '决策记录', action: 'decisionList' },
  { icon: '⚙️', label: '通用设置', action: 'general' },
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
  const { stats, decisionStyle, userInfo } = useApp()
  const toast = useToast()

  const badges = computeBadges(stats)
  const styleLabel = decisionStyle?.type || '理性型决策者'

  const handleTapSetting = (action) => {
    switch (action) {
      case 'watering':
        navigate('/watering')
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
      case 'dataExport':
        navigate('/data-export')
        break
      case 'general':
        toast.show('通用设置后续上线')
        break
    }
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
        <span className="pf-section-title">数据保存</span>
        <div className="pf-local-note">
          <span className="pf-local-note-icon">🌿</span>
          <span>
            当前数据保存在本机浏览器。换设备、清缓存或更换浏览器可能看不到原记录，建议定期在“数据导出”里备份。
          </span>
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">云同步</span>
        <div className="pf-settings-list">
          <div className="pf-setting">
            <span className="pf-setting-icon">☁️</span>
            <span className="pf-setting-label">开启云同步</span>
            <span className="pf-setting-hint">即将上线</span>
          </div>
        </div>
      </div>

      <div className="pf-section">
        <span className="pf-section-title">设置</span>
        <div className="pf-settings-list">
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
