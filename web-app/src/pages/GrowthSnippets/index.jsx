import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { getGrowthSnippets } from '../../domain/growthSnippets.js'
import './growth-snippets.css'

export default function GrowthSnippets() {
  const navigate = useNavigate()
  const { decisions } = useApp()
  const snippets = getGrowthSnippets(decisions)

  return (
    <div className="snippets-page">
      <div className="snippets-hero">
        <span className="snippets-kicker">复盘留下的线索</span>
        <h1>成长片段</h1>
        <p>这里不记录“选对还是选错”，只收集你愿意带去下一次决策的一点经验。</p>
      </div>

      {snippets.length > 0 ? (
        <div className="snippets-list">
          {snippets.map(snippet => (
            <div
              key={snippet.id}
              className="snippet-card"
              onClick={() => navigate(`/decision/${snippet.decisionId}`)}
            >
              <div className="snippet-card-head">
                <span className="snippet-type">{snippet.type === 'result' ? '结果复盘' : '当下复盘'}</span>
                <span className="snippet-date">{snippet.date}</span>
              </div>
              <span className="snippet-main">“{snippet.text}”</span>
              {snippet.summary && snippet.summary !== snippet.text && (
                <span className="snippet-summary">{snippet.summary}</span>
              )}
              <span className="snippet-source">来自：{snippet.decisionTitle}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="snippets-empty">
          <span className="snippets-empty-icon">💡</span>
          <span className="snippets-empty-title">还没有成长片段</span>
          <span className="snippets-empty-desc">
            完成一次浇水复盘后，你写下的收获会自动沉淀到这里。
          </span>
        </div>
      )}
    </div>
  )
}
