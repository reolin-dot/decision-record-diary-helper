/**
 * ====================================
 * 📊 分析引擎（Analytics）— V2.0
 * ====================================
 *
 * 提供月度报告、决策模式洞察、主题聚合等分析能力。
 * 所有函数都是纯函数，输入 decisions 数组，输出分析结果。
 */

var dataService = require('./data-service')

// ============ 月度统计 ============
// 输入 decisions 数组 + 目标年月 (如 '2026-06')
// 输出该月的统计数据
function getMonthlyStats(decisions, yearMonth) {
  var categories = dataService.getCategories()
  var monthly = decisions.filter(function(d) {
    return d.createdAt && d.createdAt.substring(0, 7) === yearMonth
  })

  var stageCounts = { seed: 0, sprout: 0, leaf: 0, first_bloom: 0, full_bloom: 0 }
  var categoryCounts = {}
  var moodCounts = {}

  monthly.forEach(function(d) {
    // 阶段统计
    if (stageCounts[d.stage] !== undefined) {
      stageCounts[d.stage]++
    } else if (d.stage === 'bloom') {
      stageCounts.full_bloom++
    }

    // 分类统计
    var cat = d.category || 'other'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1

    // 情绪统计
    var mood = d.mood || '未知'
    moodCounts[mood] = (moodCounts[mood] || 0) + 1
  })

  // 找出最常用分类
  var topCategory = ''
  var topCategoryCount = 0
  Object.keys(categoryCounts).forEach(function(key) {
    if (categoryCounts[key] > topCategoryCount) {
      topCategory = key
      topCategoryCount = categoryCounts[key]
    }
  })

  // 复盘完成数
  var currentReviews = monthly.filter(function(d) { return d.firstReviewDone }).length
  var resultReviews = monthly.filter(function(d) { return d.resultReviewDone }).length

  return {
    yearMonth: yearMonth,
    total: monthly.length,
    stageCounts: stageCounts,
    categoryCounts: categoryCounts,
    moodCounts: moodCounts,
    topCategory: topCategory,
    topCategoryLabel: categories[topCategory] ? categories[topCategory].label : topCategory,
    topCategoryCount: topCategoryCount,
    currentReviews: currentReviews,
    resultReviews: resultReviews,
    decisions: monthly
  }
}

// ============ 成长片段提取 ============
// 从决策的复盘历史中提取所有 lesson
function extractGrowthSnippets(decisions, yearMonth) {
  var snippets = []
  var filtered = yearMonth
    ? decisions.filter(function(d) { return d.createdAt && d.createdAt.substring(0, 7) === yearMonth })
    : decisions

  filtered.forEach(function(d) {
    if (d.wateringHistory && d.wateringHistory.length > 0) {
      d.wateringHistory.forEach(function(w) {
        if (w.lesson) {
          snippets.push({
            lesson: w.lesson,
            decisionTitle: d.title,
            date: w.date,
            type: w.type || 'current'
          })
        }
      })
    }
  })

  // 按日期倒序
  snippets.sort(function(a, b) { return (b.date || '').localeCompare(a.date || '') })
  return snippets
}

// ============ 决策模式洞察 ============
// 跨所有决策分析用户的决策模式
function getDecisionPatterns(decisions) {
  var categories = dataService.getCategories()
  if (!decisions || decisions.length === 0) {
    return { topCategory: '', categoryDistribution: [], moodDistribution: [], stageDistribution: [] }
  }

  // 分类分布
  var categoryMap = {}
  decisions.forEach(function(d) {
    var cat = d.category || 'other'
    categoryMap[cat] = (categoryMap[cat] || 0) + 1
  })

  var categoryDistribution = Object.keys(categoryMap).map(function(key) {
    return {
      key: key,
      label: categories[key] ? categories[key].label : key,
      icon: categories[key] ? categories[key].icon : '📋',
      count: categoryMap[key],
      percent: Math.round(categoryMap[key] / decisions.length * 100)
    }
  }).sort(function(a, b) { return b.count - a.count })

  // 情绪分布
  var moodMap = {}
  decisions.forEach(function(d) {
    var mood = d.mood || '未知'
    moodMap[mood] = (moodMap[mood] || 0) + 1
  })

  var moodDistribution = Object.keys(moodMap).map(function(key) {
    return { mood: key, count: moodMap[key], percent: Math.round(moodMap[key] / decisions.length * 100) }
  }).sort(function(a, b) { return b.count - a.count })

  // 阶段分布
  var stageMap = { seed: 0, sprout: 0, leaf: 0, first_bloom: 0, full_bloom: 0 }
  decisions.forEach(function(d) {
    var s = d.stage === 'bloom' ? 'full_bloom' : d.stage
    if (stageMap[s] !== undefined) stageMap[s]++
  })

  var stageDistribution = [
    { key: 'seed', label: '种子', count: stageMap.seed },
    { key: 'sprout', label: '发芽', count: stageMap.sprout },
    { key: 'leaf', label: '长叶', count: stageMap.leaf },
    { key: 'first_bloom', label: '初开', count: stageMap.first_bloom },
    { key: 'full_bloom', label: '盛开', count: stageMap.full_bloom }
  ]

  // 复盘完成率
  var reviewedCount = decisions.filter(function(d) { return d.firstReviewDone }).length
  var resultReviewedCount = decisions.filter(function(d) { return d.resultReviewDone }).length
  var reviewRate = decisions.length > 0 ? Math.round(reviewedCount / decisions.length * 100) : 0
  var resultReviewRate = decisions.length > 0 ? Math.round(resultReviewedCount / decisions.length * 100) : 0

  // 洞察文本生成
  var insights = generateInsights(categoryDistribution, moodDistribution, reviewRate, decisions.length)

  return {
    topCategory: categoryDistribution[0] || null,
    categoryDistribution: categoryDistribution,
    moodDistribution: moodDistribution,
    stageDistribution: stageDistribution,
    reviewRate: reviewRate,
    resultReviewRate: resultReviewRate,
    insights: insights
  }
}

