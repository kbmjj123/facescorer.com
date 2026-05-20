# FaceScorer Design System v1.0

**Scope**: Global design source of truth for facescorer.com
**Date**: 2026-05-20
**Stack**: Nuxt 4 + Vue 3 + Tailwind CSS

---

## 1. Design Philosophy

### 三个核心原则

| 原则 | 含义 | 来源参考 |
|------|------|---------|
| **克制的信任感** | 界面退后，让用户照片和数据说话。少即是多。 | Linear.app 的界面克制 |
| **可验证的精确感** | 每一个数字、每一条辅助线都是"量出来的"，用户看到测量过程才相信结果。 | Apple Health 的数据可视化 |
| **社交货币品质** | 分享出去的卡片不能有廉价感。即使用户不给钱，他们给的是传播。 | Spotify Wrapped 的分享设计 |

### 四个情绪目标

- 使用者打开页面：**"这看起来靠谱"**（信任）
- 关键点动画播放时：**"它真的在量我的脸"**（可信）
- 分数出现时：**"这个数字有依据"**（精确）
- 分享卡片生成后：**"我想发出去"**（传播欲）

---

## 2. Color System

### 2.1 Design Tokens (Light Mode — 默认)

```
┌─────────────────────────────────────────────────────────────┐
│  TOKEN              HEX        TAILWIND      用途            │
├─────────────────────────────────────────────────────────────┤
│  background         #FAF9F6    bg-warm      页面底色         │
│  surface            #FFFFFF    bg-white     卡片/面板        │
│  foreground         #1C1C1E    text-primary 主文字           │
│  muted-foreground   #6E6E73    text-muted   次要文字         │
│  border             #E8E8EA    border       分割线/边框      │
│  border-light       #F0F0F2    border-light 轻分割线         │
│                                                             │
│  accent-teal        #0D7B78    accent       主 CTA / 链接    │
│  accent-teal-hover  #0A6562    accent-hover hover 态        │
│  accent-warm        #C8824A    accent-warm  数据高亮/评分    │
│  accent-warm-light  #F5EBE0    accent-warm-light 暖色背景    │
│                                                             │
│  success            #2D8B4A    success      通过/正常        │
│  warning            #C8824A    warning      警告             │
│  destructive        #C8483C    destructive  错误/删除        │
│                                                             │
│  dim-overlay        #1C1C1E/40 overlay     蒙层             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Design Tokens (Dark Mode)

```
┌─────────────────────────────────────────────────────────────┐
│  TOKEN              HEX        TAILWIND      用途            │
├─────────────────────────────────────────────────────────────┤
│  background         #0C0C0E    bg-dark       页面底色         │
│  surface            #161618    bg-surface    卡片/面板        │
│  foreground         #F5F5F7    text-primary  主文字           │
│  muted-foreground   #98989D    text-muted    次要文字         │
│  border             #2C2C2E    border        分割线           │
│                                                             │
│  accent-teal        #2DB5AD    accent        主 CTA           │
│  accent-teal-hover  #3FD4CC    accent-hover                  │
│  accent-warm        #D4956B    accent-warm   数据高亮         │
│  accent-warm-light  #2C221A    accent-warm-light             │
│                                                             │
│  success            #3CB35A    success                       │
│  warning            #D4956B    warning                       │
│  destructive        #D96B5A    destructive                   │
│  dim-overlay        #000000/60 overlay                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 色彩使用规则

**主色调决策**：选择深青（teal）而非蓝色或紫色。理由：
- 蓝色在医疗/健康类产品中过度使用，缺乏辨识度
- 紫色与 AI 行业过度绑定（"AI slop"审美）
- 深青兼具：科技感（冷色）+ 信赖感（与健康关联）+ 独特辨识度

**暖铜色（warm）用途受限**：仅用于评分数字高亮、数据条形图、分享卡片中的金色点缀。不在主 UI 按钮或导航中使用——保持克制。

**背景色不是纯白**：`#FAF9F6` 是极微暖的白色。纯白 `#FFFFFF` 在 OLED 屏幕上刺眼，在 LCD 屏幕上偏蓝。暖白让照片肤色看起来更好。

**绝对不在主 UI 中出现**：
- 蓝紫渐变（`blue-500 → purple-600`）
- 霓虹色（`#00FF00`, `#FF00FF`）
- 彩虹色带
- 大面积高饱和色块

---

## 3. Typography

### 3.1 Font Stack

