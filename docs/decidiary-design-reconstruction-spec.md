# 决策成长日记 · 设计重构规范（可落地版）

> 状态：本规范为画布（Ardot）适配器 `NO_ADAPTER` 期间的保底交付。
> 范围：覆盖用户确认的 5 项重构 —— ① 统一深浅主题 ② 重构 Garden 首页信息架构 ③ 收口设计令牌 ④ 修占位符对比度 + Windows 字体回退 ⑤ 落地页主 CTA 提纯。
> 画布进度：30 个 Light/Dark 变量已持久化；设计令牌总览板（Frame `3:33`）已建并截图验证；落地页与 Garden 重排因适配器离线未出稿，由本文档承接。

---

## 0. 设计原则（贯穿全局）

1. **主题统一**：浅色"纸感"为默认基准（与 19/22 个页面一致、更贴合日记的温暖感），深色"温室"改为同一套变量的 Dark 模式**可选切换**，消除 Garden/Coach 强制深色造成的首页↔子页明暗跳变。
2. **令牌单一来源**：所有颜色、间距、字号、圆角收归令牌层；源码中的硬编码色值统一收口，杜绝漂移。
3. **下一步行动优先**：Garden 首页从"全功能展览"改为"引导下一步动作"的轻量枢纽。
4. **主信号色独占**：绿色（accent）只用于主行动与关键状态，避免"卡片疲劳"稀释其信号意义。

---

## 1. 设计令牌系统（Light / Dark 双模式）

变量集：`Decidiary`。所有画布组件绑定以下变量，切换主题即全量预览。

### 1.1 色彩语义令牌

| 变量名 | 语义 | Light | Dark | 用途 / 收口说明 |
|---|---|---|---|---|
| `bg-page` | 页面底色 | `#f7f4ea` | `#1c211c` | 全局背景 |
| `bg-surface` | 表面/卡片 | `#fffdf8` | `#252b25` | 卡片、面板、输入框底 |
| `bg-sunken` | 下沉区 | `#eeece3` | `#161a16` | 输入框、分隔区、次级底 |
| `text-primary` | 主文字 | `#2b302a` | `#ece8dd` | 标题、正文 |
| `text-secondary` | 次级文字 | `#62675f` | `#a8ac9f` | 说明、副标题（Light 对比度≈4.9:1，过 AA） |
| `text-placeholder` | 占位符 | `#6f7168` | `#7e8278` | **已修复**：原 `#92948c` 对比度仅 2.6:1，现≈4.8:1 过 AA |
| `accent` | 森林绿（主信号色） | `#47604f` | `#6f8a78` | 主按钮、关键状态、链接 |
| `accent-strong` | 深森林绿 | `#3a4f41` | `#84a08c` | hover、强调文字 |
| `brass` | 黄铜点缀 | `#b69a61` | `#c9ac72` | 序号、标签、装饰（深底对比度≈6.9:1 达标） |
| `border` | 描边 | `#dcd6c8` | `#3a4038` | **收口**：替代源码 `#d0d0d0`，统一为令牌 |
| `on-accent` | 主按钮文字 | `#ffffff` | `#141814` | 主按钮上的文字 |

**令牌收口清单（源码硬编色值 → 令牌）**：
- `#394e3f`（`.connection-status`）→ `accent-strong`
- `#d0d0d0`（`.btn-secondary` 边框）→ `border`
- `#4a7c59`（`.app-error-page`）→ `accent`
- `#92948c`（占位符）→ `text-placeholder`（已加深至 `#6f7168`）

### 1.2 尺寸 / 间距 / 字号令牌

| 变量名 | 值 | 用途 |
|---|---|---|
| `radius-sm` | 8 | 小元素、输入框、色块 |
| `radius-md` | 12 | 卡片、面板 |
| `radius-lg` | 20 | 大区块、Hero 容器 |
| `radius-pill` | 999 | 按钮、徽章、标签 |
| `space-1` / `space-2` / `space-3` / `space-4` / `space-5` / `space-6` | 4 / 8 / 12 / 16 / 24 / 32 | 统一间距尺度 |
| `text-display` | 56 | Hero 大标题（Noto Serif SC Bold） |
| `text-h1` | 40 | 区块标题 |
| `text-h2` | 28 | 子标题 |
| `text-h3` | 20 | 卡片标题 |
| `text-body` | 16 | 正文（Noto Sans SC Regular） |
| `text-small` | 14 | 次要说明 |
| `text-caption` | 12 | 标签、脚注 |

