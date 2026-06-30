// pages/style-test/style-test.js
const app = getApp()
const questionBank = require('../../utils/question-bank')

const scaleOptions = questionBank.scale.labels.map((label, index) => ({
  value: index + 1,
  label
}))

function buildDots(count) {
  const dots = []
  for (let i = 0; i < count; i += 1) dots.push(i)
  return dots
}

function getDimensionScores(test, answers) {
  const bucket = {}
  test.questions.forEach((question, index) => {
    const raw = answers[index] || 3
    const score = question.reverse ? 6 - raw : raw
    if (!bucket[question.dimension]) {
      bucket[question.dimension] = { total: 0, count: 0 }
    }
    bucket[question.dimension].total += score
    bucket[question.dimension].count += 1
  })

  return Object.keys(bucket).map(name => ({
    name,
    score: Math.round((bucket[name].total / bucket[name].count) * 10) / 10
  })).sort((a, b) => b.score - a.score)
}

function buildResult(test, answers) {
  const scores = getDimensionScores(test, answers)
  const top = scores[0] || { name: '理性分析', score: 0 }
  const second = scores[1] || null
  const support = scores.filter(item => item.score >= 4).slice(0, 3)
  const pressureDims = ['决策犹豫', '犹豫拖延', '后悔敏感', '最大化倾向', '外界影响', '压力反应', '选择负担', '行动阻滞']
  const pressure = scores.filter(item => {
    return pressureDims.indexOf(item.name) !== -1 && item.score >= 3.8
  }).slice(0, 2)

  let type = top.name + '型'
  let tip = '你在”' + top.name + '”上更明显。之后记录决策时，可以把这个倾向当作观察线索，复盘时看看它什么时候帮到你、什么时候让你多绕了一点路。'

  if (second && top.score - second.score <= 0.4) {
    type = top.name + ' + ' + second.name + '型'
    tip = '你的决策习惯不是单一路线，而是”' + top.name + '”和”' + second.name + '”一起在发挥作用。遇到重要选择时，建议先承认自己的自然倾向，再用记录和复盘帮它变得更稳定。'
  }

  if (pressure.length > 0) {
    tip += ' 需要留意的是”' + pressure.map(item => item.name).join('、') + '”偏高时，可能会带来额外内耗。给自己一个明确的行动节点，会比继续想更有帮助。'
  }

  const tags = support.length > 0 ? support.map(item => item.name) : scores.slice(0, 3).map(item => item.name)

  // ---- 增强结果解释 ----
  // 优势维度解释
  const strengthMap = {
    '理性分析': '你善于用逻辑和比较来辅助决策，能系统化地评估不同选项',
    '直觉信任': '你能快速感知哪个选择更合适，内在的经验判断在发挥作用',
    '直觉判断': '你善于依赖第一感觉做出快速判断，在信息不完整时也能推进',
    '行动执行': '一旦方向明确，你能较快进入行动，不会过度停留在分析阶段',
    '行动果断': '你在时间压力下仍能推动自己做决定，不容易被犹豫拖住',
    '信息处理': '你能较快分辨哪些信息是关键，面对复杂情况不容易迷失',
    '决策执行': '做出决定后你能较快进入执行，不太容易反复推翻自己',
    '选择标准': '你对自己看重的东西比较清楚，做选择时有明确锚点'
  }
  const strength = strengthMap[top.name] || '你在”' + top.name + '”维度得分最高，这是你做决策时的自然优势'

  // 盲区（高风险维度）
  const blindSpotMap = {
    '决策犹豫': '容易在选项间反复摇摆，错过行动窗口',
    '犹豫拖延': '害怕选错可能导致迟迟无法行动',
    '后悔敏感': '做完决定后容易反复想”如果选另一个”，消耗心力',
    '最大化倾向': '追求最优解可能让你难以满足于”足够好”的选择',
    '外界影响': '他人意见容易动摇你的判断，可能忽略自己的真实需求',
    '压力反应': '时间压力或复杂情况下容易焦虑和混乱',
    '后悔预期': '担心后悔可能让你在决策前过度谨慎',
    '他人依赖': '可能过于依赖他人建议而忽略自己的判断力'
  }
  let blindSpot = ''
  if (pressure.length > 0) {
    blindSpot = pressure.map(p => blindSpotMap[p.name] || p.name + '偏高时需要留意').join('；')
  }

  // 记录建议
  const recordSuggestionMap = {
    '决策犹豫': '先写一个可接受的选择，不用一步到位',
    '犹豫拖延': '给自己设一个停止比较的时间点，到点就选',
    '后悔敏感': '记录时把当时的理由写清楚，复盘时会感谢现在的自己',
    '最大化倾向': '写下”什么程度就够好”，作为停止搜索的标准',
    '外界影响': '先写自己的直觉判断，再去看别人的意见',
    '压力反应': '先写下此刻的感受，再做分析',
    '后悔预期': '写下”最坏的情况我能承受吗”，帮助降低恐惧',
    '他人依赖': '列出你自己能判断的部分和需要外部帮助的部分'
  }
  let recordSuggestion = '把你当下最真实的想法写下来，不用追求完美表达'
  if (pressure.length > 0 && recordSuggestionMap[pressure[0].name]) {
    recordSuggestion = recordSuggestionMap[pressure[0].name]
  } else if (top.name === '理性分析') {
    recordSuggestion = '除了利弊分析，也试着写下直觉感受和情绪线索'
  }

  // 复盘建议
  const reviewSuggestionMap = {
    '决策犹豫': '先写事实变化，再评估选择本身，避免陷入”如果当初”的循环',
    '后悔敏感': '先写事实，再写感受，不要急着给自己打分',
    '最大化倾向': '关注”这次学到了什么”而不是”有没有更好的选择”',
    '外界影响': '回顾时区分：哪些反馈确实有帮助，哪些只是让你动摇',
    '压力反应': '复盘时找一个放松的环境，先平静下来再回看',
    '后悔预期': '看看当初担心的事，有多少真的发生了'
  }
  let reviewSuggestion = '关注事实和经验，不需要判定当初选对还是选错'
  if (pressure.length > 0 && reviewSuggestionMap[pressure[0].name]) {
    reviewSuggestion = reviewSuggestionMap[pressure[0].name]
  }

  return {
    type,
    tags,
    tip,
    testId: test.id,
    testTitle: test.title,
    scores,
    strength,
    blindSpot,
    recordSuggestion,
    reviewSuggestion,
    completedAt: new Date().toISOString()
  }
}

