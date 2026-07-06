# 决策成长日记 - 小程序转 Web 应用迁移计划

## 1. 迁移目标

将现有微信小程序迁移为移动端优先的 Web 应用，先完整保留当前核心体验：

- 决策花园：空态、新用户引导、花朵阶段、成长片段、最近决策。
- 决策记录：种子草稿、四步记录、继续完善草稿、完成后进入发芽阶段。
- 决策复盘：开始行动、当下复盘、结果复盘、跟进复盘次数。
- 决策风格测试：快速版、标准版、深入版题库和结果解释。
- 个人页：统计、徽章、风格结果、决策列表入口。
- 锦囊页：保留现有辅助分析流程。

本次迁移的第一目标不是重做产品，而是把“小程序壳”换成“Web 壳”，并把本地保存、导出备份和导入恢复做扎实。

## 2. 关键原则

- 先本地可用，再本地可信。V1 使用 localStorage，后续继续增强导出、导入、恢复和数据健康检查。
- 不做账号登录。Web 版默认直接进入花园，昵称只作为本地展示信息。
- 数据层通过 Storage Adapter 访问数据，便于统一导出、导入、迁移和异常处理。
- 保持移动端优先。桌面端用窄屏容器承载，不做复杂大屏布局。
- 不引入过重依赖。Toast、Modal、Loading 可以自研轻量组件。
- 保留治愈感。种花仍是外壳，核心价值仍是决策记录、复盘和自我洞察。

## 3. 推荐技术栈

- 构建工具：使用 `npm create vite@latest` 创建当前稳定版 Vite 项目，不锁死旧版本。
- 框架：React，JSX，暂不引入 TypeScript，降低迁移成本。
- 路由：React Router，优先使用 `HashRouter`，方便静态部署和本地打开。
- 状态：React Context + reducer，替代小程序 `getApp().globalData`。
- 存储：V1 使用 localStorage，通过 Storage Adapter 封装。
- 样式：全局 CSS + 页面 CSS 文件，先不强行 CSS Modules，降低从 WXSS 迁移成本。
- 部署：静态站点，可部署到 Vercel、Netlify、Cloudflare Pages、GitHub Pages 或普通静态服务器。

注意：当前小程序已存在 `cloud-init.js`、`sync-engine.js` 和 `sync-up/sync-down/sync-full` 云函数。Web 端不复用这些云函数，当前路线图也不规划账号登录和云同步。

## 4. 建议目录结构

```text
web-app/
  index.html
  vite.config.js
  package.json
  src/
    main.jsx
    App.jsx
    routes.jsx
    context/
      AppContext.jsx
      appReducer.js
    domain/
      decisionStages.js
      stats.js
      decisionModel.js
      migrations.js
    storage/
      StorageAdapter.js
      LocalStorageAdapter.js
      storageKeys.js
    utils/
      util.js
      question-bank.js
      mock-data.js
    hooks/
      useToast.js
      useModal.js
      useUnsavedChanges.js
    components/
      AppShell.jsx
      TabBar.jsx
      PageHeader.jsx
      Modal.jsx
      Toast.jsx
      Loading.jsx
      EmptyState.jsx
    pages/
      Garden/
      Record/
      RecordSuccess/
      Review/
      Watering/
      DecisionDetail/
      DecisionList/
      StyleTest/
      Coach/
      CoachAnalyze/
      CoachResult/
      Profile/
    styles/
      global.css
      tokens.css
```

## 5. 数据保存方案设计

### 5.1 V1 本地保存

V1 只实现本地保存，但必须通过统一接口访问：

```js
storage.get(key, defaultValue)
storage.set(key, value)
storage.remove(key)
storage.exportAll()
storage.importAll(payload)
```

localStorage 保存时必须 JSON 序列化，并捕获异常。异常时给用户明确提示，例如“浏览器存储空间不足，请先导出备份”。

### 5.2 V1.5 备份能力

Web 端建议比小程序更早加入“导出/导入 JSON 备份”，作为本地数据安全网：

- 导出：下载 `decision-diary-backup-YYYY-MM-DD.json`。
- 导入：读取 JSON，校验 `schemaVersion`，合并或覆盖由用户选择。
- 隐私提示：备份文件包含决策内容，提醒用户妥善保存。
- 恢复提示：换设备、换域名或清理浏览器数据前，先导出完整备份。

## 6. 数据模型与迁移

必须保留并统一以下核心字段：

```js
Decision = {
  id,
  title,
  background,
  options,
  choice,
  reason,
  expectation,
  mood,
  createdAt,
  updatedAt,
  reviewDate,
  status,            // draft | pending | reviewed
  reviewStage,       // none | current_done | result_done
  stage,             // seed | sprout | leaf | first_bloom | full_bloom | bloom
  actionStarted,
  firstReviewDone,
  resultReviewDone,
  wateringHistory,
  maxWaterings,
  isDraft,
  _deleted
}
```

Web 版 localStorage 建议保存这些 key：

- `schemaVersion`
- `hasLaunched`
- `decisions`
- `decisionStyle`
- `styleTestSkipped`
- `userProfile`
- `lastBackupTime`
- `backupReminderDismissedAt`

新增 `migrations.js`，启动时执行：

- 没有 `schemaVersion` 的旧数据按 v1 处理。
- 缺少 `wateringHistory` 时补空数组。
- 缺少 `maxWaterings` 时补 1。
- 旧 `bloom` 阶段兼容为盛开展示，但不强行覆盖原数据。
- 软删除 `_deleted` 记录默认不展示，但导出备份时保留。

## 7. Web 体验补充

Web 和小程序的差异需要单独处理：