// ============ 生成洞察文案 ============
function generateInsights(categoryDist, moodDist, reviewRate, total) {
  var insights = []

  // 分类洞察
  if (categoryDist.length > 0) {
    var top = categoryDist[0]
    insights.push('你更常在「' + top.label + '」类决策中停留，这可能说明它对你当下最重要。')
  }

  // 情绪洞察
  if (moodDist.length > 0) {
    var topMood = moodDist[0]
    if (topMood.mood === '焦虑' || topMood.mood === '紧张') {
      insights.push('做选择时你常感到' + topMood.mood + '，这很正常——记录本身就是一种面对的方式。')
    } else if (topMood.mood === '平静') {
      insights.push('你在做选择时越来越平静了，这说明你正在建立自己的决策节奏。')
    } else if (topMood.mood === '纠结') {
      insights.push('你常在多个选项间犹豫——这不是缺点，说明你在认真对待每个选择。')
    } else {
      insights.push('做选择时你最常感到「' + topMood.mood + '」，每种情绪都在告诉你一些事情。')
    }
  }

  // 复盘率洞察
  if (reviewRate >= 70) {
    insights.push('你的复盘完成率达到 ' + reviewRate + '%，你在认真把经验变成自己的东西。')
  } else if (reviewRate >= 40) {
    insights.push('你完成了 ' + reviewRate + '% 的复盘，还有空间——不需要全部完成，但每一段都值得回头看。')
  } else {
    insights.push('复盘率还比较低，不着急——先从不评判自己开始，回来看看就好。')
  }

  // 总量洞察
  if (total >= 15) {
    insights.push('你已经记录了 ' + total + ' 个决策，这本身就是一份珍贵的成长档案。')
  } else if (total >= 5) {
    insights.push('你开始积累自己的决策样本了，继续记录会发现更多规律。')
  }

  return insights
}

// ============ 主题花圃聚合 ============
// 按分类分组所有决策
function getThemeGardens(decisions) {
  var categories = dataService.getCategories()
  var gardens = {}

  decisions.forEach(function(d) {
    var cat = d.category || 'other'
    if (!gardens[cat]) {
      var catInfo = categories[cat] || { label: '其他', icon: '📋', color: '#999999' }
      gardens[cat] = {
        key: cat,
        label: catInfo.label,
        icon: catInfo.icon,
        color: catInfo.color,
        decisions: [],
        bloomedCount: 0,
        growingCount: 0
      }
    }
    gardens[cat].decisions.push(d)
    if (d.stage === 'full_bloom' || d.stage === 'bloom') {
      gardens[cat].bloomedCount++
    } else if (d.stage !== 'seed') {
      gardens[cat].growingCount++
    }
  })

  // 转数组并按决策数倒序
  return Object.keys(gardens).map(function(key) { return gardens[key] })
    .sort(function(a, b) { return b.decisions.length - a.decisions.length })
}

// ============ 可用月份列表 ============
// 返回有决策记录的月份列表
function getAvailableMonths(decisions) {
  var monthSet = {}
  decisions.forEach(function(d) {
    if (d.createdAt) {
      var ym = d.createdAt.substring(0, 7)
      monthSet[ym] = true
    }
  })
  return Object.keys(monthSet).sort().reverse()
}

// ============ 月度报告完整数据 ============
function buildMonthlyReport(decisions, yearMonth) {
  var stats = getMonthlyStats(decisions, yearMonth)
  var snippets = extractGrowthSnippets(decisions, yearMonth)
  var patterns = getDecisionPatterns(stats.decisions)

  // 代表性成长片段（取第一条）
  var highlightSnippet = snippets.length > 0 ? snippets[0] : null

  // 月度总结文案
  var summary = buildMonthlySummary(stats, patterns)

  return {
    yearMonth: yearMonth,
    stats: stats,
    snippets: snippets,
    highlightSnippet: highlightSnippet,
    patterns: patterns,
    summary: summary
  }
}

// ============ 月度总结文案 ============
function buildMonthlySummary(stats, patterns) {
  var parts = []

  parts.push('本月你种下了 ' + stats.total + ' 个决策。')

  if (stats.stageCounts.full_bloom > 0) {
    parts.push('其中 ' + stats.stageCounts.full_bloom + ' 朵已经盛开。')
  }

  if (stats.topCategory) {
    parts.push('你更常在「' + stats.topCategoryLabel + '」里停留。')
  }

  if (stats.resultReviews > 0) {
    parts.push('你有 ' + stats.resultReviews + ' 次在行动后修正了原本预期。')
  }

  if (patterns.reviewRate >= 60) {
    parts.push('你开始更频繁地把经验沉淀下来。')
  }

  return parts.join('')
}

module.exports = {
  getMonthlyStats,
  extractGrowthSnippets,
  getDecisionPatterns,
  getThemeGardens,
  getAvailableMonths,
  buildMonthlyReport
}