### 1.3 字体与回退（项 ④）

- 标题：`'Noto Serif SC', Georgia, 'Songti SC', serif`（编辑感，对应温室主题）
- 正文：`'Noto Sans SC', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif`
- **Windows / Android 回退**：补 `system-ui` 作为无衬线回退，避免直接落到 `Microsoft YaHei` 造成观感偏差；衬线标题在 Windows 回退至 `Georgia`。
- 若产品未内置 Web 字体，建议在 `index.html` 引入 Noto Serif SC / Noto Sans SC 的 CDN 或自托管子集，保证跨平台一致。

---

## 2. 主题统一方案（项 ①）

**问题**：`garden.css` 末尾对 `.garden-page` 无条件套用深色令牌（不挂在媒体查询或 `[data-theme]` 上），导致 Garden 首页 / Coach 页强制深色，而 Record / Review / 列表等子页为浅色，首页↔子页存在生硬明暗跳变。

**方案**：
1. 将深色令牌套用改为显式条件：`.garden-page` 默认跟随浅色变量；仅当 `<html data-theme="dark">` 或用户开启"温室模式"时切换为 Dark 变量。
2. 提供主题切换控件（置于 Header 或 Profile），状态持久化到 `localStorage`。
3. 全站 22 个路由统一以浅色为基准，深色作为可选模式，明暗切换平滑过渡（建议 `transition: background-color .2s, color .2s`）。

---

## 3. Garden 首页信息架构重排（项 ②）

**原则**：从"全功能展览"改为"下一步行动优先"的轻量枢纽。

**现状问题**：统计条 → 复盘聚焦 → 4 个行动按钮 → 速记条 → 决策模式 → AI 洞察 → 成长片段 → 花朵网格 → 月度 → 最近决策，全部堆在一个滚动屏；19 个功能（决策罗盘、主题花园、今日拾光、成长足迹、成长片段、月度报告、风格测试、数据导出、最近删除…）藏在二级入口，新用户难以发现。另存在 `.garden-actions-inline` 与 `.garden-capture-strip` 同声明 `order: 3` 的排序冲突。

**重排后结构（自上而下）**：

```
┌─ 顶部行动区（粘性）
│   · 主行动按钮：「记录此刻 / 种下一颗种子」（accent 填充，全宽优先）
│   · 上下文建议：如「正在纠结 X？去圆桌梳理 →」（基于进行中决策推断，可选）
├─ 本周长势（精简统计，3–4 个核心指标）
│   · 连续记录天数 · 进行中决策 · 本月开花数 · 待复盘
├─ 分组入口（清晰分组，19 个隐藏功能浮现）
│   · 我的花园：进行中决策 / 花朵网格
│   · 工具箱：决策罗盘 / 主题花园 / 今日拾光 / 风格测试
│   · 成长回顾：月度报告 / 成长足迹 / 成长片段 / AI 洞察
├─ 最近决策流（单列，懒加载）
│   · 每条：标题 + 阶段标签 + 时间 + 一键续写
└─ 页脚：数据导出 / 最近删除 / 设置（次级）
```

**桌面侧边栏扩展**：从 3 项（Garden / Coach / Profile）扩到 5–7 个高频项：
`花园首页 / 圆桌梳理 / 决策罗盘 / 主题花园 / 今日拾光 / 成长回顾 / 我的`。移动端保持底部 Tab，桌面端显示完整侧边栏。

**Bug 修复**：统一 `.garden-actions-inline` 与 `.garden-capture-strip` 的 `order` 值，避免依赖源码顺序的隐性渲染冲突。

---

## 4. 落地页重构（项 ⑤）

**板块结构（已与用户确认全结构）**：Header / Hero / 问题-解法+运作 / 核心功能 / 次要功能网格 / 社会证明+最终 CTA / Footer。

### 4.1 Header
- 左：🌱 图标 + `Decidiary 决策日记`（Noto Serif SC Bold, `text-primary`）
- 中：导航 `功能介绍` `使用指南` `关于我们`（`text-secondary`，hover→`text-primary`）
- 右：CTA 按钮「开始使用」（`accent` 填充，`radius-pill`）
-  sticky，底部 `border` 描边

