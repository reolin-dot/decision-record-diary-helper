import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useModal } from '../../components/Modal.jsx'
import { useToast } from '../../components/Toast.jsx'
import './recently-deleted.css'

export default function RecentlyDeleted() {
  const navigate = useNavigate()
  const modal = useModal()
  const toast = useToast()
  const { deletedDecisions, restoreDecision, purgeDecision } = useApp()
  const removeForever = async decision => {
    const confirmed = await modal.confirm({ title: '永久删除这条记录？', content: `“${decision.title}”将无法恢复。云端已有的旧备份不会自动改变。`, confirmText: '永久删除', cancelText: '先保留' })
    if (confirmed && purgeDecision(decision.id)) toast.show('已永久删除', { type: 'success' })
  }

  return <main className="deleted-page">
    <header><span>可以回头</span><h1>最近删除</h1><p>这里保存你从花园移除的记录。恢复会把它放回原来的成长阶段。</p></header>
    {deletedDecisions.length > 0 ? <div className="deleted-list">
      {deletedDecisions.map(decision => <article key={decision.id}>
        <div><b>{decision.title || '未命名的种子'}</b><span>{decision.createdAt || '未记录日期'}</span></div>
        <button onClick={() => { if (restoreDecision(decision.id)) toast.show('已放回花园', { type: 'success' }) }}>恢复</button>
        <button className="deleted-forever" onClick={() => removeForever(decision)}>永久删除</button>
      </article>)}
    </div> : <section className="deleted-empty"><span>🍂</span><b>这里是空的</b><p>没有需要恢复的记录。</p><button onClick={() => navigate('/decision-list')}>回到决策记录</button></section>}
  </main>
}
