# 决策成长日记 · 技术架构文档

**日期**：2026-06-23  
**类型**：技术架构文档  
**参与成员**：方向明（主理人）

---

## 📌 TL;DR（执行摘要）

- 当前架构：微信小程序原生前端 + Mock 数据层，无后端
- 核心改造：建立 Node.js/云开发后端，将 data-service.js 从 Mock 切换为真实 API
- 数据模型：用户 → 决策记录 → 复盘结果 → 成就徽章，关系清晰
- 优先级：P0 接入认证与数据持久化，P1 花园可视化，P2 社交分享

---

## 🎯 核心结论卡片

| 项目 | 内容 |
|------|------|
| 推荐后端方案 | 微信云开发（TCB）或 Node.js + MySQL |
| 优先级 | P0（后端接入） → P1（可视化） → P2（社交/洞察） |
| 预期影响 | 数据持久化、多端同步、可扩展性 |
| 资源需求 | 前端 1 人 × 10 人天，后端 1 人 × 15 人天 |
| 风险等级 | 中（数据迁移、微信登录授权） |

---

## 1. 系统架构总览

```
┌─────────────────────────────────────────────────┐
│                 微信小程序前端                    │
│  Pages: garden / record / review / coach ...  │
│  State: globalData (app.js)                  │
│  Storage: wx.setStorageSync (本地缓存)         │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────▼──────┐
        │  data-service │  ← 当前：Mock 数据
        │   (适配层)    │  ← 未来：wx.request → 后端 API
        └──────┬───────┘
               │
    ┌──────────┼──────────┐
    ▼                     ▼
【当前】Mock 数据      【未来】后端服务
utils/mock-data.js      API Server (Node/云开发)
```

---

## 2. 前端架构

### 2.1 目录结构

```
miniprogram/
├── app.js                  # 全局状态管理 (globalData)
├── app.json               # 路由、TabBar、窗口配置
├── app.wxss               # 全局样式 + Design Tokens (CSS 变量)
├── project.config.json    # 小程序工程配置
├── pages/
│   ├── garden/           # Tab1: 花园首页
│   ├── record/           # 记录决策（4步表单）
│   ├── record-success/   # 记录成功页
│   ├── watering/         # 待复盘列表
│   ├── review/           # 复盘填写页
│   ├── coach/            # Tab2: 锦囊首页
│   ├── coach-analyze/   # 锦囊分析页
│   ├── coach-result/     # 锦囊结果页
│   ├── profile/          # Tab3: 个人中心
│   └── style-test/      # 决策风格测试
└── utils/
    ├── data-service.js   # 🔌 数据访问适配层（核心！）
    ├── mock-data.js      # 测试数据
    └── util.js           # 工具函数（日期、ID生成）
```

### 2.2 状态管理方案

当前使用 `app.globalData` 作为全局状态，页面通过 `getApp().globalData` 访问。

**优点**：简单直接，适合小型小程序  
**缺点**：无响应式更新，数据散落在各页面 `data` 中

**建议改进**：引入 `mobx-miniprogram` 或小程序自带 `behaviors` 做状态集中管理。

### 2.3 数据访问层设计（data-service.js）

这是架构中最关键的适配层，目前设计良好：

```javascript
// 当前：Mock 模式
const USE_MOCK = true
function getStats() {
  if (USE_MOCK) return mock.mockStats
  // TODO: 改为 wx.request(...)
}

// 未来：切换为真实 API（页面代码无需修改！）
const USE_MOCK = false
function getStats() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://api.decision-diary.com/v1/stats',
      method: 'GET',
      success: res => resolve(res.data),
      fail: reject
    })
  })
}
```

**关键改进点**：
1. 所有方法需改为 `async/await` 异步模式
2. 增加统一错误处理拦截器
3. 增加请求重试机制（网络抖动）
4. 本地缓存策略：`wx.getStorageSync` 作为离线 fallback

---

## 3. 数据模型设计

