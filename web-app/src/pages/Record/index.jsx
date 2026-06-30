import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useModal } from '../../components/Modal.jsx'
import { formatDate, generateId, getReviewDate } from '../../utils/util.js'
import { DECISION_STAGES } from '../../domain/decisionStages.js'
import './record.css'

const MOODS = ['焦虑', '纠结', '冲动', '平静', '其他']
const TIME_OPTIONS = [
  { key: '1w', value: '1 周', label: '后复盘' },
  { key: '1m', value: '1 个月', label: '后复盘' },
  { key: '3m', value: '3 个月', label: '后复盘' },
]

export default function Record() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { decisions, saveDecision, createDecision } = useApp()
  const toast = useToast()
  const modal = useModal()

  const initialStep = parseInt(searchParams.get('step'), 10) || 1
  const draftId = searchParams.get('draftId') || ''
  const coachDraft = location.state?.coachDraft

  const [step, setStep] = useState(initialStep)
  const [editingDraft, setEditingDraft] = useState(false)
  const [title, setTitle] = useState('')
  const [background, setBackground] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [selectedOption, setSelectedOption] = useState(-1)
  const [choiceReason, setChoiceReason] = useState('')
  const [expectation, setExpectation] = useState('')
  const [reviewPeriod, setReviewPeriod] = useState('1w')
  const [customDate, setCustomDate] = useState('')
  const [saving, setSaving] = useState(false)

  const today = formatDate(new Date())

  // Load draft if draftId provided
  useEffect(() => {
    if (draftId) {
      const draft = decisions.find(d => d.id === draftId && d.isDraft)
      if (!draft) {
        toast.show('没有找到这颗种子')
        return
      }
      const opts = [...(draft.options || [])]
      while (opts.length < 2) opts.push('')
      setEditingDraft(true)
      setTitle(draft.title || '')
      setBackground(draft.background || '')
      setSelectedMood(draft.mood || '')
      setOptions(opts)
      setSelectedOption(typeof draft.choice === 'number' ? draft.choice : -1)
      setChoiceReason(draft.reason || '')
      setExpectation(draft.expectation || '')
      setCustomDate(draft.reviewDate || '')
      if (draft.reviewDate) setReviewPeriod('custom')
    }
  }, [draftId])

  useEffect(() => {
    if (!coachDraft || draftId) return

    const opts = [...(coachDraft.options || [])].filter(Boolean)
    while (opts.length < 2) opts.push('')

    setTitle(coachDraft.title || '')
    setBackground(coachDraft.background || '')
    setOptions(opts)
    setChoiceReason(coachDraft.reason || '')
    setExpectation(coachDraft.expectation || '')
  }, [coachDraft, draftId])

  const validateCurrentStep = useCallback(() => {
    if (step === 1 && !title.trim()) {
      toast.show('先写一个决策标题')
      return false
    }
    if (step === 2) {
      const validOptions = options.filter(o => o.trim())
      if (validOptions.length < 2) {
        toast.show('至少写下 2 个选项')
        return false
      }
    }
    if (step === 3 && selectedOption < 0) {
      toast.show('请选择最终方案')
      return false
    }
    return true
  }, [step, title, options, selectedOption, toast])

  const buildDecisionPayload = useCallback((isDraft) => {
    const createdAt = formatDate(new Date())
    const validOptions = options.filter(o => o.trim())
    let reviewDate = ''
    if (!isDraft) {
      if (reviewPeriod === 'custom' && customDate) {
        reviewDate = customDate
      } else {
        reviewDate = getReviewDate(createdAt, reviewPeriod)
      }
    }
    return {
      title: title.trim(),
      background: background.trim(),
      options: validOptions,
      choice: selectedOption,
      reason: choiceReason.trim(),
      expectation: expectation.trim(),
      mood: selectedMood,
      createdAt,
      reviewDate,
      status: isDraft ? 'draft' : 'pending',
      reviewStage: 'none',
      stage: isDraft ? DECISION_STAGES.SEED : DECISION_STAGES.SPROUT,
      actionStarted: false,
      firstReviewDone: false,
      resultReviewDone: false,
      wateringHistory: [],
      maxWaterings: 1,
      isDraft,
    }
  }, [title, background, options, selectedOption, choiceReason, expectation, selectedMood, reviewPeriod, customDate])

  const upsertDecision = useCallback((payload) => {
    if (draftId || editingDraft) {
      const existing = decisions.find(d => d.id === (draftId || editingDraft))
      if (existing) {
        const merged = {
          ...existing,
          ...payload,
          id: existing.id,
          createdAt: existing.createdAt || payload.createdAt,
          wateringHistory: existing.wateringHistory || [],
        }
        return saveDecision(merged)
      }
    }
    const decision = { id: generateId(), ...payload }
    return saveDecision(decision)
  }, [draftId, editingDraft, decisions, saveDecision])

  const handleBack = async () => {
    if (step > 1) {
      const hasInput = title.trim() || options.some(o => o.trim())
      if (hasInput) {
        const confirmed = await modal.confirm({
          title: '确认退出',
          content: '当前记录尚未保存，退出后已填内容将丢失。',
          confirmText: '放弃',
          cancelText: '继续编辑',
        })
        if (confirmed) {
          navigate(-1)
        }
        return
      }
      setStep(s => s - 1)
    } else {
      navigate(-1)
    }
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return
    if (step < 4) setStep(s => s + 1)
  }

  const handleComplete = () => {
    if (!validateCurrentStep()) return
    if (saving) return
    setSaving(true)
    const ok = upsertDecision(buildDecisionPayload(false))
    setTimeout(() => {
      setSaving(false)
      if (!ok) {
        toast.show('存储失败，请清理浏览器存储空间')
        return
      }
      navigate('/record-success')
    }, 400)
  }

  const handleSaveDraft = () => {
    if (saving) return
    if (!title.trim()) {
      toast.show('先写一个决策标题')
      return
    }
    setSaving(true)
    const ok = upsertDecision(buildDecisionPayload(true))
    setSaving(false)
    if (!ok) {
      toast.show('保存失败，请稍后再试')
      return
    }
    toast.show('已保存为种子', { type: 'success' })
    setTimeout(() => navigate('/'), 600)
  }

  const handleSkipReview = async () => {
    const confirmed = await modal.confirm({
      title: '确认跳过',
      content: '跳过后将保存当前已填内容，未填部分将留空。确认跳过吗？',
      confirmText: '确认跳过',
      cancelText: '继续填写',
    })
    if (!confirmed) return
    setSaving(true)
    upsertDecision(buildDecisionPayload(false))
    setTimeout(() => {
      setSaving(false)
      navigate('/record-success')
    }, 400)
  }

  const handleOptionInput = (idx, value) => {
    setOptions(prev => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleAddOption = () => {
    if (options.length < 6) setOptions(prev => [...prev, ''])
  }

  const handleDatePicker = (e) => {
    const val = e.target.value
    if (val < today) {
      toast.show('不能选择过去的日期')
      return
    }
    setCustomDate(val)
    setReviewPeriod('custom')
  }

  return (
    <div className="record-page">
      {/* Header */}
      <div className="record-header">
        <button className="record-back-btn" onClick={handleBack}>‹</button>
        <span className="record-header-title">记录决策</span>
        <span className="record-header-action">{step}/4</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        {[1, 2, 3, 4].map(s => (
          <div
            key={s}
            className={`progress-step ${step > s ? 'done' : step === s ? 'current' : ''}`}
          />
        ))}
      </div>
      <div className="progress-label">步骤 {step} / 4</div>

      {/* Body */}
      <div className="record-body">
        {/* Step 1: Describe */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-title">描述你的决策</div>
            <div className="step-desc">把要做决定的事情写下来，帮自己理清思路。</div>

            <div className="form-group">
              <label className="form-label">决策标题 <span className="required">必填</span></label>
              <input
                className="form-input"
                placeholder="例如：要不要换工作"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={50}
              />
              <div className="form-hint">用一句话概括这个决策</div>
            </div>

            <div className="form-group">
              <label className="form-label">背景描述 <span className="optional">选填</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="简单描述一下事情的来龙去脉"
                value={background}
                onChange={e => setBackground(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label className="form-label">此刻的心情 <span className="optional">选填</span></label>
              <div className="mood-chip-group">
                {MOODS.map(m => (
                  <div
                    key={m}
                    className={`mood-chip ${selectedMood === m ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Options */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-title">列出你的选项</div>
            <div className="step-desc">把可选的方案都写下来，最多 6 个。</div>

            <div className="option-list">
              {options.map((opt, idx) => (
                <div key={idx} className="option-card">
                  <div className="option-letter">{idx + 1}</div>
                  <input
                    className="option-input"
                    placeholder="输入选项内容"
                    value={opt}
                    onChange={e => handleOptionInput(idx, e.target.value)}
                    maxLength={100}
                  />
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <div className="add-option-btn" onClick={handleAddOption}>
                <span className="add-option-icon">+</span>
                <span>添加选项</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Choice */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-title">做出你的选择</div>
            <div className="step-desc">选一个你目前决定采用的方案，并写下原因。</div>

            <div className="form-group">
              <label className="form-label">选择方案 <span className="required">必填</span></label>
              <div className="choice-list">
                {options.filter(o => o.trim()).map((opt, idx) => (
                  <div
                    key={idx}
                    className={`choice-item ${selectedOption === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedOption(idx)}
                  >
                    <div className="choice-radio">
                      {selectedOption === idx && <div className="choice-radio-inner" />}
                    </div>
                    <span className="choice-letter">{idx + 1}</span>
                    <span className="choice-text">{opt || '未填写'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">选择理由 <span className="optional">选填</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="为什么选这个方案？"
                value={choiceReason}
                onChange={e => setChoiceReason(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label className="form-label">预期结果 <span className="optional">选填</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="你期待这个选择带来什么结果？"
                value={expectation}
                onChange={e => setExpectation(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review time */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-title">设置复盘时间</div>
            <div className="step-desc">定期回顾决策结果，才能不断成长。</div>

            <div className="form-group">
              <label className="form-label">多久后复盘？</label>
              <div className="time-chip-grid">
                {TIME_OPTIONS.map(t => (
                  <div
                    key={t.key}
                    className={`time-chip ${reviewPeriod === t.key ? 'selected' : ''}`}
                    onClick={() => setReviewPeriod(t.key)}
                  >
                    <span className="time-chip-value">{t.value}</span>
                    <span className="time-chip-label">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">自定义日期 <span className="optional">选填</span></label>
              <input
                type="date"
                className="date-picker-input"
                value={customDate}
                min={today}
                max="2030-12-31"
                onChange={handleDatePicker}
              />
            </div>

            {title && (
              <div className="review-summary">
                <div className="review-summary-title">决策摘要</div>
                <div className="review-summary-item">
                  <span className="review-summary-label">决策：</span>
                  <span className="review-summary-value">{title}</span>
                </div>
                {selectedOption >= 0 && options[selectedOption] && (
                  <div className="review-summary-item">
                    <span className="review-summary-label">选择：</span>
                    <span className="review-summary-value">{options[selectedOption]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="record-footer">
        {step < 4 ? (
          <>
            <button className="btn-primary" onClick={handleNext} disabled={saving}>
              下一步
            </button>
            {title && (
              <div className="skip-link" onClick={handleSaveDraft}>先保存为种子</div>
            )}
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={handleComplete} disabled={saving}>
              完成记录
            </button>
            <div className="skip-link" onClick={handleSkipReview}>跳过，直接保存</div>
          </>
        )}
      </div>
    </div>
  )
}
