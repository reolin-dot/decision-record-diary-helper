import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import PageHeader from './components/PageHeader.jsx'

import Garden from './pages/Garden/index.jsx'
import Coach from './pages/Coach/index.jsx'
import Profile from './pages/Profile/index.jsx'

import Record from './pages/Record/index.jsx'
import RecordSuccess from './pages/RecordSuccess/index.jsx'
import ReviewSuccess from './pages/ReviewSuccess/index.jsx'
import Watering from './pages/Watering/index.jsx'
import Review from './pages/Review/index.jsx'
import DecisionDetail from './pages/DecisionDetail/index.jsx'
import DecisionList from './pages/DecisionList/index.jsx'
import GrowthSnippets from './pages/GrowthSnippets/index.jsx'
import CoachAnalyze from './pages/CoachAnalyze/index.jsx'
import CoachResult from './pages/CoachResult/index.jsx'
import StyleTest from './pages/StyleTest/index.jsx'
import DataExport from './pages/DataExport/index.jsx'

export default function AppRoutes() {
  return (
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
      <Route path="/coach-analyze" element={<PageHeader title="分析"><CoachAnalyze /></PageHeader>} />
      <Route path="/coach-result" element={<PageHeader title="分析结果"><CoachResult /></PageHeader>} />
      <Route path="/style-test" element={<PageHeader title="决策风格测试"><StyleTest /></PageHeader>} />
      <Route path="/data-export" element={<PageHeader title="数据导出"><DataExport /></PageHeader>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