```
┌───────────────────────────────────────────────────────────┐
│  用途        字体             Weight     Google Fonts     │
├───────────────────────────────────────────────────────────┤
│  标题/Logo   Instrument Sans  500, 600, 700  ✓            │
│  正文        Inter            400, 500       ✓            │
│  数据/数字   Inter (tabular)  500, 600, 700  ✓            │
│  日文        Noto Sans JP     400, 500, 700  ✓            │
└───────────────────────────────────────────────────────────┘
```

### 3.2 CSS Import

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@0,400;0,500;0,600;0,700&family=Noto+Sans+JP:wght@0,400;0,500;0,700&display=swap');
```

### 3.3 Type Scale

```
┌──────────┬──────────┬──────────────────────┬─────────────┐
│  Token   │  Size    │  Line-Height         │  用途        │
├──────────┼──────────┼──────────────────────┼─────────────┤
│  score   │ 56px/3.5rem│ 1.0 (tight)       │ 首页大分数    │
│  display │ 40px/2.5rem│ 1.1                │ Hero 标题    │
│  h1      │ 28px     │ 1.2                  │ 段落标题     │
│  h2      │ 22px     │ 1.25                 │ 卡片标题     │
│  h3      │ 18px     │ 1.3                  │ 小标题       │
│  body    │ 16px     │ 1.5                  │ 正文         │
│  body-sm │ 14px     │ 1.5                  │ 辅助文字     │
│  caption │ 12px     │ 1.4                  │ 标签/注释    │
│  tiny    │ 11px     │ 1.3                  │ 免责声明     │
└──────────┴──────────┴──────────────────────┴─────────────┘
```

### 3.4 字体规则

- **标题字间距**：`letter-spacing: -0.02em`（大标题收紧）
- **数据数字**：始终 `font-variant-numeric: tabular-nums`，防止数字跳动
- **日文**：正文最小 14px，中文/日文字符在 12px 以下几乎不可读
- **数字大于 3 位时**，使用千分位分隔或空格：`1,234` 或 `1 234`
- **断行规则**：中文/日文可在任意字符间断行；英文只在单词边界断行

---

## 4. Spacing System

### 4.1 基础单位：4px

所有间距基于 4px 网格。Tailwind 原生支持。

```
┌──────────┬─────────┬──────────────────────────────────────┐
│  Token   │  px     │  使用场景                              │
├──────────┼─────────┼──────────────────────────────────────┤
│  space-1 │  4px    │  icon 与 label 之间                   │
│  space-2 │  8px    │  相关元素组内间距                      │
│  space-3 │  12px   │  列表中相邻项                          │
│  space-4 │  16px   │  卡片内边距（默认）                    │
│  space-6 │  24px   │  section 内部间距                     │
│  space-8 │  32px   │  section 之间                         │
│  space-12│  48px   │  页面顶部/底部留白                     │
│  space-16│  64px   │  大区块分隔（桌面端）                  │
└──────────┴─────────┴──────────────────────────────────────┘
```

### 4.2 Container 宽度

- 手机（默认）：`px-4` (16px padding)，内容区自动撑满
- 平板（md）：`max-w-2xl` (672px)
- 桌面（lg）：`max-w-4xl` (896px) — 双列布局
- 桌面宽屏（xl）：`max-w-6xl` (1152px) — 照片 + 分析结果双列

### 4.3 照片画布区

- 手机：全宽正方形（`aspect-ratio: 1/1`），无边距
- 桌面：固定宽度 480px，与结果区中间间距 48px

---

## 5. Animation Principles

### 5.1 全局规则

```
所有动画基于以下 token：

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1)   // 进入
  --ease-in:     cubic-bezier(0.4, 0, 1, 1)      // 退出
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) // 弹性（仅分数）
  
  --duration-fast:    150ms   // 微交互
  --duration-normal:  250ms   // 状态切换
  --duration-slow:    400ms   // 页面切换
  --duration-reveal:  2000ms  // 关键点扩散（一次性）
```

### 5.2 动画清单（按触发顺序）

**1. 模型加载 → 进度条**
- 骨架屏 pulse 动画
- 进度条从 0% 平滑增长到 100%（`transition: width 300ms ease-out`）
- 加载完成时进度条消失（`opacity 0, 200ms`）

**2. 用户上传照片 → 照片出现**
- 照片从透明度 0 淡入，同时 scale 从 1.02 → 1.0
- 时长：400ms，`--ease-out`
- 零延迟：`createImageBitmap` 后立即渲染

**3. 关键点从中心向外扩散 ← 核心动画**
- 478 个关键点按距面部中心的距离分组
- 从中心最近点到最远点，分 3 波 staggered 出现
- 每个点：`opacity 0→1 + scale 0→1`，`--ease-out`
- 每波：250ms，波之间延迟 150ms
- 总时长：~2000ms
- **这是建立信任的关键时刻，不是装饰**

**4. 辅助线绘制**
- 关键点出现后 300ms 开始
- 线从起点延伸到终点（`stroke-dasharray + stroke-dashoffset` 动画）
- 对称轴先画，三庭线次之，黄金比例框最后
- 每条线 500ms
- 颜色：`#C8824A` 暖铜色，opacity 0.6

