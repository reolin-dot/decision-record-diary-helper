import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', label: '花园', icon: '🌿', activeIcon: '🌺' },
  { path: '/coach', label: '圆桌', icon: '💡', activeIcon: '✨' },
  { path: '/profile', label: '我的', icon: '👤', activeIcon: '😊' },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? 'tab-active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{isActive ? tab.activeIcon : tab.icon}</span>
            <span className="tab-text">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
