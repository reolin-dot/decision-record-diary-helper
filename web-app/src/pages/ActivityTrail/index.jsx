import { useApp } from '../../context/AppContext.jsx'
import { buildActivityTrail } from '../../domain/activityTrail.js'
import './activity-trail.css'

export default function ActivityTrail() {
  const { decisions } = useApp()
  const trail = buildActivityTrail(decisions)
  const activeDays = trail.filter(day => day.count > 0).length
  const moments = trail.reduce((sum, day) => sum + day.count, 0)

  return <main className="trail-page">
    <header className="trail-hero">
      <span>最近 12 周</span>
      <h1>走过的路，比连续打卡更重要</h1>
      <p>每个亮点代表一次记录或复盘。空白不是中断，只是生活正在别处发生。</p>
    </header>

    <section className="trail-paper">
      <div className="trail-summary"><div><b>{activeDays}</b><span>有足迹的日子</span></div><div><b>{moments}</b><span>记录与复盘</span></div></div>
      <div className="trail-grid" aria-label={`最近十二周有 ${activeDays} 天留下成长足迹`}>
        {trail.map(day => <i key={day.date} className={`level-${Math.min(day.count, 3)}`} title={`${day.date}：${day.count} 次`} />)}
      </div>
      <div className="trail-legend"><span>轻轻走过</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><span>留下很多</span></div>
    </section>

    <blockquote>“成长不一定每天发生，但回头看时，它会连成一条路。”</blockquote>
  </main>
}
