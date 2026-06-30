import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { tests, scale } from '../../utils/question-bank.js'
import './style-test.css'

const SCALE_OPTIONS = scale.labels.map((label, i) => ({ value: i + 1, label }))

function buildDots(count) {
  if (count > 24) return []
  return Array.from({ length: count }, (_, i) => i)
}

function getDimensionScores(test, answers) {
  const bucket = {}
  test.questions.forEach((q, idx) => {
    const raw = answers[idx] || 3
    const score = q.reverse ? 6 - raw : raw
    if (!bucket[q.dimension]) bucket[q.dimension] = { total: 0, count: 0 }
    bucket[q.dimension].total += score
    bucket[q.dimension].count += 1
  })
  return Object.keys(bucket)
    .map(name => ({ name, score: Math.round((bucket[name].total / bucket[name].count) * 10) / 10 }))
    .sort((a, b) => b.score - a.score)
}

function buildResult(test, answers) {
  const scores = getDimensionScores(test, answers)
  const top = scores[0] || { name: '理性分析', score: 0 }
  const second = scores[1] || null
  const support = scores.filter(s => s.score >= 4).slice(0, 3)
  const pressureDims = ['决策犹豫', '犹豫拖延', '后悔敏感', '最大化倾向', '外界影响', '压力反应', '选择负担', '行动阻滞']
  const pressure = scores.filter(s => pressureDims.includes(s.name) && s.score >= 3.8).slice(0, 2)

  let type = top.name + '型'
  let tip = `你在"${top.name}"上更明显。之后记录决策时，可以把这个倾向当作观察线索，复盘时看看它什么时候帮到你、什么时候让你多绕了一点路。`
  if (second && top.score - second.score <= 0.4) {
    type = `${top.name} + ${second.name}型`
    tip = `你的决策习惯不是单一路线，而是"${top.name}"和"${second.name}"一起在发挥作用。遇到重要选择时，建议先承认自己的自然倾向，再用记录和复盘帮它变得更稳定。`
  }
  if (pressure.length > 0) {
    tip += ` 需要留意的是"${pressure.map(p => p.name).join('、')}"偏高时，可能会带来额外内耗。给自己一个明确的行动节点，会比继续想更有帮助。`
  }

  const tags = support.length > 0 ? support.map(s => s.name) : scores.slice(0, 3).map(s => s.name)

  const strengthMap = {
    '理性分析': '你善于用逻辑和比较来辅助决策，能系统化地评估不同选项',
    '直觉信任': '你能快速感知哪个选择更合适，内在的经验判断在发挥作用',
    '直觉判断': '你善于依赖第一感觉做出快速判断，在信息不完整时也能推进',
    '行动执行': '一旦方向明确，你能较快进入行动，不会过度停留在分析阶段',
    '行动果断': '你在时间压力下仍能推动自己做决定，不容易被犹豫拖住',
    '信息处理': '你能较快分辨哪些信息是关键，面对复杂情况不容易迷失',
    '决策执行': '做出决定后你能较快进入执行，不太容易反复推翻自己',
    '选择标准': '你对自己看重的东西比较清楚，做选择时有明确锚点',
  }
  const strength = strengthMap[top.name] || `你在"${top.name}"维度得分最高，这是你做决策时的自然优势`

  const blindSpotMap = {
    '决策犹豫': '容易在选项间反复摇摆，错过行动窗口',
    '犹豫拖延': '害怕选错可能导致迟迟无法行动',
    '后悔敏感': '做完决定后容易反复想"如果选另一个"，消耗心力',
    '最大化倾向': '追求最优解可能让你难以满足于"足够好"的选择',
    '外界影响': '他人意见容易动摇你的判断，可能忽略自己的真实需求',
    '压力反应': '时间压力或复杂情况下容易焦虑和混乱',
    '后悔预期': '担心后悔可能让你在决策前过度谨慎',
    '他人依赖': '可能过于依赖他人建议而忽略自己的判断力',
  }
  let blindSpot = ''
  if (pressure.length > 0) {
    blindSpot = pressure.map(p => blindSpotMap[p.name] || `${p.name}偏高时需要留意`).join('；')
  }

  const recordSuggestionMap = {
    '决策犹豫': '先写一个可接受的选择，不用一步到位',
    '犹豫拖延': '给自己设一个停止比较的时间点，到点就选',
    '后悔敏感': '记录时把当时的理由写清楚，复盘时会感谢现在的自己',
    '最大化倾向': '写下"什么程度就够好"，作为停止搜索的标准',
    '外界影响': '先写自己的直觉判断，再去看别人的意见',
    '压力反应': '先写下此刻的感受，再做分析',
    '后悔预期': '写下"最坏的情况我能承受吗"，帮助降低恐惧',
    '他人依赖': '列出你自己能判断的部分和需要外部帮助的部分',
  }
  let recordSuggestion = '把你当下最真实的想法写下来，不用追求完美表达'
  if (pressure.length > 0 && recordSuggestionMap[pressure[0].name]) {
    recordSuggestion = recordSuggestionMap[pressure[0].name]
  } else if (top.name === '理性分析') {
    recordSuggestion = '除了利弊分析，也试着写下直觉感受和情绪线索'
  }

  const reviewSuggestionMap = {
    '决策犹豫': '先写事实变化，再评估选择本身，避免陷入"如果当初"的循环',
    '后悔敏感': '先写事实，再写感受，不要急着给自己打分',
    '最大化倾向': '关注"这次学到了什么"而不是"有没有更好的选择"',
    '外界影响': '回顾时区分：哪些反馈确实有帮助，哪些只是让你动摇',
    '压力反应': '复盘时找一个放松的环境，先平静下来再回看',
    '后悔预期': '看看当初担心的事，有多少真的发生了',
  }
  let reviewSuggestion = '关注事实和经验，不需要判定当初选对还是选错'
  if (pressure.length > 0 && reviewSuggestionMap[pressure[0].name]) {
    reviewSuggestion = reviewSuggestionMap[pressure[0].name]
  }

  return { type, tags, tip, testId: test.id, testTitle: test.title, scores, strength, blindSpot, recordSuggestion, reviewSuggestion, completedAt: new Date().toISOString() }
}