### 4.2 Hero
- 徽章：`决策花园 · 让每一次选择都长出果实`（`accent` 15% 透明底 + `accent-strong` 文字）
- 主标题（`text-display`，居中）：「不再让重要决定在纠结中腐烂 / 种下你的决策种子，看它生根、发芽、开出结果」
- 副文案（`text-secondary`，20px，居中）：一句直白收益 + 隐喻说明
- **主 CTA（提纯）**：「种下第一颗种子」（`accent` 填充 + 阴影，`radius-pill`）—— 唯一主行动
- 次 CTA：「看看怎么运作」（`border` 描边，`radius-pill`）
- **关键改动**：原「去圆桌梳理 / 直接记录 / 恢复备份」三类入口混排稀释主 CTA；「恢复备份」降级为页脚次级入口，不在 Hero 出现。

### 4.3 问题 / 解法 + 运作方式
- 痛点陈述（3 秒说清"解决什么"）
- 三阶段步骤卡（种花 → 长叶 → 开花），对应"记录→推演→复盘"闭环，每卡带图标 + 标题 + 一句说明，绑定 `bg-surface` + `border` + `brass` 序号

### 4.4 核心功能展示（竖向 3 项）
- 圆桌梳理 / 行动推进 / 复盘成长
- 每项：标题（`text-h2`）+ 说明（`text-secondary`）+ 截图占位框（`bg-sunken`，`radius-lg`）

### 4.5 次要功能网格（卡片网格）
- 让隐藏功能被发现：决策罗盘 / 主题花园 / 月度报告 / AI 洞察 / 今日拾光 / 成长足迹
- 每项：`card` 令牌（见 §6）+ 图标 + 标题 + 一句说明

### 4.6 社会证明 + 最终 CTA
- 数据指标条（如"已培育 N 颗决策种子"）
- 用户证言 1–2 条（`bg-surface` 引用卡）
- 最终行动召唤：「现在就种下第一颗种子」主 CTA 复用
- 主题切换示意（浅色/温室双预览小图）

### 4.7 Footer
- 次级入口：恢复备份 / 数据导出 / 关于 / 隐私
- 版权 + 社交链接

---

## 5. 组件令牌层（项 ③）

统一组件语言，消除"卡片疲劳"（首页每块同款白卡 + 同款阴影、缺少焦点）。

| 组件 | 规格 |
|---|---|
| Card | `bg-surface` + `border`(1px) + `radius-md`(12) + 阴影 `0 4px 12px rgba(0,0,0,.08)` + `padding: space-4`(16) |
| Button Primary | `accent` 填充 + `on-accent` 文字 + `radius-pill` + `padding: 12/24` + hover→`accent-strong` |
| Button Secondary | `bg-surface` + `border`(1px) + `text-primary` + `radius-pill` |
| Input | `bg-sunken` + `border`(1px) + `radius-sm`(8) + placeholder=`text-placeholder` |
| Badge / Tag | `brass` 填充 + 深底文字(`#1c211c`) + `radius-pill` + `padding: 4/12` |

**约束**：绿色（accent）仅用于主按钮与关键状态；次级动作一律用描边按钮或文字链接，保证主信号色独占。

---

## 6. 实施检查清单（回填代码用）

| 文件（推测） | 改动 |
|---|---|
| `src/styles/tokens.css` | 新增 Dark 模式变量（§1.1）；补充 `space-*` / `text-*` / `radius-*` 令牌 |
| `src/styles/global.css` | 硬编色值 `#394e3f`/`#d0d0d0`/`#4a7c59` 替换为令牌；占位符 `#92948c`→`text-placeholder`；补字体回退栈 |
| `src/pages/Garden/garden.css` | `.garden-page` 深色套用改为 `[data-theme="dark"]` 条件；修复 `order:3` 冲突；按 §3 重排 IA |
| 落地页组件 | 按 §4 重构：Hero CTA 提纯、"恢复备份"降级、补 §4.3–4.6 板块 |
| 侧边栏 / Tab 组件 | 桌面侧边栏扩至 5–7 项（§3） |
| 主题切换控件 | 新增，状态持久化 `localStorage`，平滑过渡 |

---

## 7. 画布恢复后的续作计划

适配器恢复（完成 Ardot 授权、选中 `.ardot` 文件标签）后，按以下顺序在画布补完：
1. 落地页重构（§4 全板块，绑定 `Decidiary` 变量）
2. Garden 首页重排（§3 结构）
3. 调用 `ardot-showcase-autolayout` 将「令牌板 / 落地页 / Garden」三块自动编排为评审展示区并返回链接

> 注：变量与令牌板已持久化于文件 `决策成长日记-设计重构 v1`（fileId `703897372898504`），续作不丢。
