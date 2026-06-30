// pages/theme-garden/theme-garden.js
var app = getApp()
var analytics = require('../../utils/analytics')
var util = require('../../utils/util')

Page({
  data: {
    gardens: [],
    selectedGarden: '',
    selectedDecisions: [],
    isEmpty: false
  },

  onLoad: function() {
    this.loadData()
  },

  onShow: function() {
    this.loadData()
  },

  loadData: function() {
    var decisions = app.globalData.decisions || []
    if (decisions.length === 0) {
      this.setData({ isEmpty: true })
      return
    }

    var gardens = analytics.getThemeGardens(decisions)
    // 给每个决策加上阶段元信息
    gardens.forEach(function(g) {
      g.decisions = g.decisions.map(function(d) {
        var stageMeta = util.getStageMeta(d.stage)
        return Object.assign({}, d, {
          stageIcon: stageMeta.icon,
          stageLabel: stageMeta.label,
          relativeTime: util.getRelativeTime(d.createdAt)
        })
      })
    })

    this.setData({
      gardens: gardens,
      isEmpty: gardens.length === 0,
      selectedGarden: gardens.length > 0 ? gardens[0].key : ''
    })

    if (gardens.length > 0) {
      this.selectGarden(gardens[0].key)
    }
  },

  onSelectGarden: function(e) {
    var key = e.currentTarget.dataset.key
    this.selectGarden(key)
  },

  selectGarden: function(key) {
    var garden = this.data.gardens.find(function(g) { return g.key === key })
    if (garden) {
      this.setData({
        selectedGarden: key,
        selectedDecisions: garden.decisions
      })
    }
  },

  onGoDecision: function(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/decision-detail/decision-detail?id=' + id })
  }
})
