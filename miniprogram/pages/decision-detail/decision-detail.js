// pages/decision-detail/decision-detail.js
const app = getApp()
const util = require('../../utils/util')
const STAGES = util.DECISION_STAGES

Page({
  data: {
    decision: null,
    stageMeta: {},
    chosenOption: '',
    canStartAction: false,
    canReview: false,
    reviewType: ''
  },

  onLoad(options) {
    const id = options.id
    const decision = app.globalData.decisions.find(d => d.id === id)
    if (!decision) {
      this.setData({ decision: null })
      return
    }

    const stageMeta = util.getStageMeta(decision.stage)
    const chosenOption = (decision.options && decision.choice !== undefined)
      ? decision.options[decision.choice]
      : ''

    // 是否可以标记"开始行动"
    const canStartAction = !decision.actionStarted &&
      !decision.isDraft &&
      (decision.stage === STAGES.SEED || decision.stage === STAGES.SPROUT)

    // 是否可以复盘
    const canReview = !decision.isDraft && ((decision.status === 'pending' && decision.reviewStage !== 'current_done') ||
      (decision.stage === STAGES.FIRST_BLOOM && !decision.resultReviewDone)
    )

    // 复盘类型
    const reviewType = decision.firstReviewDone ? 'result' : 'current'

    this.setData({
      decision,
      stageMeta,
      chosenOption,
      canStartAction,
      canReview,
      reviewType
    })
  },

  onShow() {
    // 从复盘页返回时刷新数据
    if (this.data.decision) {
      this.onLoad({ id: this.data.decision.id })
    }
  },

  onMarkActionStarted() {
    const decision = this.data.decision
    if (!decision) return

    const decisions = app.globalData.decisions
    const idx = decisions.findIndex(d => d.id === decision.id)
    if (idx === -1) return

    const updated = Object.assign({}, decision, {
      actionStarted: true,
      stage: STAGES.LEAF
    })
    decisions[idx] = updated
    util.safeSetStorage('decisions', decisions)
    if (typeof app.refreshStats === 'function') {
      app.refreshStats()
    }

    this.setData({
      decision: updated,
      stageMeta: util.getStageMeta(updated.stage),
      canStartAction: false
    })
    wx.showToast({ title: '已长出新叶', icon: 'success' })
  },

  onGoReview() {
    const id = this.data.decision.id
    wx.navigateTo({ url: '/pages/review/review?id=' + id })
  },

  onContinueRecord() {
    const decision = this.data.decision
    if (!decision) return
    wx.navigateTo({ url: '/pages/record/record?draftId=' + decision.id + '&step=1' })
  },

  onGoBack() {
    wx.switchTab({ url: '/pages/garden/garden' })
  }
})
