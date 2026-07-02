import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCoachKit } from '../Coach/coachKits.js'
import './analyze.css'

const SCORES = [1, 2, 3, 4, 5]

export default function CoachAnalyze() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const kit = getCoachKit(searchParams.get('kit'))

  const [steps, setSteps] = useState(kit.steps.map(step => ({ ...step, value: '' })))
  const [scoreA, setScoreA] = useState(3)
  const [scoreB, setScoreB] = useState(3)

  const handleStepInput = (idx, value) => {
    setSteps(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], value }
      return next
    })
  }

  const handleSelectScore = (target, value) => {
    if (target === 'A') setScoreA(value)
    else setScoreB(value)
  }

  const handleGenerateResult = () => {
    navigate('/coach-result', {
      state: {
        kitId: kit.id,
        kitTitle: kit.shortTitle,
        framework: kit.framework,
        tone: kit.tone,
        resultTitle: kit.resultTitle,
        summaryTitle: kit.summaryTitle,
        nextActionTitle: kit.nextActionTitle,
        nextAction: kit.nextAction,
        scoreA,
        scoreB,
        steps: steps.map(step => ({
          title: step.title,
          value: step.value,
        })),
      },
    })
  }

  const showScore = kit.id === 'choice'

  return (
    <div className="analyze-page">
      <div className="analyze-body">
        <div className={`kit-hero kit-${kit.id}`}>
          <span className="kit-hero-icon">{kit.icon}</span>
          <div>
            <div className="framework-title">{kit.shortTitle} · {kit.framework}</div>
            <div className="framework-desc">{kit.desc}</div>
          </div>
        </div>

        {steps.map((step, idx) => (
          <div key={step.title} className="analyze-step">
            <div className="step-header">
              <div className="step-num">{idx + 1}</div>
              <span className="step-title">{step.title}</span>
            </div>
            {step.type === 'text' ? (
              <input
                className="step-input"
                placeholder={step.placeholder}
                value={step.value}
                onChange={(e) => handleStepInput(idx, e.target.value)}
              />
            ) : (
              <textarea
                placeholder={step.placeholder}
                value={step.value}
                onChange={(e) => handleStepInput(idx, e.target.value)}
              />
            )}
            {step.hint && <span className="step-hint">{step.hint}</span>}
          </div>
        ))}

        {showScore && (
          <div className="analyze-step">
            <div className="step-header">
              <div className="step-num">{steps.length + 1}</div>
              <span className="step-title">此刻的倾向打分</span>
            </div>
            <span className="step-desc">
              不是让分数替你决定，只是看看此刻身体更靠近哪边。
            </span>
            <div className="score-row">
              <div className="score-group">
                <span className="score-label">选项 A</span>
                <div className="score-options">
                  {SCORES.map(s => (
                    <div
                      key={s}
                      className={`score-btn ${scoreA === s ? 'active' : ''}`}
                      onClick={() => handleSelectScore('A', s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="score-group">
                <span className="score-label">选项 B</span>
                <div className="score-options">
                  {SCORES.map(s => (
                    <div
                      key={s}
                      className={`score-btn ${scoreB === s ? 'active' : ''}`}
                      onClick={() => handleSelectScore('B', s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bottom-bar">
        <button className="btn-primary" onClick={handleGenerateResult}>
          生成锦囊卡片
        </button>
      </div>
    </div>
  )
}
