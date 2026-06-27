// pages/watering/watering.js
const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    pendingDecisions: [],
    today: ''
  },

  onShow() {
    this.loadPendingDecisions()
  },

  loadPendingDecisions() {
    const today = new Date().toISOString().slice(0, 10)
    const pending = app.globalData.decisions.filter(d => {
      return d.status === 'pending' && d.reviewDate && d.reviewDate <= today
    })
    // 计算显示文本
    const decorated = pending.map(d => {
      const watered = d.wateringHistory ? d.wateringHistory.length : 0
      const max = d.maxWaterings || 1
      const remaining = max - watered
      const stageMeta = util.getStageMeta(d.stage)
      return Object.assign({}, d, {
        stageIcon: stageMeta.icon,
        stageLabel: stageMeta.label,
        _wateredText: watered > 0 ? '已复盘 ' + watered + ' 次' : '',
        _remainingText: remaining > 0 ? '还剩 ' + remaining + ' 次' : ''
      })
    })
    this.setData({ pendingDecisions: decorated, today })
  },

  onGoReview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/review/review?id=' + id })
  },

  onSkipWatering() {
    wx.switchTab({ url: '/pages/garden/garden' })
  }
})
