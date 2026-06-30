// pages/monthly-report/monthly-report.js
var app = getApp()
var analytics = require('../../utils/analytics')
var util = require('../../utils/util')

Page({
  data: {
    currentMonth: '',
    availableMonths: [],
    report: null,
    isEmpty: false
  },

  onLoad: function(options) {
    var decisions = app.globalData.decisions || []
    var months = analytics.getAvailableMonths(decisions)
    var targetMonth = options.month || (months.length > 0 ? months[0] : '')

    this.setData({ availableMonths: months })
    if (targetMonth) {
      this.loadReport(targetMonth)
    } else {
      this.setData({ isEmpty: true })
    }
  },

  loadReport: function(yearMonth) {
    var decisions = app.globalData.decisions || []
    var report = analytics.buildMonthlyReport(decisions, yearMonth)

    this.setData({
      currentMonth: yearMonth,
      report: report,
      isEmpty: report.stats.total === 0
    })
  },

  onMonthChange: function(e) {
    var month = e.currentTarget.dataset.month
    if (month && month !== this.data.currentMonth) {
      this.loadReport(month)
    }
  },

  onShareReport: function() {
    wx.navigateTo({
      url: '/pages/share-card/share-card?type=monthly-report&month=' + this.data.currentMonth
    })
  },

  onGoThemeGarden: function() {
    wx.navigateTo({ url: '/pages/theme-garden/theme-garden' })
  },

  onGoDecision: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/decision-detail/decision-detail?id=' + id })
  }
})
