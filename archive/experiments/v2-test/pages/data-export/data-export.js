// pages/data-export/data-export.js
var app = getApp()

Page({
  data: {
    exportOptions: [
      { key: 'all', label: '全部决策记录', desc: '导出所有决策及复盘历史', icon: '📋' },
      { key: 'reviewed', label: '已完成复盘', desc: '只导出有复盘记录的决策', icon: '✅' },
      { key: 'lessons', label: '成长片段合集', desc: '导出所有复盘中的经验总结', icon: '💡' },
      { key: 'stats', label: '统计摘要', desc: '导出决策统计数据', icon: '📊' }
    ],
    selectedOption: 'all',
    isExporting: false,
    exportResult: null
  },

  onSelectOption: function(e) {
    var key = e.currentTarget.dataset.key
    this.setData({ selectedOption: key, exportResult: null })
  },

  onExport: function() {
    var that = this
    var option = this.data.selectedOption
    var decisions = app.globalData.decisions || []

    this.setData({ isExporting: true })

    var exportData = null

    if (option === 'all') {
      exportData = this.buildFullExport(decisions)
    } else if (option === 'reviewed') {
      var reviewed = decisions.filter(function(d) { return d.firstReviewDone || d.resultReviewDone })
      exportData = this.buildFullExport(reviewed)
    } else if (option === 'lessons') {
      exportData = this.buildLessonsExport(decisions)
    } else if (option === 'stats') {
      exportData = this.buildStatsExport(decisions)
    }

    // 模拟异步导出
    setTimeout(function() {
      that.setData({
        isExporting: false,
        exportResult: {
          format: 'JSON',
          itemCount: option === 'lessons' ? exportData.lessons.length : exportData.decisions ? exportData.decisions.length : 1,
          preview: JSON.stringify(exportData, null, 2).substring(0, 500) + '...'
        }
      })

      // 实际导出：写入文件并分享
      that.doExport(exportData)
    }, 800)
  },

  buildFullExport: function(decisions) {
    return {
      exportDate: new Date().toISOString(),
      exportType: 'full',
      totalDecisions: decisions.length,
      decisions: decisions.map(function(d) {
        return {
          id: d.id,
          title: d.title,
          category: d.category || '',
          background: d.background || '',
          options: d.options || [],
          choice: d.choice,
          reason: d.reason || '',
          expectation: d.expectation || '',
          mood: d.mood || '',
          createdAt: d.createdAt,
          reviewDate: d.reviewDate || '',
          stage: d.stage,
          actionStarted: d.actionStarted || false,
          firstReviewDone: d.firstReviewDone || false,
          resultReviewDone: d.resultReviewDone || false,
          wateringHistory: d.wateringHistory || []
        }
      })
    }
  },

  buildLessonsExport: function(decisions) {
    var lessons = []
    decisions.forEach(function(d) {
      if (d.wateringHistory && d.wateringHistory.length > 0) {
        d.wateringHistory.forEach(function(w) {
          if (w.lesson) {
            lessons.push({
              lesson: w.lesson,
              from: d.title,
              date: w.date,
              type: w.type || 'current'
            })
          }
        })
      }
    })
    return {
      exportDate: new Date().toISOString(),
      exportType: 'lessons',
      totalLessons: lessons.length,
      lessons: lessons
    }
  },

  buildStatsExport: function(decisions) {
    var stageCounts = { seed: 0, sprout: 0, leaf: 0, first_bloom: 0, full_bloom: 0 }
    var categoryCounts = {}
    var reviewedCount = 0

    decisions.forEach(function(d) {
      var s = d.stage === 'bloom' ? 'full_bloom' : d.stage
      if (stageCounts[s] !== undefined) stageCounts[s]++
      var cat = d.category || 'other'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      if (d.firstReviewDone) reviewedCount++
    })

    return {
      exportDate: new Date().toISOString(),
      exportType: 'stats',
      totalDecisions: decisions.length,
      reviewRate: decisions.length > 0 ? Math.round(reviewedCount / decisions.length * 100) + '%' : '0%',
      stageCounts: stageCounts,
      categoryCounts: categoryCounts
    }
  },

  doExport: function(data) {
    var that = this
    var fs = wx.getFileSystemManager()
    var filePath = wx.env.USER_DATA_PATH + '/decision-diary-export.json'
    var content = JSON.stringify(data, null, 2)

    fs.writeFile({
      filePath: filePath,
      data: content,
      encoding: 'utf8',
      success: function() {
        // 文件写入成功，可以分享
        that._exportFilePath = filePath
      },
      fail: function(err) {
        console.error('Export file write failed:', err)
        wx.showToast({ title: '导出失败', icon: 'none' })
      }
    })
  },

  onShareFile: function() {
    var that = this
    if (!this._exportFilePath) {
      wx.showToast({ title: '请先导出', icon: 'none' })
      return
    }
    wx.shareFileMessage({
      filePath: this._exportFilePath,
      fileName: 'decision-diary-export.json',
      success: function() {},
      fail: function() {
        wx.showToast({ title: '分享取消', icon: 'none' })
      }
    })
  },

  onCopyPreview: function() {
    if (this.data.exportResult && this.data.exportResult.preview) {
      wx.setClipboardData({
        data: this.data.exportResult.preview,
        success: function() {
          wx.showToast({ title: '已复制预览', icon: 'success' })
        }
      })
    }
  }
})
