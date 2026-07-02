import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { getCoachRecommendation } from '../../domain/decisionStyleGuidance.js'
import { COACH_KITS } from './coachKits.js'
import './coach.css'

export default function Coach() {
  const navigate = useNavigate()
  const { decisionStyle } = useApp()
  const recommendation = getCoachRecommendation(decisionStyle)

  return (
    <div className="coach-page">
      <div className="coach-header">
        <span className="coach-kicker">决策急救锦囊</span>
        <span className="coach-title">你现在卡在哪一步？</span>
        <span className="coach-desc">
          锦囊不替你做决定，只给你一个合适的思考脚手架。先选择此刻最像你的状态。
        </span>
        {recommendation && (
          <div className="coach-recommendation">
            <span className="coach-recommendation-label">{recommendation.label}</span>
            <span className="coach-recommendation-text">{recommendation.reason}</span>
          </div>
        )}
      </div>
      <div className="coach-body">
        {COACH_KITS.map((item) => (
          <div
            key={item.id}
            className={`dilemma-card kit-${item.id} ${recommendation?.kitId === item.id ? 'recommended' : ''}`}
            onClick={() => navigate(`/coach-analyze?kit=${item.id}`)}
          >
            <div className="dilemma-icon">{item.icon}</div>
            <div className="dilemma-info">
              <span className="dilemma-title">
                {item.title}
                {recommendation?.kitId === item.id && (
                  <span className="dilemma-badge">适合你</span>
                )}
              </span>
              <span className="dilemma-desc">{item.desc}</span>
              <span className="dilemma-framework">{item.framework} · {item.tone}</span>
            </div>
            <span className="dilemma-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}
