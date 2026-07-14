import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { getCoachRecommendation } from '../../domain/decisionStyleGuidance.js'
import { inferDecisionOptions } from '../../domain/roundtableFlow.js'
import { COACH_KITS } from './coachKits.js'
import './coach.css'

export default function Coach() {
  const navigate = useNavigate()
  const toast = useToast()
  const { decisionStyle } = useApp()
  const recommendation = getCoachRecommendation(decisionStyle)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [optionsEdited, setOptionsEdited] = useState(false)

  const updateQuestion = (value) => {
    setQuestion(value)
    if (!optionsEdited) {
      const inferred = inferDecisionOptions(value)
      if (inferred.length >= 2) setOptions(inferred)
    }
  }

  const updateOption = (index, value) => {
    setOptionsEdited(true)
    setOptions(current => current.map((option, idx) => idx === index ? value : option))
  }

  const addOption = () => {
    setOptionsEdited(true)
    if (options.length < 4) setOptions(current => [...current, ''])
  }

  const removeOption = (index) => {
    setOptionsEdited(true)
    if (options.length > 2) setOptions(current => current.filter((_, idx) => idx !== index))
  }

  const openPerspective = (kitId) => {
    const cleanOptions = options.map(option => option.trim()).filter(Boolean)
    if (!question.trim()) {
      toast.show('先写下正在纠结的问题')
      return
    }
    if (cleanOptions.length < 2) {
      toast.show('至少补充两个可选方向')
      return
    }
    navigate(`/coach-analyze?kit=${kitId}`, {
      state: { question: question.trim(), options: cleanOptions },
    })
  }

  return (
    <div className="coach-page">
      <div className="coach-header">
        <button className="coach-compass-link" onClick={() => navigate('/compass')}>还不知道从哪里开始？先做 30 秒决策罗盘 →</button>
        <span className="coach-kicker">决策圆桌 · 清晰比正确更重要</span>
        <h1 className="coach-title">把纠结摊开，<br />一次看清。</h1>
        <span className="coach-desc">
          先写问题和选项，再邀请一个视角帮你追问。圆桌不替你做决定，只帮你形成一张可行动、可复盘的决策卡。
        </span>
        {recommendation && (
          <div className="coach-recommendation">
            <span className="coach-recommendation-label">{recommendation.label}</span>
            <span className="coach-recommendation-text">{recommendation.reason}</span>
          </div>
        )}
      </div>
      <div className="coach-body">
        <section className="roundtable-input-card">
          <span className="roundtable-step-label">1 · 正在纠结什么？</span>
          <textarea
            value={question}
            onChange={(event) => updateQuestion(event.target.value)}
            placeholder="例如：我是继续留在现在的公司，还是接受新 offer？"
            maxLength={120}
          />
          <span className="roundtable-step-label">2 · 现在有哪些选项？</span>
          <div className="roundtable-options">
            {options.map((option, index) => (
              <div className="roundtable-option-row" key={index}>
                <span>{String.fromCharCode(65 + index)}</span>
                <input
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                  maxLength={80}
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} aria-label="删除选项">×</button>
                )}
              </div>
            ))}
          </div>
          {options.length < 4 && <button type="button" className="roundtable-add-option" onClick={addOption}>＋ 补充选项</button>}
        </section>

        <div className="roundtable-perspective-head">
          <span className="roundtable-step-label">3 · 选择一个圆桌视角</span>
          <span>不同视角会问不同的问题，你随时可以回来换一个。</span>
        </div>

        <div className="roundtable-perspective-grid">
          {COACH_KITS.filter(item => item.id !== 'review').map((item) => (
            <button
              type="button"
              key={item.id}
              className={`dilemma-card kit-${item.id} ${recommendation?.kitId === item.id ? 'recommended' : ''}`}
              onClick={() => openPerspective(item.id)}
            >
              <span className="dilemma-emblem" aria-hidden="true">
                <b>{item.perspectiveLabel.slice(0, 1)}</b>
                <small>{item.id.slice(0, 3).toUpperCase()}</small>
              </span>
              <span className="dilemma-info">
                <span className="dilemma-title">
                  {item.perspectiveLabel}
                  {recommendation?.kitId === item.id && (
                    <span className="dilemma-badge">适合你</span>
                  )}
                </span>
                <span className="dilemma-desc">{item.title}。{item.desc}</span>
                <span className="dilemma-framework">{item.framework} · {item.tone}</span>
              </span>
              <span className="dilemma-arrow">进入视角 ↗</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