// Build test groups
const GROUP_META = {
  quick: { label: '快速了解', desc: '3 分钟快速感受自己的决策倾向' },
  standard: { label: '标准画像', desc: '6 分钟获得较完整的决策风格画像' },
  deep: { label: '深入分析', desc: '10 分钟生成最全面的决策画像' },
}

const TEST_GROUPS = (() => {
  const groups = {}
  tests.forEach(t => {
    if (!groups[t.group]) groups[t.group] = []
    groups[t.group].push(t)
  })
  return ['quick', 'standard', 'deep'].filter(g => groups[g]).map(g => ({
    key: g,
    label: GROUP_META[g].label,
    desc: GROUP_META[g].desc,
    tests: groups[g],
  }))
})()

export default function StyleTest() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { saveDecisionStyle, skipStyleTest, decisionStyle } = useApp()
  const toast = useToast()

  // View state
  const [selectedTestId, setSelectedTestId] = useState('standard_24_a')
  const [selectedTest, setSelectedTest] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedScore, setSelectedScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  // Result state
  const [result, setResult] = useState(null)

  // Check if we should show saved result
  useEffect(() => {
    const showSavedResult = searchParams.get('result') === '1'
    if (showSavedResult && decisionStyle) {
      setResult(decisionStyle)
      setShowResult(true)
    }
  }, [searchParams, decisionStyle])

  const questions = selectedTest?.questions || []
  const totalQuestions = selectedTest?.questionCount || 0
  const questionDots = useMemo(() => buildDots(totalQuestions), [totalQuestions])
  const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestion + 1) / totalQuestions) * 100) : 0

  // --- View 1: Select test ---
  const handleStartTest = () => {
    const test = tests.find(t => t.id === selectedTestId)
    if (!test) {
      toast.show('先选一套题')
      return
    }
    setSelectedTest(test)
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedScore(0)
  }

  // --- View 2: Answer questions ---
  const handleNext = () => {
    if (!selectedScore) {
      toast.show('先选一个分值')
      return
    }
    const newAnswers = [...answers, selectedScore]

    if (currentQuestion < totalQuestions - 1) {
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion + 1)
      setSelectedScore(0)
      return
    }

    // Last question → calculate result
    setAnswers(newAnswers)
    const r = buildResult(selectedTest, newAnswers)
    saveDecisionStyle(r)
    setResult(r)
    setShowResult(true)
  }

  // --- Actions ---
  const handleSkip = () => {
    skipStyleTest()
    navigate('/record?step=1')
  }

  const handleStartRecord = () => {
    navigate('/record?step=1')
  }

  const handleBackToGarden = () => {
    navigate('/')
  }

  // ===================== RENDER =====================

  // --- Result View ---
  if (showResult && result) {
    return (
      <div className="style-test-page">
        <div className="result-header">
          <span className="result-icon">🎯</span>
          <span className="result-title">你的决策风格：{result.type || '理性分析型'}</span>
          <span className="result-desc">
            这不是给你贴标签，而是帮你看见自己的决策习惯。{'\n'}
            之后记录和复盘时，可以更有意识地训练自己。
          </span>
        </div>
        <div className="result-body">
          {/* Tags */}
          <div className="style-tags">
            {(result.tags || []).map((tag, i) => (
              <span key={i} className="style-tag">{tag}</span>
            ))}
          </div>

          {/* Strength */}
          {result.strength && (
            <div className="insight-card insight-strength">
              <span className="insight-icon">✦</span>
              <div className="insight-content">
                <span className="insight-label">你的优势</span>
                <span className="insight-text">{result.strength}</span>
              </div>
            </div>
          )}

          {/* Blind spot */}
          {result.blindSpot && (
            <div className="insight-card insight-blindspot">
              <span className="insight-icon">⚡</span>
              <div className="insight-content">
                <span className="insight-label">可能盲区</span>
                <span className="insight-text">{result.blindSpot}</span>
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="tip-card">
            <span className="tip-title">综合建议</span>
            <span className="tip-content">{result.tip}</span>
          </div>

          {/* Record suggestion */}
          {result.recordSuggestion && (
            <div className="suggestion-card">
              <span className="suggestion-label">📝 记录决策时</span>
              <span className="suggestion-text">{result.recordSuggestion}</span>
            </div>
          )}

          {/* Review suggestion */}
          {result.reviewSuggestion && (
            <div className="suggestion-card">
              <span className="suggestion-label">🔄 复盘时</span>
              <span className="suggestion-text">{result.reviewSuggestion}</span>
            </div>
          )}

          {/* Scores */}
          {result.scores && result.scores.length > 0 && (
            <div className="score-list">
              <span className="tip-title">维度得分</span>
              {result.scores.map((s, i) => (
                <div key={i} className="score-item">
                  <span className="score-name">{s.name}</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${s.score * 20}%` }} />
                  </div>
                  <span className="score-value">{s.score}</span>
                </div>
              ))}
            </div>
          )}

          <div className="result-note">测试结果仅供参考，可随时在个人中心重新测试。</div>
        </div>
        <div className="bottom-bar">
          <button className="btn-primary" onClick={handleStartRecord}>开始记录决策</button>
          <button className="skip-link" onClick={handleBackToGarden}>返回花园</button>
        </div>
      </div>
    )
  }

  // --- Test Selection View ---
  if (!selectedTest) {
    return (
      <div className="style-test-page">
        <div className="test-header">
          <span className="test-icon">🤔</span>
          <span className="test-title">发现你的决策风格</span>
          <span className="test-desc">
            先选一套题，再用 1-5 分作答。{'\n'}推荐从标准版开始。
          </span>
        </div>
        <div className="test-list">
          {TEST_GROUPS.map(group => (
            <div key={group.key} className="test-group">
              <div className="group-header">
                <span className="group-label">{group.label}</span>
                <span className="group-desc">{group.desc}</span>
              </div>
              {group.tests.map(t => (
                <div
                  key={t.id}
                  className={`test-card ${selectedTestId === t.id ? 'selected' : ''} ${t.id === 'standard_24_a' ? 'recommended' : ''}`}
                  onClick={() => setSelectedTestId(t.id)}
                >
                  <div className="test-card-header">
                    <div className="test-card-title-row">
                      <span className="test-card-title">{t.title}</span>
                      {t.id === 'standard_24_a' && <span className="recommend-badge">推荐</span>}
                    </div>
                    <span className="test-card-meta">{t.questionCount} 题 · 约 {t.estimatedMinutes} 分钟</span>
                  </div>
                  <span className="test-card-intro">{t.intro}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="bottom-bar">
          <button
            className={`btn-primary ${!selectedTestId ? 'disabled' : ''}`}
            onClick={handleStartTest}
          >
            开始测试
          </button>
          <button className="skip-link" onClick={handleSkip}>跳过测试，直接使用</button>
        </div>
      </div>
    )
  }

  // --- Question Answering View ---
  const q = questions[currentQuestion]
  return (
    <div className="style-test-page">
      <div className="test-header">
        <span className="test-icon">🤔</span>
        <span className="test-title">{selectedTest.title}</span>
        <span className="test-desc">{selectedTest.intro}</span>
      </div>

      {/* Progress */}
      {questionDots.length > 0 ? (
        <div className="test-progress">
          {questionDots.map(i => (
            <div
              key={i}
              className={`dot ${i < currentQuestion ? 'done' : ''} ${i === currentQuestion ? 'current' : ''}`}
            />
          ))}
        </div>
      ) : (
        <div className="test-progress-bar">
          <div className="test-progress-track">
            <div className="test-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="test-progress-text">{progressPercent}%</span>
        </div>
      )}

      <div className="test-body">
        <span className="question-num">第 {currentQuestion + 1} 题 / 共 {totalQuestions} 题</span>
        <span className="question-text">{q?.text}</span>
        <span className="question-dimension">{q?.dimension}</span>

        <div className="test-options">
          {SCALE_OPTIONS.map(opt => (
            <div
              key={opt.value}
              className={`test-option ${selectedScore === opt.value ? 'selected' : ''}`}
              onClick={() => setSelectedScore(opt.value)}
            >
              <div className="option-radio" />
              <div className="option-content">
                <span className="option-label">{opt.value} 分 · {opt.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${!selectedScore ? 'disabled' : ''}`}
          onClick={handleNext}
        >
          {currentQuestion === totalQuestions - 1 ? '查看我的决策风格' : '下一题'}
        </button>
        <button className="skip-link" onClick={handleSkip}>跳过测试，直接使用</button>
      </div>
    </div>
  )
}