**5. 分数出现**
- 数字从 0 计数到最终分数
- 使用 `requestAnimationFrame`，ease-out
- 时长：1200ms
- 最后 100ms 有一个微弱弹性（`--ease-spring`），幅度不超过 2px

**6. 维度卡片 staggered 出现**
- 分数出现后 300ms
- 3 个维度卡片从下方 16px 滑入
- 每张卡片延迟 80ms
- `transform: translateY(16px) → 0, opacity 0 → 1`

### 5.3 微交互

- **按钮 hover**：`background-color` 变化，150ms
- **按钮 active**：`scale(0.98)`，100ms
- **切换语言/页面**：crossfade，250ms
- **分享卡片预览出现**：`opacity + translateY(8px)`，400ms `--ease-out`

### 5.4 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

当用户系统开启减少动效时：
- 关键点瞬间全部显示（无扩散动画）
- 辅助线瞬间绘制完整
- 分数直接显示最终值（无计数动画）
- 所有过渡时间归零

---

## 6. Interface Patterns

### 6.1 照片 + Canvas 叠加层

```
┌──────────────────────────────┐
│                              │
│     <img :src="photoUrl" /> │  ← 用户照片（底层）
│     <canvas                 │  ← 关键点 + 辅助线（叠加层）
│       :width / :height />   │    pointer-events: none
│                              │
└──────────────────────────────┘
```

- Canvas 和 `<img>` 始终保持同尺寸
- Canvas 使用 `devicePixelRatio` 缩放以保证清晰度
- 关键点位：2px 圆点，暖铜色填充，外圈 1px 白色 stroke

### 6.2 维度卡片

每个维度卡片结构：

```
┌─────────────────────────────────────────┐
│  ✦ 眼部比例              前 9%         │  ← 维度名 + 排名
│  ─────────────────────────────────────── │
│  你的眼距比例接近达芬奇定义的理想值，    │  ← 可验证描述
│  这是面部最容易被他人注意到的特征之一    │
│  ─────────────────────────────────────── │
│  ████████████████░░░░  0.89 / 1.00     │  ← 可视化条 + 分数
└─────────────────────────────────────────┘
```

### 6.3 分享卡片（Canvas 合成）

在 MASTER 中只定义结构规范，各风格具体配色见 `share-card-styles.md`。

**卡片规格**：1080 × 1920 px（9:16）
**用户照片**：卡片面积 60-65%，顶部对齐
**品牌标识**：底部 8% 区域，"facescorer.com"，小号字体
**标签**：用户照片上方或下方叠加

### 6.4 导航

单页应用，无复杂导航。

- 顶部：Logo + 语言切换 + Age Detector 链接
- 无底部 Tab Bar（只有两个页面，不需要）
- 语言切换：纯文字链接，无下拉菜单，无图标

---

## 7. Image & Photo Handling

### 7.1 照片质量检测

| 检测项 | 阈值 | 提示文案 |
|--------|------|---------|
| 人脸检测失败 | MediaPipe 返回 0 个 face | "Please upload a clear front-facing photo" |
| 多张人脸 | faces.length > 1 | "Analyzing the closest face" + 高亮最大人脸 |
| 分辨率过低 | < 200×200px | "Use a higher resolution photo for accuracy" |
| 侧脸角度 | yaw > 45° 或 pitch > 30° | "Please use a front-facing photo" |
| HEIC 格式 | file.type === 'image/heic' | 静默转换为 JPEG |

### 7.2 照片隐私

- 上传后立即用 `URL.createObjectURL()` 创建本地 blob URL
- 页面关闭时 `revokeObjectURL()` 释放
- Canvas 渲染在 `<canvas>` 中，不导出到任何服务器
- `<img>` 标签始终设置 `crossorigin="anonymous"`（虽然不需要，但作为安全习惯）

---

## 8. Responsive Breakpoints

```
  Base     ≥375px     (手机竖屏)
  sm:      ≥640px     (大手机)
  md:      ≥768px     (平板竖屏)
  lg:      ≥1024px    (平板横屏 / 小桌面) → 双列布局
  xl:      ≥1280px    (桌面) → 宽双列
```

