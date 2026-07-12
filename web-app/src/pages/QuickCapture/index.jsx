import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { DECISION_STAGES } from '../../domain/decisionStages.js'
import { formatDate } from '../../utils/util.js'
import './quick-capture.css'

export default function QuickCapture() {
  const navigate = useNavigate()
  const toast = useToast()
  const { createDecision } = useApp()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const save = () => {
    if (!title.trim()) return toast.show('先写下一句话就好')
    const decision = createDecision({
      title: title.trim(),
      background: note.trim(),
      createdAt: formatDate(new Date()),
      status: 'draft',
      stage: DECISION_STAGES.SEED,
      isDraft: true,
    })
    if (!decision) return toast.show('这颗种子暂时没保存下来，请再试一次')
    toast.show('念头已收进花园', { type: 'success' })
    navigate(`/decision/${decision.id}`, { replace: true })
  }

  return <main className="capture-page">
    <section className="capture-card">
      <span className="capture-kicker">10 秒收下念头</span>
      <h1>不用现在想清楚</h1>
      <p>先留住它。等你有空时，再回来补选项、做判断。</p>
      <label>
        <span>脑海里刚刚闪过什么？</span>
        <textarea autoFocus value={title} onChange={event => setTitle(event.target.value)} maxLength={120} placeholder="例如：我要不要试着申请那个机会？" />
        <small>{title.length}/120</small>
      </label>
      <label>
        <span>怕忘记的背景 <i>可不填</i></span>
        <textarea value={note} onChange={event => setNote(event.target.value)} maxLength={300} placeholder="发生了什么，或者为什么此刻想到了它？" />
      </label>
      <button className="capture-save" onClick={save}>先收进花园</button>
      <button className="capture-full" onClick={() => navigate('/record?step=1')}>我现在有空，完整记录</button>
    </section>
  </main>
}