### 3.1 核心实体关系图

```
User (用户)
  │
  ├── 1:N ── Decision (决策记录)
  │                │
  │                ├── 1:1 ── ReviewResult (复盘结果)
  │                └── 1:N ── Option (选项列表)
  │
  ├── 1:1 ── DecisionStyle (决策风格测试结果)
  └── 1:N ── Badge (成就徽章解锁记录)
```

### 3.2 数据表设计（建议）

**users 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| openid | varchar(64) UNIQUE | 微信 openid |
| nickname | varchar(64) | 昵称 |
| avatar_url | varchar(256) | 头像 URL |
| decision_style | varchar(32) | 决策风格类型 |
| created_at | datetime | 注册时间 |

**decisions 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | varchar(64) PK | 决策 ID |
| user_id | bigint FK | 所属用户 |
| title | varchar(100) | 决策标题 |
| background | text | 背景描述 |
| mood | varchar(16) | 心情标签 |
| choice_index | int | 选择的选项序号 |
| choice_reason | text | 选择理由 |
| expectation | text | 预期结果 |
| review_date | date | 计划复盘日期 |
| status | enum | pending/reviewed/expired |
| stage | enum | seed/sprout/bloom |
| created_at | datetime | 创建时间 |

**review_results 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| decision_id | varchar(64) FK | 关联决策 |
| result_rating | varchar(16) | 结果评价 |
| reflection | text | 复盘反思 |
| lesson | text | 学到的教训 |
| created_at | datetime | 复盘时间 |

---

## 4. API 设计（建议）

### 4.1 认证

```
POST /api/auth/wx-login
Body: { code: "wx.login返回的code" }
Response: { token: "JWT", user: { ... } }
```

### 4.2 决策记录

```
GET    /api/decisions           # 列表（分页、按状态过滤）
POST   /api/decisions           # 创建决策
GET    /api/decisions/:id       # 详情
PATCH  /api/decisions/:id       # 更新（复盘时）
DELETE /api/decisions/:id       # 删除
```

### 4.3 统计

```
GET /api/stats                 # 用户统计数据
GET /api/stats/garden-status   # 花园状态（用于可视化）
```

### 4.4 锦囊（决策辅助）

```
GET  /api/coach/frameworks    # 获取所有分析框架
POST /api/coach/analyze       # 提交分析数据，返回参考建议
```

---

## 5. 后端技术方案建议

### 方案 A：微信云开发（推荐用于 MVP）

- **优点**：无需自建服务器，与微信生态深度集成，免费额度高
- **组件**：云函数（Node.js）+ 云数据库（MongoDB 风格）+ 云存储
- **适合场景**：快速上线 MVP、用户量 < 10 万

### 方案 B：自建 Node.js 后端

- **技术栈**：NestJS + TypeORM + MySQL + Redis
- **优点**：完全可控，适合复杂业务逻辑，易于扩展
- **适合场景**：预计用户量大、需要复杂数据分析

### 建议

> **Phase 1（V1.0）**：使用微信云开发快速上线  
> **Phase 2（V2.0）**：如果用户量增长，迁移到自建后端

---

## 6. 前端性能优化建议

### 6.1 当前性能问题

| 问题 | 影响 | 修复方案 |
|------|------|----------|
| `app.js` 启动时同步读取所有 `wx.getStorageSync` | 启动延迟 | 改为懒加载，按需读取 |
| 决策列表在 `globalData` 中全量存储 | 内存占用随数据增长 | 分页加载，只缓存最近 20 条 |
| 每次 `onShow` 全量 `setData` | 页面卡顿 | 增量更新，使用 `keyed list` |
| 无图片懒加载 | 流量浪费 | 使用 `lazy-load` 属性 |

### 6.2 包体积优化

- 当前预估包大小：~200KB（不含图片），微信限制 2MB，暂时安全
- 建议：图片资源上传到 CDN，不在本地包内

---

## 7. 安全设计

