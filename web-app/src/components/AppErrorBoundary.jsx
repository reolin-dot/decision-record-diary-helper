import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('[App] unexpected render error', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return <main className="app-error-page">
      <span>🍃</span>
      <h1>花园刚刚打了个盹</h1>
      <p>你的本地记录还在。可以先重新打开页面；如果仍然没有恢复，再去导出一份数据。</p>
      <button onClick={() => window.location.reload()}>重新打开花园</button>
      <a href="/#/data-export">先去备份数据</a>
    </main>
  }
}
