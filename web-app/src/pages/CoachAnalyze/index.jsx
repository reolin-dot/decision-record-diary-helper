import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getCoachKit } from '../Coach/coachKits.js'
import './analyze.css'

const SCORES = [1, 2, 3, 4, 5]

export default function CoachAnalyze() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const kit = getCoachKit(searchParams.get('kit'))
  const question = location.state?.question || ''
  const options = location.state?.options || []

  const [steps, setSteps] = useState(kit.steps.map((step, index) => ({
    ...step,
    value: location.state?.steps?.[index]?.value ?? (
      kit.id === 'choice' && index === 0
        ? options[0] || ''
        : kit.id === 'choice' && index === 2
          ? options[1] || ''
          : ''
    ),
  })))
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
        question,
        options,
        steps: steps.map(step => ({
          title: step.title,
          value: step.value,
        })),
      },
    })
  }

  const showScore = kit.id === 'choice'
  const answerSteps = steps
    .map((step, index) => ({ step, index }))
    .filter(({ index }) => kit.id !== 'choice' || (index !== 0 && index !== 2))
  const answeredCount = answerSteps.filter(({ step }) => step.value.trim()).length
  const latestAnswers = answerSteps.filter(({ step }) => step.value.trim()).slice(-2)

  return (
    <div className="analyze-page">
      <div className="analyze-body">
        <div className={`kit-hero kit-${kit.id}`}>
          <span className="kit-hero-icon">{kit.icon}</span>
          <div>
            <div className="framework-title">{kit.perspectiveLabel} · {kit.framework}</div>
            <div className="framework-desc">{kit.desc}</div>
          </div>
        </div>

        <div className="live-decision-card">
          <span className="live-card-kicker">实时决策卡</span>
          <strong>{question || '还没有带入问题'}</strong>
          <div className="live-card-options">
            {options.map((option, index) => <span key={index}>{String.fromCharCode(65 + index)} · {option}</span>)}
          </div>
          {latestAnswers.map(({ step }) => (
            <span className="live-card-answer" key={step.title}>{step.title}：{step.value}</span>
          ))}
          <span className="live-card-progress">已回答 {answeredCount} / {answerSteps.length} 个关键问题</span>
        </div>

        {answerSteps.map(({ step, index }, displayIndex) => (
          <div key={step.title} className="analyze-step">
            <div className="step-header">
              <div className={`step-num ${step.value.trim() ? 'done' : ''}`}>{displayIndex + 1}</div>
              <span className="step-title">{step.title}</span>
            </div>
            {step.type === 'text' ? (
              <input
                className="step-input"
                placeholder={step.placeholder}
                value={step.value}
                onChange={(e) => handleStepInput(index, e.target.value)}
              />
            ) : (
              <textarea
                placeholder={step.placeholder}
                value={step.value}
                onChange={(e) => handleStepInput(index, e.target.value)}
              />
            )}
            {step.hint && <span className="step-hint">{step.hint}</span>}
          </div>
        ))}

        {showScore && (
          <div className="analyze-step">
            <div className="step-header">
              <div className="step-num">{answerSteps.length + 1}</div>
              <span className="step-title">此刻的倾向打分</span>
            </div>
            <span className="step-desc">
              不是让分数替你决定，只是看看此刻身体更靠近哪边。
            </span>
            <div className="score-row">
              <div className="score-group">
                <span className="score-label">{options[0] || '选项 A'}</span>
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
                <span className="score-label">{options[1] || '选项 B'}</span>
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
          看看现在能否选择
        </button>
      </div>
    </div>
  )
}
