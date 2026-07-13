import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', index: '01', label: '今日展台', shortLabel: '今日', icon: 'garden' },
  { path: '/coach', index: '02', label: '决策圆桌', shortLabel: '圆桌', icon: 'roundtable' },
  { path: '/profile', index: '03', label: '个人档案', shortLabel: '档案', icon: 'profile' },
]

function TabIcon({ name }) {
  if (name === 'garden') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21V11" /><path d="M12 13C7.5 13 4.5 10.4 4 6c4.5 0 7.5 2.5 8 7Z" /><path d="M12 16c.5-4 3.1-6.5 7.5-6.5 0 4.2-2.8 6.5-7.5 6.5Z" /></svg>
  }
  if (name === 'roundtable') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="4" r="1.5" /><circle cx="5" cy="16" r="1.5" /><circle cx="19" cy="16" r="1.5" /><path d="m12 5.5-.1 3M6.3 15.2l3-1.7m8.4 1.7-3-1.7" /></svg>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" /></svg>
}

function BrandMark() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21V9" /><path d="M12 12C8 12 5.5 9.8 5 6c4 0 6.5 2.1 7 6Z" /><path d="M12 15c.5-3.6 2.8-5.8 6.8-5.8 0 3.8-2.6 5.8-6.8 5.8Z" /><path d="M4 21h16" /></svg>
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
