// pages/garden/garden.js
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    statusBarHeight: 0,
    stats: {},
    pendingReviews: [],
    recentDecisions: [],
    flowerGrid: [],
    latestLesson: '',
    decisions: [],
    isEmpty: false,
    isNewUser: false
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: systemInfo.statusBarHeight || 0 })
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  refreshData() {
    const decisions = app.globalData.decisions || []
    const today = util.formatDate(new Date())
    const decorated = decisions.map(d => {
      const stageMeta = util.getStageMeta(d.stage)
      return Object.assign({}, d, {
        stageIcon: stageMeta.icon,
        stageLabel: stageMeta.label,
        stageDesc: stageMeta.description
      })
    })
    const sorted = decorated.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    const pendingReviews = decorated.filter(d => {
      return d.status === 'pending' && d.reviewDate && d.reviewDate <= today
    })
    const fullBloomCount = decorated.filter(d => d.stage === 'full_bloom' || d.stage === 'bloom').length
    const growingCount = decorated.filter(d => ['sprout', 'leaf', 'first_bloom'].indexOf(d.stage) !== -1).length
    // 新用户标记只在首次进入时设置，不随 onShow 重复刷新
    if (this._isNewUser === undefined) {
      this._isNewUser = (app.globalData.isNewUser || false) && decisions.length === 0
      if (app.globalData.isNewUser) {
        app.globalData.isNewUser = false
      }
    }
    // 提取最近一次复盘的 lesson 作为成长片段
    let latestLesson = ''
    let latestLessonDate = ''
    sorted.forEach(d => {
      if (d.wateringHistory && d.wateringHistory.length > 0) {
        const lastReview = d.wateringHistory[d.wateringHistory.length - 1]
        if (lastReview.lesson && (!latestLessonDate || lastReview.date > latestLessonDate)) {
          latestLesson = lastReview.lesson
          latestLessonDate = lastReview.date
        }
      }
    })

    this.setData({
      stats: Object.assign({}, app.globalData.stats, {
        bloomedCount: fullBloomCount,
        growingCount
      }),
      pendingReviews,
      recentDecisions: sorted.slice(0, 5),
      flowerGrid: sorted,
      latestLesson,
      decisions: decorated,
      isEmpty: decisions.length === 0,
      isNewUser: this._isNewUser && decisions.length === 0
    })
  },

  onPlantFlower() {
    // 未做过风格测试，先引导测试
    if (!app.globalData.hasStyleTest) {
      wx.navigateTo({ url: '/pages/style-test/style-test' })
    } else {
      wx.navigateTo({ url: '/pages/record/record?step=1' })
    }
  },

  onWatering() {
    wx.navigateTo({ url: '/pages/watering/watering' })
  },

  onGoCoach() {
    wx.switchTab({ url: '/pages/coach/coach' })
  },

  onGoProfile() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },

  onGoDecision(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/decision-detail/decision-detail?id=' + id })
  }
})
