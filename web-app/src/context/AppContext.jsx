import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import storage from '../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS } from '../storage/storageKeys.js'
import { runMigrations } from '../domain/migrations.js'
import { buildStats } from '../domain/stats.js'
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
      return { ...state, decisions: action.payload }
    case 'UPDATE_STYLE':
      return { ...state, decisionStyle: action.payload, hasStyleTest: true }
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

function loadStoredState() {
  runMigrations()

  const hasLaunched = storage.get(STORAGE_KEYS.HAS_LAUNCHED, false)
  const decisions = decisionModel.getActiveDecisions()
  const decisionStyle = decisionModel.loadDecisionStyle()
  const styleSkipped = storage.get(STORAGE_KEYS.STYLE_TEST_SKIPPED, false)
  const stats = buildStats(decisions)

  return {
    hasLaunched: !!hasLaunched,
    isNewUser: !hasLaunched,
    decisions,
    decisionStyle,
    hasStyleTest: !!(decisionStyle || styleSkipped),
    styleTestSkipped: !!styleSkipped,
    stats,
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    hasLaunched: false,
    isNewUser: false,
    decisions: [],
    decisionStyle: null,
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
    if (ok) {
      const allDecisions = decisionModel.getActiveDecisions()
      dispatch({ type: 'UPDATE_DECISIONS', payload: allDecisions })
      dispatch({ type: 'UPDATE_STATS', payload: buildStats(allDecisions) })
    }
    return ok
  }, [])

  // Create a new decision
  const createDecision = useCallback((payload) => {
    const decision = decisionModel.createDecision(payload)
    if (decision) {
      const allDecisions = decisionModel.getActiveDecisions()
      dispatch({ type: 'UPDATE_DECISIONS', payload: allDecisions })
      dispatch({ type: 'UPDATE_STATS', payload: buildStats(allDecisions) })
    }
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

  // Refresh stats from current decisions
  const refreshStats = useCallback(() => {
    const decisions = decisionModel.getActiveDecisions()
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
    saveDecisionStyle,
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