Page({
  data: {
    tests: questionBank.tests,
    testGroups: [],
    scaleOptions,
    selectedTestId: 'standard_24_a',
    selectedTest: null,
    currentQuestion: 0,
    totalQuestions: 0,
    questionDots: [],
    selectedScore: 0,
    showResult: false,
    answers: [],
    questions: [],
    styleType: '',
    styleTags: [],
    styleTip: '',
    dimensionScores: [],
    strength: '',
    blindSpot: '',
    recordSuggestion: '',
    reviewSuggestion: ''
  },

  onLoad(options) {
    // 按 group 分组测试套题
    const groupMeta = {
      quick: { label: '快速了解', desc: '3 分钟快速感受自己的决策倾向' },
      standard: { label: '标准画像', desc: '6 分钟获得较完整的决策风格画像' },
      deep: { label: '深入分析', desc: '10 分钟生成最全面的决策画像' }
    }
    const groups = {}
    questionBank.tests.forEach(t => {
      if (!groups[t.group]) groups[t.group] = []
      groups[t.group].push(t)
    })
    const testGroups = ['quick', 'standard', 'deep'].filter(g => groups[g]).map(g => ({
      key: g,
      label: groupMeta[g].label,
      desc: groupMeta[g].desc,
      tests: groups[g]
    }))

    this.setData({ testGroups })

    if (options.result === '1') {
      this.showSavedResult()
    }
  },

  showSavedResult() {
    const style = app.globalData.decisionStyle
    if (!style) return

    this.setData({
      showResult: true,
      styleType: style.type,
      styleTags: style.tags,
      styleTip: style.tip,
      dimensionScores: style.scores || [],
      strength: style.strength || '',
      blindSpot: style.blindSpot || '',
      recordSuggestion: style.recordSuggestion || '',
      reviewSuggestion: style.reviewSuggestion || ''
    })
    wx.setNavigationBarTitle({ title: '测试结果' })
  },

  onSelectTest(e) {
    const testId = e.currentTarget.dataset.id
    this.setData({ selectedTestId: testId })
  },

  onStartTest() {
    const test = this.data.tests.find(item => item.id === this.data.selectedTestId)
    if (!test) {
      wx.showToast({ title: '先选一套题', icon: 'none' })
      return
    }

    this.setData({
      selectedTest: test,
      questions: test.questions,
      totalQuestions: test.questionCount,
      questionDots: buildDots(test.questionCount),
      currentQuestion: 0,
      selectedScore: 0,
      answers: []
    })
  },

  onSelectScore(e) {
    this.setData({ selectedScore: Number(e.currentTarget.dataset.value) })
  },

  onNext() {
    if (!this.data.selectedScore) {
      wx.showToast({ title: '先选一个分值', icon: 'none' })
      return
    }

    const answers = this.data.answers.concat(this.data.selectedScore)

    if (this.data.currentQuestion < this.data.totalQuestions - 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1,
        selectedScore: 0,
        answers
      })
      return
    }

    this.setData({ answers })
    this.calculateAndShowResult()
  },

  onSkip() {
    app.globalData.hasStyleTest = true
    wx.switchTab({ url: '/pages/garden/garden' })
  },

  calculateAndShowResult() {
    const answers = this.data.answers
    const result = buildResult(this.data.selectedTest, answers)
    app.globalData.decisionStyle = result
    app.globalData.hasStyleTest = true
    wx.setStorageSync('decisionStyle', result)

    this.setData({
      showResult: true,
      styleType: result.type,
      styleTags: result.tags,
      styleTip: result.tip,
      dimensionScores: result.scores,
      strength: result.strength,
      blindSpot: result.blindSpot,
      recordSuggestion: result.recordSuggestion,
      reviewSuggestion: result.reviewSuggestion
    })
    wx.setNavigationBarTitle({ title: '测试结果' })
  },

  onStartRecord() {
    wx.navigateTo({ url: '/pages/record/record?step=1' })
  },

  onBackToGarden() {
    wx.switchTab({ url: '/pages/garden/garden' })
  }
})
