// pages/share-card/share-card.js
var app = getApp()
var analytics = require('../../utils/analytics')

Page({
  data: {
    cardType: '',
    cardData: null,
    editableText: '',
    previewMode: false
  },

  onLoad: function(options) {
    var type = options.type || 'monthly-report'
    var decisions = app.globalData.decisions || []

    var cardData = null

    if (type === 'monthly-report' && options.month) {
      var report = analytics.buildMonthlyReport(decisions, options.month)
      cardData = {
        title: options.month + ' 成长报告',
        subtitle: report.summary,
        highlight: report.highlightSnippet ? report.highlightSnippet.lesson : '',
        stats: {
          total: report.stats.total,
          bloomed: report.stats.stageCounts.full_bloom,
          topCategory: report.stats.topCategoryLabel
        }
      }
    } else if (type === 'style-test') {
      var style = app.globalData.decisionStyle || {}
      cardData = {
        title: '我的决策风格',
        subtitle: style.type || '探索中',
        tags: style.tags || [],
        highlight: style.tip || ''
      }
    } else if (type === 'growth-snippet' && options.lesson) {
      cardData = {
        title: '成长片段',
        subtitle: '',
        highlight: decodeURIComponent(options.lesson),
        source: options.source ? decodeURIComponent(options.source) : ''
      }
    } else {
      // 默认通用卡片
      var patterns = analytics.getDecisionPatterns(decisions)
      cardData = {
        title: '我的决策花园',
        subtitle: '已记录 ' + decisions.length + ' 个决策',
        highlight: patterns.insights.length > 0 ? patterns.insights[0] : '',
        stats: {
          total: decisions.length,
          bloomed: patterns.stageDistribution.find(function(s) { return s.key === 'full_bloom' }).count,
          topCategory: patterns.topCategory ? patterns.topCategory.label : ''
        }
      }
    }

    this.setData({
      cardType: type,
      cardData: cardData,
      editableText: cardData ? cardData.highlight : ''
    })
  },

  onTextEdit: function(e) {
    this.setData({ editableText: e.detail.value })
  },

  onTogglePreview: function() {
    this.setData({ previewMode: !this.data.previewMode })
  },

  onSaveImage: function() {
    wx.showToast({
      title: '图片生成中...',
      icon: 'loading',
      duration: 1500
    })
    // TODO: 使用 Canvas 生成卡片图片并保存到相册
    // 当前为占位实现
    setTimeout(function() {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }, 1500)
  },

  onShareAppMessage: function() {
    var data = this.data.cardData
    return {
      title: data ? data.title : '决策成长日记',
      path: '/pages/garden/garden',
      imageUrl: ''
    }
  }
})
