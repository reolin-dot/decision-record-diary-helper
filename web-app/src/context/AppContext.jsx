import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import storage from '../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS } from '../storage/storageKeys.js'
import { runMigrations } from '../domain/migrations.js'
import { buildStats } from '../domain/stats.js'
import { buildAiInsight, getLatestAiInsights } from '../domain/aiInsights.js'
import * as decisionModel from '../domain/decisionModel.js'

const AppContext = createContext(null)

const emptyStats = {
  totalDecisions: 0,
  reviewRate: '0%',
  growthLoopRate: '0%',
  streak: 0,
  monthlyDecisions: 0,
  bloomedCount: 0,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload }
    case 'UPDATE_DECISIONS':
      return { ...state, ...action.payload }
    case 'UPDATE_STYLE':
      return { ...state, decisionStyle: action.payload, hasStyleTest: true }
    case 'UPDATE_AI_INSIGHTS':
      return { ...state, aiInsights: action.payload }
    case 'SET_STYLE_SKIPPED':
      return { ...state, hasStyleTest: true, styleTestSkipped: true }
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload }
    case 'SET_LAUNCHED':
      return { ...state, hasLaunched: true }
    default:
      return state
  }
}

function splitDecisions() {
  const allDecisions = decisionModel.getActiveDecisions()
  return {
    decisions: allDecisions.filter(item => !item.isArchived),
    archivedDecisions: allDecisions.filter(item => item.isArchived),
    deletedDecisions: decisionModel.getDeletedDecisions(),
  }
}

function refreshDecisions(dispatch) {
  const next = splitDecisions()
  dispatch({ type: 'UPDATE_DECISIONS', payload: next })
  dispatch({ type: 'UPDATE_STATS', payload: buildStats(next.decisions) })
}

function loadStoredState() {
  runMigrations()

  const hasLaunched = storage.get(STORAGE_KEYS.HAS_LAUNCHED, false)
  const { decisions, archivedDecisions, deletedDecisions } = splitDecisions()
  const decisionStyle = decisionModel.loadDecisionStyle()
  const aiInsights = getLatestAiInsights(storage.get(STORAGE_KEYS.AI_INSIGHTS, []))
  const styleSkipped = storage.get(STORAGE_KEYS.STYLE_TEST_SKIPPED, false)
  const stats = buildStats(decisions)

  return {
    isLoaded: true,
    hasLaunched: !!hasLaunched,
    isNewUser: !hasLaunched,
    decisions,
    archivedDecisions,
    deletedDecisions,
    decisionStyle,
    aiInsights,
    hasStyleTest: !!(decisionStyle || styleSkipped),
    styleTestSkipped: !!styleSkipped,
    stats,
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    isLoaded: false,
    hasLaunched: false,
    isNewUser: false,
    decisions: [],
    archivedDecisions: [],
    deletedDecisions: [],
    decisionStyle: null,
    aiInsights: [],
    hasStyleTest: false,
    styleTestSkipped: false,
    userInfo: { name: '决策者', avatar: '' },
    stats: { ...emptyStats },
  })

  // Initialize on mount: run migrations, load data, compute stats
  useEffect(() => {
    const payload = loadStoredState()
    dispatch({ type: 'INIT', payload })

    // Mark as launched after first load
    if (!payload.hasLaunched) {
      storage.set(STORAGE_KEYS.HAS_LAUNCHED, true)
    }
  }, [])

  // Save a decision and refresh stats
  const saveDecision = useCallback((decision) => {
    const ok = decisionModel.saveDecision(decision)
    if (ok) refreshDecisions(dispatch)
    return ok
  }, [])

  // Create a new decision
  const createDecision = useCallback((payload) => {
    const decision = decisionModel.createDecision(payload)
    if (decision) refreshDecisions(dispatch)
    return decision
  }, [])

  // Save decision style
  const saveDecisionStyle = useCallback((style) => {
    const ok = decisionModel.saveDecisionStyle(style)
    if (ok) {
      dispatch({ type: 'UPDATE_STYLE', payload: style })
    }
    return ok
  }, [])

  // Skip style test
  const skipStyleTest = useCallback(() => {
    decisionModel.skipStyleTest()
    dispatch({ type: 'SET_STYLE_SKIPPED' })
  }, [])

  const deleteDecision = useCallback((decisionId) => {
    const ok = decisionModel.deleteDecision(decisionId)
    if (ok) refreshDecisions(dispatch)
    return ok
  }, [])

  const restoreDecision = useCallback((decisionId) => {
    const ok = decisionModel.restoreDecision(decisionId)
    if (ok) refreshDecisions(dispatch)
    return ok
  }, [])

  const purgeDecision = useCallback((decisionId) => {
    const ok = decisionModel.purgeDecision(decisionId)
    if (ok) refreshDecisions(dispatch)
    return ok
  }, [])

  const saveAiInsight = useCallback((input) => {
    const insight = buildAiInsight(input)
    if (!insight.content) return false

    const existing = storage.get(STORAGE_KEYS.AI_INSIGHTS, [])
    const next = getLatestAiInsights([insight, ...existing])
    const ok = storage.set(STORAGE_KEYS.AI_INSIGHTS, next)
    if (ok) {
      dispatch({ type: 'UPDATE_AI_INSIGHTS', payload: next })
    }
    return ok
  }, [])

  // Refresh stats from current decisions
  const refreshStats = useCallback(() => {
    const decisions = decisionModel.getActiveDecisions().filter(item => !item.isArchived)
    dispatch({ type: 'UPDATE_STATS', payload: buildStats(decisions) })
  }, [])

  const reloadFromStorage = useCallback(() => {
    const payload = loadStoredState()
    dispatch({ type: 'INIT', payload })
    return payload
  }, [])

  const value = {
    ...state,
    dispatch,
    saveDecision,
    createDecision,
    deleteDecision,
    restoreDecision,
    purgeDecision,
    saveDecisionStyle,
    saveAiInsight,
    skipStyleTest,
    refreshStats,
    reloadFromStorage,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export default AppContext
