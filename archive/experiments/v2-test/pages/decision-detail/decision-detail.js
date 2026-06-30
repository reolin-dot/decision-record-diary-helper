// pages/decision-detail/decision-detail.js
const app = getApp()
const util = require('../../utils/util')
const dataService = require('../../utils/data-service')
const STAGES = util.DECISION_STAGES

Page({
  data: {
    decision: null,
    stageMeta: {},
    categoryMeta: null,
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

    // 分类信息
    const categories = dataService.getCategories()
    const categoryMeta = decision.category && categories[decision.category]
      ? categories[decision.category]
      : null

    // 是否可以标记"开始行动"
    const canStartAction = !decision.actionStarted &&
      (decision.stage === STAGES.SEED || decision.stage === STAGES.SPROUT)

    // 是否可以复盘
    const canReview = decision.status === 'pending' ||
      (decision.stage === STAGES.FIRST_BLOOM && !decision.resultReviewDone)

    // 复盘类型
    const reviewType = decision.firstReviewDone ? 'result' : 'current'

    this.setData({
      decision,
      stageMeta,
      categoryMeta,
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

  onGoBack() {
    wx.switchTab({ url: '/pages/garden/garden' })
  }
})