### 7.1 小程序端

- ✅ 微信登录凭证（`wx.login`）不 transmit 到自家后端以外的任何地方
- ✅ 敏感操作（删除决策）需后端二次校验 `user_id`
- ⚠️ 当前 `mock-data.js` 中的测试数据需要在生产构建时被排除

### 7.2 后端（规划）

- JWT Token 鉴权（AccessToken + RefreshToken）
- API 请求频率限制（防止刷接口）
- HTTPS 强制，禁止 HTTP 访问
- 用户输入消毒（防 XSS/SQL 注入）

---

## 8. 数据同步策略

### 当前方案（本地存储）

```
微信 Storage (wx.setStorageSync)
  → 优点：离线可用，无需网络
  → 缺点：换手机/清缓存后数据丢失，无法多端同步
```

### 目标方案（云端同步）

```
小程序 → 云端 API → 数据库
           ↑
         本地缓存（离线 fallback）

同步策略：
1. 启动时不主动同步（减少启动耗时）
2. 关键操作（保存决策、完成复盘）后立即同步
3. 定时同步（每 30 分钟，小程序在前台时）
4. 冲突解决：以云端版本为准（Last Write Wins）
```

---

## 9. 技术债清单

| # | 技术债 | 严重程度 | 建议修复时间 |
|---|----------|------------|--------------|
| 1 | `data-service.js` 所有方法需改为异步 | P0 | V1.0 |
| 2 | `app.js` 启动时同步读取 Storage 阻塞渲染 | P1 | V1.0 |
| 3 | 部分 WXSS 未使用 CSS 变量（硬编码颜色） | P2 | V1.1 |
| 4 | 无统一错误处理封装 | P1 | V1.0 |
| 5 | `generateId()` 使用内存计数器，不支持多实例 | P2 | V1.1 |
| 6 | 无 TypeScript 类型定义 | P2 | V2.0 |
| 7 | 未接入小程序自定义组件化（所有页面独立） | P2 | V2.0 |

---

## 10. 后端迁移路线图

```
┌─────────────────────────────────────────────────────┐
│ Phase 1: 并行期（2 周）                          │
│  - 搭建云开发环境                                 │
│  - data-service.js 增加 `USE_MOCK=false` 分支     │
│  - 新用户走云端 API，老用户仍读 localStorage      │
├─────────────────────────────────────────────────────┤
│ Phase 2: 数据迁移（1 周）                        │
│  - 提供"数据导入"功能（localStorage → 云端）      │
│  - 双写策略：写入时同时写本地和云端              │
├─────────────────────────────────────────────────────┤
│ Phase 3: 切换完成（1 周）                        │
│  - 所有用户走云端 API                            │
│  - 移除 mock-data.js                             │
│  - 保留 localStorage 作为离线 fallback            │
└─────────────────────────────────────────────────────┘
```

---

## ✅ 行动清单

| # | 行动 | 负责方 | 时间窗 |
|---|------|--------|--------|
| 1 | 搭建微信云开发环境，设计数据库集合 | 后端 | 1 周 |
| 2 | 改造 data-service.js 为异步，接入云 API | 前端 | 1 周 |
| 3 | 实现微信登录流程（wx.login → 后端） | 全栈 | 3 天 |
| 4 | 统一所有 WXSS 文件使用 CSS 变量 | 前端 | 2 天 |
| 5 | 增加全局错误拦截 + 网络异常 UI | 前端 | 3 天 |
| 6 | 编写 API 接口文档（供前端对接） | 后端 | 2 天 |

---

## ⚠️ 待确认 / 假设

- 假设：V1.0 使用微信云开发，不自建服务器
- 假设：用户量在 1 年内不超过 10 万
- 待确认：是否需要支持 Web 端（未来多端同步）
- 待确认：数据分析功能是否需要独立的数据仓库

---

> 本文档由产品战略团队 AI 协作生成，技术决策请由技术负责人审定。
