import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { buildCoachDecisionDraft, buildDecisionFromCoachDraft } from '../../domain/coachDecisionDrafts.js'
import { buildPendingInformation } from '../../domain/roundtableFlow.js'
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

export default function CoachResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { createDecision } = useApp()
  const toast = useToast()
  const analysis = location.state || {}

  const scoreA = Number(analysis.scoreA || searchParams.get('scoreA')) || 3
  const scoreB = Number(analysis.scoreB || searchParams.get('scoreB')) || 3
  const normalizedAnalysis = { ...analysis, scoreA, scoreB }
  const suggestedDraft = buildCoachDecisionDraft(normalizedAnalysis)
  const steps = analysis.steps || []
  const isChoice = analysis.kitId === 'choice'
  const filledSteps = steps.filter(step => step.value?.trim())
  const [saveTitle, setSaveTitle] = useState(suggestedDraft.title)
  const [saveOptions, setSaveOptions] = useState(suggestedDraft.options)
  const [saveChoice, setSaveChoice] = useState(suggestedDraft.choice)
  const [saveReason, setSaveReason] = useState(suggestedDraft.reason)
  const [choiceStatus, setChoiceStatus] = useState('')
  const [pendingInformation, setPendingInformation] = useState(buildPendingInformation(steps))
  const [smallestAction, setSmallestAction] = useState(analysis.nextAction || suggestedDraft.expectation)
  const [reviewPeriod, setReviewPeriod] = useState('1w')
  const [saving, setSaving] = useState(false)

  const optionA = {
    title: analysis.options?.[0] || steps[0]?.value || '选项 A',
    pros: splitLines(steps[1]?.value),
  }
  const optionB = {
    title: analysis.options?.[1] || steps[2]?.value || '选项 B',
    pros: splitLines(steps[3]?.value),
  }

  const handleSaveOptionInput = (idx, value) => {
    setSaveOptions(prev => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleSaveDecision = () => {
    if (saving) return
    if (!saveTitle.trim()) {
      toast.show('先补一个决策标题')
      return
    }
    if (saveOptions.filter(item => item.trim()).length < 2) {
      toast.show('至少保留 2 个可复盘选项')
      return
    }
    if (!choiceStatus) {
      toast.show('先确认现在能不能做选择')
      return
    }
    if (choiceStatus === 'chosen' && (saveChoice < 0 || saveChoice >= saveOptions.length)) {
      toast.show('请选择当前更倾向的选项')
      return
    }
    if (!smallestAction.trim()) {
      toast.show('写下一个现在能做的最小行动')
      return
    }

    setSaving(true)
    const payload = buildDecisionFromCoachDraft(suggestedDraft, {
      title: saveTitle,
      options: saveOptions,
      choice: choiceStatus === 'chosen' ? saveChoice : -1,
      reason: saveReason,
      pendingInformation: choiceStatus === 'pending' ? pendingInformation : '',
      smallestAction,
      reviewPeriod,
    })
    const decision = createDecision(payload)
    setSaving(false)

    if (!decision) {
      toast.show('保存失败，请稍后再试')
      return
    }

    toast.show(choiceStatus === 'chosen' ? '已种入花园' : '已作为待确认种子保存', { type: 'success' })
    setTimeout(() => navigate(`/decision/${decision.id}`), 500)
  }

  const handleBackToCoach = () => {
    navigate(`/coach-analyze?kit=${analysis.kitId || 'choice'}`, { state: analysis })
  }

  return (
    <div className="page-container">
      <div className="result-body">
        <div className="coach-result-hero">
          <span className="coach-result-kicker">{analysis.kitTitle || '决策圆桌'}</span>
          <h1 className="coach-result-title">{analysis.resultTitle || '先把思路放到桌面上'}</h1>
          <p className="coach-result-desc">
            这张卡片会保留此刻的问题、选项、判断和下一步行动。不能马上选择也没关系。
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
              还没有填写内容。你可以返回圆桌补充几句话，再生成卡片。
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
          圆桌只提供思考结构，不替你做判断。真正重要的是：把此刻判断留下来，并在之后回来复盘。
        </div>

        <div className="coach-save-panel">
          <div className="coach-save-head">
            <span className="coach-save-kicker">{suggestedDraft.sourceLabel}</span>
            <span className="coach-save-title">完成这张决策卡</span>
            <span className="coach-save-desc">
              先判断现在能否选择，再写下一个最小行动。两种情况都可以种进花园。
            </span>
          </div>

          <div className="coach-save-field">
            <span>现在能做选择吗？</span>
            <div className="decision-readiness">
              <button
                type="button"
                className={choiceStatus === 'chosen' ? 'active' : ''}
                onClick={() => setChoiceStatus('chosen')}
              >
                能，确认当前选择
              </button>
              <button
                type="button"
                className={choiceStatus === 'pending' ? 'active' : ''}
                onClick={() => setChoiceStatus('pending')}
              >
                还不能，先补信息
              </button>
            </div>
          </div>

          <label className="coach-save-field">
            <span>决策标题</span>
            <input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              maxLength={60}
            />
          </label>

          <div className="coach-save-field">
            <span>保留下来的选项</span>
            <div className="coach-save-options">
              {saveOptions.map((option, idx) => (
                <div
                  key={idx}
                  className={`coach-save-option ${choiceStatus === 'chosen' && saveChoice === idx ? 'selected' : ''}`}
                  onClick={() => setSaveChoice(idx)}
                >
                  <input
                    value={option}
                    onChange={(e) => handleSaveOptionInput(idx, e.target.value)}
                    maxLength={80}
                  />
                  <span>{choiceStatus === 'chosen' && saveChoice === idx ? '当前选择' : '选择这个'}</span>
                </div>
              ))}
            </div>
          </div>

          {choiceStatus === 'pending' && (
            <label className="coach-save-field">
              <span>还需要确认什么？</span>
              <textarea
                value={pendingInformation}
                onChange={(e) => setPendingInformation(e.target.value)}
                maxLength={300}
              />
            </label>
          )}

          <label className="coach-save-field">
            <span>{analysis.kitId === 'action' ? '真正卡住的地方' : choiceStatus === 'pending' ? '当前判断或暂缓理由' : '保存为选择理由'}</span>
            <textarea
              value={saveReason}
              onChange={(e) => setSaveReason(e.target.value)}
              maxLength={300}
            />
          </label>

          <label className="coach-save-field">
            <span>现在能做的最小行动</span>
            <textarea
              value={smallestAction}
              onChange={(e) => setSmallestAction(e.target.value)}
              maxLength={300}
            />
          </label>

          <label className="coach-save-field">
            <span>什么时候回来复盘？</span>
            <select value={reviewPeriod} onChange={(e) => setReviewPeriod(e.target.value)}>
              <option value="1w">一周后</option>
              <option value="1m">一个月后</option>
              <option value="3m">三个月后</option>
            </select>
          </label>

          <button className="save-draft-btn save-primary" onClick={handleSaveDecision} disabled={saving}>
            {saving ? '种入花园中...' : '种入花园并设置复盘'}
          </button>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn-secondary" onClick={handleBackToCoach}>
          返回圆桌追问
        </button>
      </div>
    </div>
  )
}
