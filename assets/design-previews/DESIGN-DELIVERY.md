# 决策成长日记 - 设计交付文档

> 交付日期：2026-06-25  
> 设计版本：v2.0  
> 交付人：WorkBuddy 智能设计助手

---

## 一、交付清单

### ✅ 已完成的设计资产

#### 1. 设计规范文档
- **文件**：`design-spec.md`
- **内容**：完整的设计系统，包括色彩、字体、间距、圆角、阴影、组件规范
- **用途**：开发团队参考，确保设计一致性

#### 2. Tab 栏图标（SVG 格式）
- **文件位置**：`miniprogram/images/`
- **文件列表**：
  - `tab-garden-outline.svg` - 花园图标（未选中）
  - `tab-garden-filled.svg` - 花园图标（选中）
  - `tab-coach-outline.svg` - 锦囊图标（未选中）
  - `tab-coach-filled.svg` - 锦囊图标（选中）
  - `tab-profile-outline.svg` - 我的图标（未选中）
  - `tab-profile-filled.svg` - 我的图标（选中）
- **说明**：需要转换为 PNG 格式后使用（见下方转换指南）

#### 3. 页面设计原型（HTML）
- **文件列表**：
  - `design-preview-garden.html` - 花园主页设计稿
  - `design-preview-record.html` - 记录页设计稿
  - `design-preview-watering.html` - 浇水/复盘页设计稿
  - `design-preview-profile.html` - 个人中心设计稿
- **用途**：直观展示新设计效果，可在浏览器中直接打开查看

#### 4. 图标转换指南
- **文件**：`convert-icons-guide.js`
- **用途**：指导如何将 SVG 图标转换为小程序可用的 PNG 格式

---

## 二、设计规范核心要点

### 主色调
- **主色**：`#4A7C59`（深绿）
- **辅助色**：`#F5A623`（阳光黄）、`#8B6F47`（土壤棕）
- **中性色**：`#F5F5F5`（背景）、`#FFFFFF`（卡片）、`#222222`（文字主）

### 设计风格
- **隐喻**：花园/植物，让决策记录有温度
- **风格**：温暖、自然、克制、有呼吸感
- **圆角**：标准 24rpx，小按钮 16rpx
- **阴影**：轻微阴影（0 2rpx 12rpx rgba(0,0,0,0.06)）

### 字体规范
- **字号**：正文 28rpx，标题 32-40rpx
- **字重**：标题 600-700，正文 400
- **行高**：正文 1.6，标题 1.3-1.4

---

## 三、下一步操作指南

### 步骤 1：将 SVG 图标转换为 PNG

**方法 A - 使用在线工具（最简单）**
1. 打开 https://cloudconvert.com/svg-to-png
2. 上传 `miniprogram/images/` 目录下的 6 个 SVG 文件
3. 设置输出尺寸：81×81px（@3x）
4. 下载转换后的 PNG 文件
5. 将 PNG 文件重命名为：
   - `tab-garden.png`（对应 `tab-garden-outline.svg`）
   - `tab-garden-active.png`（对应 `tab-garden-filled.svg`）
   - `tab-coach.png`（对应 `tab-coach-outline.svg`）
   - `tab-coach-active.png`（对应 `tab-coach-filled.svg`）
   - `tab-profile.png`（对应 `tab-profile-outline.svg`）
   - `tab-profile-active.png`（对应 `tab-profile-filled.svg`）
6. 放到 `miniprogram/images/` 目录

**方法 B - 使用 Figma（推荐设计师）**
1. 打开 Figma，新建文件
2. 导入 SVG 文件（拖拽到画布）
3. 选中图标，点击 Export
4. 格式选择 PNG，缩放选择 3x（81×81px）
5. 导出并重命名

### 步骤 2：更新小程序样式

将 `miniprogram/app.wxss` 更新为新设计规范的样式。

**主要更新点**：
- 增强卡片阴影效果
- 统一圆角规范（24rpx）
- 优化按钮样式（增加按下态效果）
- 添加新的渐变色（用于顶部导航）

### 步骤 3：查看设计原型

在浏览器中打开以下文件，查看新设计效果：
- `design-preview-garden.html`
- `design-preview-record.html`
- `design-preview-watering.html`
- `design-preview-profile.html`

### 步骤 4：应用新设计到小程序

根据设计原型，逐步更新以下页面的 WXML 和 WXSS：
1. `pages/garden/garden.wxml` + `garden.wxss`
2. `pages/record/record.wxml` + `record.wxss`
3. `pages/watering/watering.wxml` + `watering.wxss`
4. `pages/profile/profile.wxml` + `profile.wxss`

---

## 四、设计亮点

### 1. 自定义图标设计
- 告别 emoji，使用专业设计的图标
- 描边/填充两种状态，符合小程序规范
- 花园、锦囊、我的三个图标各有特色，易于识别

### 2. 优化的视觉层次
- 统计数字使用大字号+主色，更醒目
- 卡片式布局，信息更清晰
- 渐变色顶部导航，增加品质感

### 3. 微交互设计
- 按钮按下缩放效果（0.96）
- 卡片点击反馈
- 平滑的过渡动画

### 4. 空状态设计
- 温暖的引导文案
- 清晰的行动号召（CTA）
- 减少用户的迷茫感

---

## 五、附加建议

### 可以进一步优化的地方

1. **插画设计**
   - 为新用户引导页设计专属插画
   - 为空状态设计有趣的插图
   - 风格：手绘感，温暖，自然

2. **动画效果**
   - 花朵生长动画（阶段变化时）
   - 浇水成功动画（水滴+震动）
   - 页面切换动画（淡入淡出）

3. **深色模式**
   - 根据设计规范，可以扩展深色模式配色
   - 主色在深色背景下需要调整对比度

4. **无障碍优化**
   - 确保所有按钮有合适的点击区域（最小 44×44px）
   - 为图标添加 aria-label
   - 确保色彩对比度符合 WCAG 标准

---

## 六、文件清单

```
决策成长日记/
├── design-spec.md              # 设计规范文档
├── convert-icons-guide.js      # 图标转换指南
├── design-preview-garden.html  # 花园主页设计原型
├── design-preview-record.html  # 记录页设计原型
├── design-preview-watering.html # 浇水页设计原型
├── design-preview-profile.html # 个人中心设计原型
└── miniprogram/
    └── images/
        ├── tab-garden-outline.svg   # 花园图标（未选中）
        ├── tab-garden-filled.svg    # 花园图标（选中）
        ├── tab-coach-outline.svg    # 锦囊图标（未选中）
        ├── tab-coach-filled.svg     # 锦囊图标（选中）
        ├── tab-profile-outline.svg  # 我的图标（未选中）
        └── tab-profile-filled.svg   # 我的图标（选中）
```

---

## 七、常见问题

### Q1：为什么图标是 SVG 格式？
A：SVG 是矢量格式，可以无限缩放而不失真。但需要转换为 PNG 才能在小程序 tabBar 中使用。

### Q2：设计原型可以直接用吗？
A：设计原型是 HTML/CSS 格式，用于展示设计效果。需要将样式应用到小程序的 WXSS 中。

### Q3：如何预览设计效果？
A：双击打开 `design-preview-*.html` 文件，在浏览器中查看。建议使用 Chrome 开发者工具切换到手机模式预览。

### Q4：设计规范会更新吗？
A：会根据小程序的实际使用情况持续更新。建议将 `design-spec.md` 作为设计变更的单一事实来源。

---

**交付完成！如有任何问题或需要调整，随时联系。**
