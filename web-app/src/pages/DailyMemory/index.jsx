import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { getDailyMemory } from '../../domain/dailyMemory.js'
import './daily-memory.css'

export default function DailyMemory() {
  const navigate = useNavigate()
  const { decisions } = useApp()
  const memory = getDailyMemory(decisions)

  return <main className="memory-page">
    <header className="memory-intro">
      <span>今日拾光</span>
      <h1>{memory ? '和过去的自己坐一会儿' : '这里在等第一段成长回忆'}</h1>
      <p>{memory ? '每天只带回一条，不催你总结，也不要求做得更好。' : '完成一次复盘后，这里每天会带回一段当时的判断。'}</p>
    </header>

    {memory ? <article className="memory-note">
      <span className="memory-date">写于 {memory.decision.createdAt || '某一天'}</span>
      <h2>{memory.decision.title}</h2>
      {memory.decision.options?.[memory.decision.choice] && <p className="memory-choice">当时选择：{memory.decision.options[memory.decision.choice]}</p>}
      <blockquote>“{memory.lesson}”</blockquote>
      <div className="memory-question">
        <span>今天再看</span>
        <b>这段经历里，有什么已经变成了你的底气？</b>
      </div>
      <button onClick={() => navigate(`/decision/${memory.decision.id}`)}>翻开当时的完整记录</button>
    </article> : <section className="memory-empty">
      <span>🌱</span>
      <button onClick={() => navigate('/watering')}>看看有没有可以复盘的决定</button>
    </section>}
  </main>
}
