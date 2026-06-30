// pages/profile/profile.js
const app = getApp()
const dataService = require('../../utils/data-service')
const analytics = require('../../utils/analytics')

Page({
  data: {
    stats: {},
    decisionStyle: {},
    userInfo: {},
    badges: [],
    overview: null,
    settings: [
      { icon: '📊', label: '月度成长报告', action: 'monthlyReport' },
      { icon: '🌿', label: '主题花圃', action: 'themeGarden' },
      { icon: '📝', label: '重新测试决策风格', action: 'styleTest' },
      { icon: '📦', label: '导出数据', action: 'dataExport' },
      { icon: '🔔', label: '复盘提醒设置', disabled: true },
      { icon: '⚙️', label: '通用设置', disabled: true }
    ]
  },

  onShow() {
    var decisions = app.globalData.decisions || []
    var patterns = analytics.getDecisionPatterns(decisions)

    this.setData({
      stats: app.globalData.stats,
      decisionStyle: app.globalData.decisionStyle,
      userInfo: app.globalData.userInfo,
      badges: dataService.getBadges(),
      overview: {
        topCategory: patterns.topCategory,
        insights: patterns.insights.slice(0, 2),
        reviewRate: patterns.reviewRate
      }
    })
  },

  onTapSetting(e) {
    var action = e.currentTarget.dataset.action
    if (action === 'styleTest') {
      wx.navigateTo({ url: '/pages/style-test/style-test' })
    } else if (action === 'monthlyReport') {
      wx.navigateTo({ url: '/pages/monthly-report/monthly-report' })
    } else if (action === 'themeGarden') {
      wx.navigateTo({ url: '/pages/theme-garden/theme-garden' })
    } else if (action === 'dataExport') {
      wx.navigateTo({ url: '/pages/data-export/data-export' })
    }
  },

  onGoShare() {
    wx.navigateTo({ url: '/pages/share-card/share-card?type=general' })
  }
})
