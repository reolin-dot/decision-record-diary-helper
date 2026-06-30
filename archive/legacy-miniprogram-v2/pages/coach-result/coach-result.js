Page({
  data: {
    optionA: {
      title: '接受 offer',
      pros: ['薪资上涨 30%', '更大的平台', '新技能成长'],
      cons: ['需要搬家', '团队不熟悉'],
      score: 3
    },
    optionB: {
      title: '留在现在公司',
      pros: ['团队熟悉', '工作生活平衡'],
      cons: ['晋升空间有限', '薪资增长慢'],
      score: 4
    }
  },

  onLoad(options) {
    if (options.scoreA || options.scoreB) {
      this.setData({
        'optionA.score': Number(options.scoreA) || this.data.optionA.score,
        'optionB.score': Number(options.scoreB) || this.data.optionB.score
      })
    }
  },

  onSaveDecision() {
    wx.navigateTo({ url: '/pages/record/record?step=1&from=coach' })
  },

  onBackToCoach() {
    wx.navigateBack()
  }
})
