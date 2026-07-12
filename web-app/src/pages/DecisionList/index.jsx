import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { getStageMeta } from '../../domain/decisionStages.js'
import { formatDate } from '../../utils/util.js'
import './list.css'

const TABS = ['全部', '生长中', '待复盘', '已盛开', '已归档', '草稿种子']

export default function DecisionList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { decisions, archivedDecisions } = useApp()

  const [activeTab, setActiveTab] = useState(0)
  const [searchKey, setSearchKey] = useState('')

  const today = formatDate(new Date())

  function getStatusLabel(d) {
    if (d.isDraft) return '草稿种子'
    if (d.status === 'reviewed') return '已盛开'
    if (d.status === 'pending') {
      if (d.reviewDate && d.reviewDate <= today) return '待复盘'
      return '生长中'
    }
    return ''
  }

  function isOverdue(d) {
    if (!d.reviewDate) return false
    return d.reviewDate <= today
  }

  // Sort and decorate decisions
  const decoratedDecisions = useMemo(() => {
    return [...decisions, ...archivedDecisions]
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(d => {
        const wateringCount = (d.wateringHistory || []).length
        const stageMeta = getStageMeta(d.stage)
        return {
          ...d,
          dateStr: d.createdAt,
          statusLabel: getStatusLabel(d),
          stageLabel: stageMeta.label,
          stageKey: d.stage,
          wateringText: wateringCount > 0 ? `已浇水 ${wateringCount} 次` : '',
        }
      })
  }, [decisions, archivedDecisions, today])

  // Filter by tab + search
  const filteredDecisions = useMemo(() => {
    let filtered
    switch (activeTab) {
      case 1: // 生长中
        filtered = decoratedDecisions.filter(d => d.status === 'pending' && !isOverdue(d))
        break
      case 2: // 待复盘
        filtered = decoratedDecisions.filter(d => d.status === 'pending' && isOverdue(d))
        break
      case 3: // 已盛开
        filtered = decoratedDecisions.filter(d => d.status === 'reviewed' && !d.isArchived)
        break
      case 4: // 已归档
        filtered = decoratedDecisions.filter(d => d.isArchived)
        break
      case 5: // 草稿种子
        filtered = decoratedDecisions.filter(d => d.isDraft && !d.isArchived)
        break
      default:
        filtered = decoratedDecisions.filter(d => !d.isArchived)
    }
    const key = searchKey.trim().toLowerCase()
    if (key) {
      filtered = filtered.filter(d => [
        d.title,
        d.background,
        d.reason,
        d.expectation,
        ...(d.options || []),
        ...(d.wateringHistory || []).flatMap(item => [item.reflection, item.lesson, item.summary]),
      ].filter(Boolean).join(' ').toLowerCase().includes(key))
    }
    return filtered
  }, [decoratedDecisions, activeTab, searchKey])

  return (
    <div className="dl-page">
      {/* Search bar */}
      <div className="dl-search">
        <div className="dl-search-inner">
          <span className="dl-search-icon">🔍</span>
          <input
            className="dl-search-input"
            placeholder="搜索标题、选项、理由或复盘..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            autoFocus={searchParams.get('focus') === '1'}
          />
          {searchKey && (
            <span className="dl-search-clear" onClick={() => setSearchKey('')}>✕</span>
          )}
        </div>
      </div>

      {/* Tab filters */}
      <div className="dl-tabs">
        {TABS.map((tab, idx) => (
          <div
            key={idx}
            className={`dl-tab ${activeTab === idx ? 'dl-tab-active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* List */}
      {filteredDecisions.length > 0 ? (
        <div className="dl-list">
          {filteredDecisions.map(d => (
            <div
              key={d.id}
              className="dl-item"
              onClick={() => navigate(`/decision/${d.id}`)}
            >
              <div className="dl-item-header">
                <span className="dl-item-title">{d.title}</span>
                <span className={`dl-item-stage dl-stage-${d.stageKey}`}>
                  {d.stageLabel}
                </span>
              </div>
              <div className="dl-item-meta">
                <span className="dl-item-date">{d.dateStr}</span>
                {d.wateringText && (
                  <span className="dl-item-watering">{d.wateringText}</span>
                )}
              </div>
              <div className="dl-item-status">
                <span className={`dl-status-dot dl-dot-${d.status}`} />
                <span className="dl-status-text">{d.statusLabel}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dl-empty">
          <span className="dl-empty-icon">📭</span>
          <span className="dl-empty-text">暂无决策记录</span>
          {searchKey && <span className="dl-empty-hint">换个关键词试试？</span>}
          {activeTab !== 0 && !searchKey && (
            <span className="dl-empty-hint">切换标签页看看</span>
          )}
        </div>
      )}
    </div>
  )
}
