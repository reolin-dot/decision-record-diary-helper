import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', index: '01', label: '今日展台', shortLabel: '今日', icon: 'garden' },
  { path: '/coach', index: '02', label: '决策圆桌', shortLabel: '圆桌', icon: 'roundtable' },
  { path: '/profile', index: '03', label: '个人档案', shortLabel: '档案', icon: 'profile' },
]

function TabIcon({ name }) {
  if (name === 'garden') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>
  }
  if (name === 'roundtable') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M5 8h14M12 5v14M7 19h10" /><path d="m5 8-3 6h6L5 8Zm14 0-3 6h6l-3-6Z" /></svg>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4.5" y="5" width="15" height="14" /><path d="M4.5 10h15M9 14h6" /></svg>
}

function BrandMark() {
  return <span aria-hidden="true">D</span>
}

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="tab-bar" aria-label="主导航">
      <button className="tab-brand" type="button" onClick={() => navigate('/')} aria-label="返回决策成长日记首页">
        <span className="tab-brand-mark"><BrandMark /></span>
        <span className="tab-brand-copy"><small>Decision Conservatory</small><strong>决策成长日记</strong></span>
      </button>
      <div className="tab-links">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              className={`tab-item ${isActive ? 'tab-active' : ''}`}
              onClick={() => navigate(tab.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="tab-index">{tab.index}</span>
              <span className="tab-icon"><TabIcon name={tab.icon} /></span>
              <span className="tab-text tab-text-full">{tab.label}</span>
              <span className="tab-text tab-text-short">{tab.shortLabel}</span>
            </button>
          )
        })}
      </div>
      <span className="tab-note"><b>今日馆藏</b><br />每一次选择，都会留下可复用的证据。</span>
    </nav>
  )
}
