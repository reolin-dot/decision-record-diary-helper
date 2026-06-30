import { useNavigate } from 'react-router-dom'
import './success.css'

export default function RecordSuccess() {
  const navigate = useNavigate()

  return (
    <div className="success-screen">
      <div className="success-icon">🌱</div>
      <div className="success-title">种子已种下！</div>
      <div className="success-desc">
        你已经把选择放到了纸面上。{'\n'}接下来开始行动，它会继续长叶、开花。
      </div>
      <button
        className="btn-primary success-btn"
        onClick={() => navigate('/')}
      >
        返回花园
      </button>
    </div>
  )
}
