import { useLocation, useNavigate } from 'react-router-dom'
import '../RecordSuccess/success.css'

export default function ReviewSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const reviewName = state.reviewType === 'result' ? '结果复盘' : '当下复盘'
  const hasFollowUp = Number(state.remainingCount || 0) > 0

  return (
    <div className="success-screen">
      <div className="success-icon">💧</div>
      <div className="success-title">浇水已完成</div>
      <div className="success-desc">
        {state.title ? `${reviewName}：${state.title}` : '这次复盘已经记录下来。'}
      </div>

      <div className="success-panel">
        <span className="success-panel-label">本次沉淀</span>
        <span className="success-panel-text">
          {state.lesson || state.summary || '这次记录会成为下一次选择的参考。'}
        </span>
        {state.rating && <span className="success-panel-meta">状态：{state.rating}</span>}
      </div>

      {hasFollowUp && (
        <div className="success-panel success-panel-soft">
          <span className="success-panel-label">下次回看</span>
          <span className="success-panel-text">
            还剩 {state.remainingCount} 次跟进复盘
            {state.nextReviewDate ? `，下次提醒日 ${state.nextReviewDate}` : ''}。
          </span>
        </div>
      )}

      <button className="btn-primary success-btn" onClick={() => navigate('/')}>
        返回花园
      </button>
      <button className="success-link" onClick={() => navigate('/growth-snippets')}>
        查看成长片段
      </button>
    </div>
  )
}
