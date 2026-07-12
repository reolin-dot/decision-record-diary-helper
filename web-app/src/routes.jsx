import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import PageHeader from './components/PageHeader.jsx'

const Garden = lazy(() => import('./pages/Garden/index.jsx'))
const Coach = lazy(() => import('./pages/Coach/index.jsx'))
const Profile = lazy(() => import('./pages/Profile/index.jsx'))
const Record = lazy(() => import('./pages/Record/index.jsx'))
const RecordSuccess = lazy(() => import('./pages/RecordSuccess/index.jsx'))
const ReviewSuccess = lazy(() => import('./pages/ReviewSuccess/index.jsx'))
const Watering = lazy(() => import('./pages/Watering/index.jsx'))
const Review = lazy(() => import('./pages/Review/index.jsx'))
const DecisionDetail = lazy(() => import('./pages/DecisionDetail/index.jsx'))
const DecisionList = lazy(() => import('./pages/DecisionList/index.jsx'))
const GrowthSnippets = lazy(() => import('./pages/GrowthSnippets/index.jsx'))
const GrowthArchive = lazy(() => import('./pages/GrowthArchive/index.jsx'))
const MonthlyReport = lazy(() => import('./pages/MonthlyReport/index.jsx'))
const ThemeGarden = lazy(() => import('./pages/ThemeGarden/index.jsx'))
const CoachAnalyze = lazy(() => import('./pages/CoachAnalyze/index.jsx'))
const CoachResult = lazy(() => import('./pages/CoachResult/index.jsx'))
const StyleTest = lazy(() => import('./pages/StyleTest/index.jsx'))
const DataExport = lazy(() => import('./pages/DataExport/index.jsx'))
const Login = lazy(() => import('./pages/Login/index.jsx'))
const DecisionCompass = lazy(() => import('./pages/DecisionCompass/index.jsx'))
const DailyMemory = lazy(() => import('./pages/DailyMemory/index.jsx'))
const QuickCapture = lazy(() => import('./pages/QuickCapture/index.jsx'))
const ActivityTrail = lazy(() => import('./pages/ActivityTrail/index.jsx'))

function RouteFallback() {
  return <div className="page-container"><div className="empty-state">页面加载中...</div></div>
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Garden />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/record" element={<Record />} />
        <Route path="/record-success" element={<RecordSuccess />} />
        <Route path="/review-success" element={<ReviewSuccess />} />
        <Route path="/watering" element={<PageHeader title="提醒中心"><Watering /></PageHeader>} />
        <Route path="/review/:id" element={<PageHeader title="复盘"><Review /></PageHeader>} />
        <Route path="/decision/:id" element={<DecisionDetail />} />
        <Route path="/decision-list" element={<PageHeader title="决策记录"><DecisionList /></PageHeader>} />
        <Route path="/growth-snippets" element={<PageHeader title="成长片段"><GrowthSnippets /></PageHeader>} />
        <Route path="/growth-archive" element={<PageHeader title="成长档案"><GrowthArchive /></PageHeader>} />
        <Route path="/monthly-report" element={<PageHeader title="月度成长报告"><MonthlyReport /></PageHeader>} />
        <Route path="/theme-garden" element={<PageHeader title="主题花园"><ThemeGarden /></PageHeader>} />
        <Route path="/coach-analyze" element={<PageHeader title="圆桌追问"><CoachAnalyze /></PageHeader>} />
        <Route path="/coach-result" element={<PageHeader title="决策卡"><CoachResult /></PageHeader>} />
        <Route path="/style-test" element={<PageHeader title="决策风格测试"><StyleTest /></PageHeader>} />
        <Route path="/data-export" element={<PageHeader title="数据导出"><DataExport /></PageHeader>} />
        <Route path="/login" element={<PageHeader title="账号登录"><Login /></PageHeader>} />
        <Route path="/compass" element={<PageHeader title="决策罗盘"><DecisionCompass /></PageHeader>} />
        <Route path="/daily-memory" element={<PageHeader title="今日拾光"><DailyMemory /></PageHeader>} />
        <Route path="/quick-capture" element={<PageHeader title="收下念头"><QuickCapture /></PageHeader>} />
        <Route path="/activity-trail" element={<PageHeader title="成长足迹"><ActivityTrail /></PageHeader>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
