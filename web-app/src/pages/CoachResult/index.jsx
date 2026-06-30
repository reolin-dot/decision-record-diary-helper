import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import './result.css'

function splitLines(value) {
  return (value || '')
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean)
}

function AnswerCard({ title, value }) {
  const lines = splitLines(value)
  if (lines.length === 0) return null

  return (
    <div className="coach-result-answer">
      <span className="coach-result-answer-title">{title}</span>
      <div className="coach-result-lines">
        {lines.map((line, idx) => (
          <span key={`${title}-${idx}`} className="coach-result-line">
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

function buildCoachDraft(analysis) {
  const steps = analysis.steps || []
  const getValue = (idx) => steps[idx]?.value?.trim() || ''

  if (analysis.kitId === 'choice') {
    const optionA = getValue(0) || '选项 A'
    const optionB = getValue(2) || '选项 B'
    return {
      title: `锦囊决策：${optionA} / ${optionB}`,
      background: getValue(4),
      options: [optionA, optionB],
      reason: `来自${analysis.kitTitle || '决策锦囊'}：${analysis.nextAction || ''}`,
      expectation: '希望通过这次记录，把锦囊里的思考变成可复盘的行动。',
    }
  }

  const firstAnswer = getValue(0)
  return {
    title: `锦囊记录：${analysis.kitTitle || '决策锦囊'}`,
    background: steps
      .filter(step => step.value?.trim())
      .map(step => `${step.title}\n${step.value.trim()}`)
      .join('\n\n'),
    options: [firstAnswer || analysis.nextAction || '先做一个小行动', '暂时不行动，继续观察'],
    reason: analysis.nextAction || '',
    expectation: '希望把这次锦囊里的线索，沉淀成后续可以复盘的记录。',
  }
}

export default function CoachResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const analysis = location.state || {}

  const scoreA = Number(analysis.scoreA || searchParams.get('scoreA')) || 3
  const scoreB = Number(analysis.scoreB || searchParams.get('scoreB')) || 3
  const steps = analysis.steps || []
  const isChoice = analysis.kitId === 'choice'
  const filledSteps = steps.filter(step => step.value?.trim())

  const optionA = {
    title: steps[0]?.value || '选项 A',
    pros: splitLines(steps[1]?.value),
  }
  const optionB = {
    title: steps[2]?.value || '选项 B',
    pros: splitLines(steps[3]?.value),
  }

  const handleSaveDecision = () => {
    navigate('/record?step=1&from=coach', {
      state: {
        coachDraft: buildCoachDraft(analysis),
      },
    })
  }

  const handleBackToCoach = () => {
    navigate('/coach')
  }

  return (
    <div className="page-container">
      <div className="result-body">
        <div className="coach-result-hero">
          <span className="coach-result-kicker">{analysis.kitTitle || '决策锦囊'}</span>
          <h1 className="coach-result-title">{analysis.resultTitle || '先把思路放到桌面上'}</h1>
          <p className="coach-result-desc">
            这张卡片不是标准答案，而是帮你把此刻的判断、情绪和下一步行动分开放好。
          </p>
        </div>

        {isChoice && (
          <div className="result-card">
            <span className="result-card-title">利弊对比分析</span>
            <div className="result-comparison">
              <div className="result-col">
                <span className="result-col-title">{optionA.title}</span>
                {optionA.pros.length === 0 && (
                  <span className="result-empty">暂未填写这个选项的好处</span>
                )}
                {optionA.pros.map((item, idx) => (
                  <span key={`a-pro-${idx}`} className="result-item pro">+ {item}</span>
                ))}
              </div>

              <div className="result-col">
                <span className="result-col-title">{optionB.title}</span>
                {optionB.pros.length === 0 && (
                  <span className="result-empty">暂未填写这个选项的好处</span>
                )}
                {optionB.pros.map((item, idx) => (
                  <span key={`b-pro-${idx}`} className="result-item pro">+ {item}</span>
                ))}
              </div>
            </div>

            <div className="result-score">
              <span className="score-label">此刻倾向参考</span>
              <div className="score-values">
                <div className="score-item">
                  <span>选项 A</span>
                  <span className="score-value">{scoreA}</span>
                </div>
                <div className="score-item">
                  <span>选项 B</span>
                  <span className="score-value">{scoreB}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="coach-result-section">
          <span className="coach-result-section-title">
            {analysis.summaryTitle || '你刚刚写下的线索'}
          </span>
          {filledSteps.length > 0 ? (
            filledSteps.map(step => (
              <AnswerCard key={step.title} title={step.title} value={step.value} />
            ))
          ) : (
            <div className="coach-result-empty">
              还没有填写内容。你可以返回锦囊补充几句话，再生成卡片。
            </div>
          )}
        </div>

        <div className="coach-result-next">
          <span className="coach-result-next-title">
            {analysis.nextActionTitle || '下一步小行动'}
          </span>
          <span className="coach-result-next-text">
            {analysis.nextAction || '先选一个最小动作，让这个决定可以被推进和复盘。'}
          </span>
        </div>

        <div className="disclaimer">
          锦囊只提供思考结构，不替你做判断。真正重要的是：你愿意把这次选择记录下来，并在之后温柔地复盘它。
        </div>

        <button className="save-draft-btn" onClick={handleSaveDecision}>
          保存到我的决策
        </button>
      </div>

      <div className="bottom-bar">
        <button className="btn-secondary" onClick={handleBackToCoach}>
          返回锦囊
        </button>
      </div>
    </div>
  )
}