**手机布局（< 1024px）**：单列
```
  [Nav]
  [Hero]
  [Photo + Canvas] ← 全宽正方形
  [Score]
  [Dimension Cards] ← 单列堆叠
  [Share Card Preview]
  [FAQ]
```

**桌面布局（≥ 1024px）**：双列
```
  [          Nav             ]
  [Hero — 宽度限制 672px ]
  [Photo+Canvas | Score     ] ← 左 480px 右自适应
  [             | Dimensions ]
  [Share Card   | FAQ       ]
```

---

## 9. Forbidden Patterns

### 9.1 视觉禁止（来自用户明确要求）

```
✗ Glassmorphism（backdrop-filter blur 卡片、毛玻璃导航栏）
✗ 蓝紫渐变（任何 blue-* → purple-* / violet-* 的组合）
✗ 大圆角卡片堆砌（>16px radius 的卡片在移动端横向 scroll）
✗ 霓虹发光效果（text-shadow glow、box-shadow glow）
✗ 纯黑 (#000000) 或纯白 (#FFFFFF) 大色块
✗ 字体：Roboto、Open Sans、Lato（"AI 模板默认字体"印象）
```

### 9.2 交互禁止（来自 UI/UX Pro Max 规范）

```
✗ Emoji 作为图标（必须用 SVG：Lucide 或 Heroicons）
✗ Hover-only 交互（所有操作必须可点击/可触摸）
✗ 瞬间状态切换（所有变化必须有 transition ≥150ms）
✗ 无反馈的点击（按钮点击必须有 visual response）
✗ Placeholder 替代 label（输入框必须有可见标签）
✗ 禁用缩放（<meta> 不能有 user-scalable=no）
✗ 触控目标 < 44×44px
✗ 滚动区域嵌套（内层 scroll 干扰外层）
```

### 9.3 内容禁止（来自 PRD）

```
✗ 泛泛夸奖文案（"你天生丽质"、"你充满魅力"）
✗ 无数字依据的结论
✗ 照片上传到任何服务器（包括 CDN、S3、Cloudflare Images）
✗ 分析动画期间展示广告
✗ 分享卡片中展示弱项得分
✗ 裸分数展示（必须用 "Top X%" 框架）
```

---

## 10. Tailwind Config Mapping

设计 token 到 Tailwind 的具体映射，设置在 `tailwind.config.ts` 的 `theme.extend` 中：

```ts
colors: {
  'bg-warm':       '#FAF9F6',
  'bg-dark':        '#0C0C0E',
  'bg-surface':     '#161618',
  foreground:       '#1C1C1E',
  'muted-fg':       '#6E6E73',
  border:           '#E8E8EA',
  accent:           '#0D7B78',
  'accent-hover':   '#0A6562',
  'accent-warm':    '#C8824A',
  'accent-warm-light': '#F5EBE0',
  success:          '#2D8B4A',
  warning:          '#C8824A',
  destructive:     '#C8483C',
},
fontFamily: {
  heading: ['Instrument Sans', ...sansFallback],
  body:    ['Inter', ...sansFallback],
  mono:    ['JetBrains Mono', ...monoFallback],
},
borderRadius: {
  sm:    '6px',
  DEFAULT: '8px',
  md:    '10px',
  lg:    '14px',
  xl:    '18px',   // 仅分享卡片等特殊情况使用
},
boxShadow: {
  card:    '0 1px 2px rgba(0,0,0,0.04)',
  elevated:'0 4px 12px rgba(0,0,0,0.06)',
  modal:   '0 20px 40px rgba(0,0,0,0.12)',
},
```

---

## 11. Pre-Implementation Checklist

开始写任何 UI 代码前，先过这 5 个问题：

1. **这个元素在 375px 手机上怎么表现？**（先设计手机版）
2. **这段文案有数字依据吗？**（没有就删掉）
3. **这个颜色在暖光灯下还好看吗？**（`#FAF9F6` 底色在黄色灯光下是暖白，不像纯白那样显冷）
4. **如果有人开启 reduced motion，这个动画还有意义吗？**（动画是增强，不是核心）
5. **这个组件可以只用 CSS 实现吗？**（不引入额外的 JS 动画库）

---

## 12. Files Reference

| 文件 | 内容 |
|------|------|
| `MASTER.md`（本文件） | 全局设计系统 |
| `pages/index.md` | Face Analyzer 页面特定覆盖（待创建） |
| `pages/age.md` | Age Detector 页面特定覆盖（待创建） |
| `share-card-styles.md` | 5 种分享卡片风格的详细配色/CSS（待创建） |
