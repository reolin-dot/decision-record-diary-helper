import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { buildCoachDecisionDraft, buildDecisionFromCoachDraft } from '../../domain/coachDecisionDrafts.js'
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
  const [saveExpectation, setSaveExpectation] = useState(suggestedDraft.expectation)
  const [saving, setSaving] = useState(false)

  const optionA = {
    title: steps[0]?.value || '选项 A',
    pros: splitLines(steps[1]?.value),
  }
  const optionB = {
    title: steps[2]?.value || '选项 B',
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

    setSaving(true)
    const payload = buildDecisionFromCoachDraft(suggestedDraft, {
      title: saveTitle,
      options: saveOptions,
      choice: saveChoice,
      reason: saveReason,
      expectation: saveExpectation,
    })
    const decision = createDecision(payload)
    setSaving(false)

    if (!decision) {
      toast.show('保存失败，请稍后再试')
      return
    }

    toast.show('已保存到决策花园', { type: 'success' })
    setTimeout(() => navigate(`/decision/${decision.id}`), 500)
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

        <div className="coach-save-panel">
          <div className="coach-save-head">
            <span className="coach-save-kicker">{suggestedDraft.sourceLabel}</span>
            <span className="coach-save-title">保存前确认</span>
            <span className="coach-save-desc">
              已按这个锦囊整理成可复盘的决策记录，你可以轻微改动后直接保存。
            </span>
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
                  className={`coach-save-option ${saveChoice === idx ? 'selected' : ''}`}
                  onClick={() => setSaveChoice(idx)}
                >
                  <input
                    value={option}
                    onChange={(e) => handleSaveOptionInput(idx, e.target.value)}
                    maxLength={80}
                  />
                  <span>{saveChoice === idx ? '当前选择' : '设为选择'}</span>
                </div>
              ))}
            </div>
          </div>

          <label className="coach-save-field">
            <span>{analysis.kitId === 'action' ? '真正卡住的地方' : '保存为选择理由'}</span>
            <textarea
              value={saveReason}
              onChange={(e) => setSaveReason(e.target.value)}
              maxLength={300}
            />
          </label>

          <label className="coach-save-field">
            <span>{analysis.kitId === 'review' ? '这次带走的经验' : '期待或下一步'}</span>
            <textarea
              value={saveExpectation}
              onChange={(e) => setSaveExpectation(e.target.value)}
              maxLength={300}
            />
          </label>

          <button className="save-draft-btn save-primary" onClick={handleSaveDecision} disabled={saving}>
            {saving ? '保存中...' : '保存到我的决策'}
          </button>
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn-secondary" onClick={handleBackToCoach}>
          返回锦囊
        </button>
      </div>
    </div>
  )
}