- 设置 `viewport`，禁止页面在移动端出现奇怪缩放。
- 主容器 `max-width: 480px`，桌面端居中显示。
- 底部 TabBar 处理 `safe-area-inset-bottom`。
- 子页面返回用浏览器 history，必要时提供 fallback 到花园页。
- 表单页刷新/返回前提示未保存内容。
- 复盘提醒不能等同小程序订阅消息。V1 只做应用内提醒，V2 再考虑浏览器通知权限。
- 加 PWA manifest 和 service worker 可作为 V1.5 任务，不阻塞 V1。
- 所有私密数据相关页面增加“数据仅保存在本机浏览器”的说明。

## 8. 实施阶段

### Phase 0: 迁移前盘点

- 跑通小程序现有验证：JS parse、JSON parse、app.json 页面文件完整性。
- 列出现有页面、工具函数、存储 key、核心数据字段。
- 明确 Web 版不做账号登录和云同步，重点做本地备份恢复。

验收标准：

- 有一份迁移字段清单。
- 有一份页面迁移清单。
- 明确哪些小程序能力需要 Web 替代。

### Phase 1: 初始化 Web 工程

- 在 `E:/决策成长日记/web-app/` 初始化 Vite React 项目。
- 安装 React Router。
- 建立 `src/routes.jsx`、`AppContext`、基础样式。
- 配置 HashRouter。

验收标准：

- `npm run dev` 可启动。
- `/`、`/coach`、`/profile` 三个空页面可切换。
- 移动端窄屏容器正常显示。

### Phase 2: 抽出领域与存储层

- 迁移 `decisionStages`、`stats`、日期、ID、题库。
- 实现 `LocalStorageAdapter`。
- 实现 `migrations.js`。
- 实现 `AppContext` 初始化、保存、刷新统计。

验收标准：

- 刷新页面后数据不丢。
- `decisions`、`decisionStyle`、`styleTestSkipped` 可正常读写。
- 统计中的总数、复盘率、盛开数、连续记录天数可计算。

### Phase 3: 跑通最小闭环

优先迁移：

- Garden
- Record
- RecordSuccess
- DecisionDetail

目标是先完成“进入花园 -> 记录决策 -> 保存 -> 回到花园 -> 查看详情”。

验收标准：

- 可保存正式决策。
- 可保存种子草稿。
- 可从详情页继续完善同一颗种子，不生成重复记录。
- 花园阶段展示正确。

### Phase 4: 跑通复盘闭环

迁移：

- Review
- Watering
- DecisionList

验收标准：

- 可标记开始行动，阶段变为长叶。
- 可完成当下复盘，阶段变为初开。
- 可完成结果复盘，阶段变为盛开。
- 跟进复盘次数基于 `maxWaterings - wateringHistory.length` 展示。
- 决策列表的筛选、搜索、阶段标签正常。

### Phase 5: 迁移风格测试与个人页

迁移：

- StyleTest
- Profile

验收标准：

- 6 套题数量正确：10、24、24、48、48、48。
- 快速版、标准版、深入版都能完成并保存结果。
- 跳过测试状态可保存。
- Profile 可显示统计、风格结果、徽章、决策列表入口。

### Phase 6: 迁移锦囊流程

迁移：

- Coach
- CoachAnalyze
- CoachResult

验收标准：

- 现有锦囊入口和结果页可正常跳转。
- 不依赖小程序 API。
- 移动端显示不溢出。

### Phase 7: Web 增强

- 导出/导入 JSON 备份。
- PWA manifest。
- 基础离线缓存。
- 数据隐私说明。
- 可选：浏览器通知提醒探索。

验收标准：

- 用户可导出完整备份。
- 用户可从备份恢复数据。
- 断网时已加载过的应用壳仍可打开。

## 9. 小程序 API 替换表

| 小程序 API | Web 替代 |
| --- | --- |
| `wx.navigateTo` | `navigate('/path')` |
| `wx.switchTab` | `navigate('/tab')` |
| `wx.navigateBack` | `navigate(-1)` + fallback |
| `wx.showToast` | `ToastProvider.show()` |
| `wx.showModal` | `ModalProvider.confirm()` |
| `wx.showLoading` | `Loading` state |
| `wx.setStorageSync` | `storage.set()` |
| `wx.getStorageSync` | `storage.get()` |
| `wx.getSystemInfoSync` | CSS safe-area + viewport |
| `wx.cloud.callFunction` | 不迁移；Web 版不规划云函数同步 |

## 10. 风险与注意事项

- localStorage 有容量限制，长文本和大量记录可能失败，因此需要异常提示和导出备份。
- localStorage 与域名绑定，换域名会看不到旧数据。
- 不做账号和云同步，换设备前需要手动导出备份并在新设备导入。
- Web 浏览器通知权限不稳定，不适合作为 V1 的核心复盘提醒。
- HashRouter URL 不够漂亮，但最适合静态部署和本地预览。
- 不要在迁移时顺手重写产品逻辑，否则会同时引入迁移风险和产品风险。

## 11. 最终验收清单

- `npm run dev` 可启动。
- `npm run build` 可通过。
- 移动端 375px、390px、430px 宽度显示正常。
- 桌面端居中显示，最大宽度不超过 480px。
- 首次进入展示新用户/空花园状态。
- 能完成风格测试或跳过测试。
- 能保存草稿并继续完善。
- 能保存正式决策。
- 能完成开始行动、当下复盘、结果复盘。
- 刷新浏览器后数据仍存在。
- 导出备份可下载，导入备份可恢复。
- 所有页面没有小程序 API 残留。
- 控制台无明显运行错误。
