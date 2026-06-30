const app = getApp()
const util = require('../../utils/util')
const STAGES = util.DECISION_STAGES

Page({
  data: {
    decision: null,
    stageMeta: {},
    canReview: false,
    reviewType: '',
    reviewTypeName: '',
    resultRating: '',
    reflection: '',
    lesson: '',
    resultOptions: ['比预期更好', '基本符合预期', '还不确定', '和预期不同', '需要调整'],
    // 跟进选择弹窗
    showFollowUpModal: false,
    followUpOptions: [
      { key: 'done', label: '完成了，不再提醒' },
      { key: '1', label: '再进行 1 次跟进复盘' },
      { key: '2', label: '再进行 2 次跟进复盘' },
      { key: '3', label: '再进行 3 次跟进复盘' },
      { key: 'custom', label: '自定义次数…' }
    ],
    customFollowUpCount: '',
    submitting: false,
    showCustomInput: false
  },

  onLoad(options) {
    // id 保持字符串格式，与 generateId() 生成的格式一致
    const id = options.id
    const decision = app.globalData.decisions.find(d => d.id === id)

    // 兼容旧数据：将 reviewResult 迁移到 wateringHistory
    if (decision && decision.reviewResult && !decision.wateringHistory) {
      decision.wateringHistory = [decision.reviewResult]
      // 回写 storage
      const decisions = app.globalData.decisions
      const idx = decisions.findIndex(d => d.id === decision.id)
      if (idx !== -1) {
        decisions[idx] = decision
        util.safeSetStorage('decisions', decisions)
      }
    }

    const reviewType = (decision && decision.firstReviewDone) ? 'result' : 'current'
    this.setData({
      decision,
      stageMeta: decision ? util.getStageMeta(decision.stage) : {},
      canReview: this.canShowReviewForm(decision),
      reviewType: reviewType,
      reviewTypeName: reviewType === 'result' ? '结果复盘' : '当下复盘'
    })
  },

  onMarkActionStarted() {
    const decision = this.data.decision
    if (!decision) return

    const updatedDecision = Object.assign({}, decision, {
      actionStarted: true,
      stage: STAGES.LEAF
    })

    if (this.saveDecision(updatedDecision)) {
      this.setData({
        decision: updatedDecision,
        stageMeta: util.getStageMeta(updatedDecision.stage),
        canReview: this.canShowReviewForm(updatedDecision)
      })
      wx.showToast({ title: '已长出新叶', icon: 'success' })
    }
  },

  onSelectResult(e) {
    this.setData({ resultRating: e.currentTarget.dataset.value })
  },

  onReflectionInput(e) {
    this.setData({ reflection: e.detail.value })
  },

  onLessonInput(e) {
    this.setData({ lesson: e.detail.value })
  },

  onCompleteReview() {
    if (!this.data.resultRating) {
      wx.showToast({ title: '先选择当前状态', icon: 'none' })
      return
    }
    if (this.data.submitting) return

    // 暂存本次复盘结果，等用户选择跟进方案后再一起保存
    this._pendingResult = {
      date: util.formatDate(new Date()),
      rating: this.data.resultRating,
      reflection: this.data.reflection,
      lesson: this.data.lesson,
      type: this.getNextReviewType()
    }

    this.setData({ showFollowUpModal: true, customFollowUpCount: '' })
  },

  onCancelFollowUp() {
    // 用户关闭弹窗 → 直接完成，不再提醒
    this.saveReviewResult(0)
  },

  onChooseFollowUp(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'custom') {
      this.setData({ showCustomInput: true })
      return
    }
    if (key === 'done') {
      this.saveReviewResult(0)
      return
    }
    this.saveReviewResult(parseInt(key, 10))
  },

  onCustomFollowUpInput(e) {
    this.setData({ customFollowUpCount: e.detail.value })
  },

  onConfirmCustomFollowUp() {
    const n = parseInt(this.data.customFollowUpCount, 10)
    if (!n || n < 1 || n > 20) {
      wx.showToast({ title: '请输入 1~20 之间的数字', icon: 'none' })
      return
    }
    this.saveReviewResult(n)
  },

  saveReviewResult(extraChoice) {
    if (this.data.submitting) return
    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })

    const decision = this.data.decision
    if (!decision) return

    const today = util.formatDate(new Date())

    // 追加一次复盘记录
    const wateringHistory = decision.wateringHistory || []
    wateringHistory.push(this._pendingResult)

    // 复盘次数 = 历史记录长度
    const wateringCount = wateringHistory.length

    // 用户选择：0 = 完成，N = 还需 N 次
    let maxWaterings
    if (extraChoice === 0) {
      // 用户选择直接完成
      maxWaterings = wateringCount
    } else {
      // 用户选择再跟 N 次：已完成次数 + N
      maxWaterings = wateringCount + extraChoice
    }

    const isDone = wateringCount >= maxWaterings
    const reviewType = this._pendingResult.type
    let updatedDecision

    if (isDone) {
      updatedDecision = Object.assign({}, decision, {
        status: 'reviewed',
        stage: reviewType === 'result' ? STAGES.FULL_BLOOM : STAGES.FIRST_BLOOM,
        firstReviewDone: true,
        resultReviewDone: reviewType === 'result',
        wateringHistory,
        wateringCount,
        maxWaterings,
        lastWateredAt: today
      })
    } else {
      const nextDate = util.addDays(today, 7)
      updatedDecision = Object.assign({}, decision, {
        status: 'pending',
        stage: STAGES.FIRST_BLOOM,
        firstReviewDone: true,
        wateringHistory,
        wateringCount,
        maxWaterings,
        lastWateredAt: today,
        reviewDate: nextDate
      })
    }

    if (!this.saveDecision(updatedDecision)) {
      wx.hideLoading()
      this.setData({ submitting: false, showFollowUpModal: false, showCustomInput: false })
      wx.showToast({ title: '存储失败，请清理微信存储空间', icon: 'none' })
      return
    }

    this.setData({
      decision: updatedDecision,
      stageMeta: util.getStageMeta(updatedDecision.stage),
      canReview: this.canShowReviewForm(updatedDecision),
      showFollowUpModal: false,
      showCustomInput: false,
      customFollowUpCount: ''
    })

    wx.hideLoading()
    const msg = isDone
      ? (reviewType === 'result' ? '结果复盘完成' : '当下复盘完成')
      : '已记录，还剩 ' + (maxWaterings - wateringCount) + ' 次跟进复盘'
    wx.showToast({ title: msg, icon: 'success' })

    setTimeout(() => {
      this.setData({ submitting: false })
      wx.switchTab({ url: '/pages/garden/garden' })
    }, 800)
  },

  onGoBack() {
    wx.switchTab({ url: '/pages/garden/garden' })
  },

  getNextReviewType() {
    const decision = this.data.decision || {}
    return decision.firstReviewDone ? 'result' : 'current'
  },

  canShowReviewForm(decision) {
    if (!decision) return false
    if (decision.status === 'pending') return true
    return decision.stage === STAGES.FIRST_BLOOM && !decision.resultReviewDone
  },

  saveDecision(updatedDecision) {
    const decisions = app.globalData.decisions
    const idx = decisions.findIndex(d => d.id === updatedDecision.id)
    if (idx === -1) return false
    decisions[idx] = updatedDecision
    return util.safeSetStorage('decisions', decisions)
  }
})
