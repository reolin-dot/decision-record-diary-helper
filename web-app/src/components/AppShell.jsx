import { Outlet } from 'react-router-dom'
import TabBar from './TabBar.jsx'

export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
