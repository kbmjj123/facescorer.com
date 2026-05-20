# FaceScorer Design System v2.0

**Scope**: Global design source of truth for facescorer.com
**Date**: 2026-05-21
**Stack**: Nuxt 4 + Vue 3 + Tailwind CSS
**Style**: Young & Confident — custom curated

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

### 2.1 Design Tokens

```
┌─────────────────────────────────────────────────────────────┐
│  TOKEN              HEX        TAILWIND      用途            │
├─────────────────────────────────────────────────────────────┤
│  background         #FCFAF7    cream          页面底色         │
│  surface            #FFFFFF    white          卡片/面板        │
│  foreground         #1A1817    black          主文字           │
│  muted-foreground   #8C8883    muted-fg       次要文字         │
│  border             #EBE7E0    border         分割线/边框      │
│                                                             │
│  accent-primary     #E45B3C    coral          主 CTA / 链接    │
│  accent-hover       #C94A2E    coral-hover    hover 态        │
│  accent-light       #FFF0EC    coral-light    强调色背景       │
│                                                             │
│  success            #22C55E                  通过/正常        │
│  warning            #E45B3C                  警告             │
│  destructive        #DC2626                  错误/删除        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 色彩使用规则

**主色调**：Warm Coral `#E45B3C` —— 年轻、自信、有温度，且极具辨识度。

**Coral 仅用于**：主 CTA 按钮、链接、分数数字、高亮标签、测量辅助线。不在大面积底色或普通文本中使用——保持点缀感。

**背景色**：`#FCFAF7` 是极微暖的奶油白。纯白 `#FFFFFF` 在 OLED 屏幕上刺眼，奶油底衬托照片肤色更自然。

**按钮用黑色**：备选 CTA（次要按钮）用黑底白字或白底黑字+边框，不用珊瑚色——让主次分明。

**绝对不在主 UI 中出现**：
- 蓝紫渐变（`blue-500 → purple-600`）
- 霓虹色（`#00FF00`, `#FF00FF`）
- 彩虹色带
- 大面积高饱和色块
- Glassmorphism（`backdrop-filter blur`）
- 纯黑 `#000000` 或纯白 `#FFFFFF` 大色块

---

## 3. Typography

### 3.1 Font Stack

```
┌───────────────────────────────────────────────────────────┐
│  用途        字体             Weight     Google Fonts     │
├───────────────────────────────────────────────────────────┤
│  标题/Logo   Inter            700, 800       ✓            │
│  正文        Inter            400, 500, 600  ✓            │
│  数据/数字   Inter (tabular)  600, 700       ✓            │
│  日文        Noto Sans JP     400, 500, 700  ✓            │
└───────────────────────────────────────────────────────────┘
```

### 3.2 CSS Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');
```

### 3.3 Type Scale

```
┌──────────┬──────────┬──────────────────────┬─────────────┐
│  Token   │  Size    │  Line-Height         │  用途        │
├──────────┼──────────┼──────────────────────┼─────────────┤
│  score   │ 5.5rem   │ 0.92                 │ 首页大分数    │
│  display │ 2.75rem  │ 1.05                 │ Hero 标题    │
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

- **标题字间距**：`tracking-[-0.03em]` 到 `[-0.05em]`（大标题收紧）
- **数据数字**：始终 `font-variant-numeric: tabular-nums`，防止数字跳动
- **全站单字体**：Inter 全覆盖，靠 weight 变化做层次（不引入多字体增加加载成本）
- **日文**：正文最小 14px，中文/日文字符在 12px 以下几乎不可读

---

## 4. Spacing System

### 4.1 基础单位：4px

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

- 手机（默认）：`px-5`，内容区自动撑满
- 平板（md）：`max-w-2xl` (672px)
- 桌面（lg）：`max-w-4xl` (896px) — 双列布局
- 桌面宽屏（xl）：`max-w-6xl` (1152px) — 照片 + 分析结果双列

### 4.3 照片画布区

- 手机：全宽正方形（`aspect-ratio: 1/1`），无边距
- 桌面：固定宽度 420px，与结果区中间间距 64px

---

## 5. Animation & Interactions

### 5.1 全局 Timing

```
  --duration-fast:    150ms   // 按钮 hover、按压反馈
  --duration-normal:  300ms   // 卡片 hover、页面切换
  --duration-slow:    400ms   // 照片淡入、卡片入场
  --duration-reveal:  2000ms  // 关键点扩散（一次性仪式）
  
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1)
```

### 5.2 关键动画（按触发顺序）

**1. 关键点从中心向外扩散** ← 核心信任时刻
- 478 个点按距面中心距离分 3 波 staggered 出现
- 每个点 opacity 0→1 + scale 0→1，ease-out
- 每波 250ms，波间 150ms，总 ~2000ms

**2. 辅助线绘制**
- 关键点后 300ms，stroke-dashoffset 动画
- 对称轴 → 三庭线 → 黄金比例框，每条 500ms
- 颜色 coral，opacity 0.35-0.5

**3. 分数计数**
- requestAnimationFrame，1200ms ease-out
- 最后 100ms 微弱弹性

**4. 维度卡片入场**
- 分数后 200ms，下方 12px 滑入
- 每张延迟 60ms

### 5.3 微交互

- 按钮 hover：150ms bg 颜色过渡
- 按钮按下：scale(0.97)，缩放反馈
- 卡片 hover：300ms shadow 抬升
- prefers-reduced-motion：所有动画时长归零

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

- Canvas 和 `<img>` 保持同尺寸
- Canvas 使用 `devicePixelRatio` 缩放
- 关键点：2px 圆点，coral 填充，1px 白色 stroke
- 辅助线：coral，stroke-dasharray，opacity 0.35-0.5

### 6.2 维度卡片

```
┌─────────────────────────────────────────┐
│  ● 眼部比例                   9%        │  ← 圆点 + 维度名 + 排名
│  ─────────────────────────────────────── │
│  ████████████████░░░░  91/100          │  ← 进度条 + 分数
└─────────────────────────────────────────┘
```

### 6.3 分享卡片

- 规格：1080 × 1920 px（9:16）
- 技术：Canvas 手动合成
- 结构：用户照片 60-65% → 标签 → 分数 → 品牌
- 触发：分析完成后自动生成预览

### 6.4 导航

- 顶部：Logo + 语言切换 + Age Detector 链接
- 无底部 Tab Bar
- 语言切换：纯文字链接

---

## 7. Responsive Breakpoints

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
  [Photo+Canvas | Score     ] ← 左 420px 右自适应
  [             | Dimensions ]
  [Share Card   | FAQ       ]
```

---

## 8. Forbidden Patterns

### 8.1 视觉禁止

```
✗ Glassmorphism（backdrop-filter blur 卡片、毛玻璃导航栏）
✗ 蓝紫渐变（任何 blue-* → purple-* / violet-* 的组合）
✗ 大圆角卡片堆砌（>16px radius 的卡片在移动端横向 scroll）
✗ 霓虹发光效果（text-shadow glow、box-shadow glow）
✗ 纯黑 (#000000) 或纯白 (#FFFFFF) 大色块
✗ 字体：Roboto、Open Sans、Lato（"AI 模板默认字体"印象）
```

### 8.2 交互禁止

```
✗ Emoji 作为图标（必须用 SVG）
✗ Hover-only 交互（所有操作必须可点击/可触摸）
✗ 瞬间状态切换（所有变化必须有 transition ≥150ms）
✗ 无反馈的点击
✗ 触控目标 < 44×44px
```

### 8.3 内容禁止

```
✗ 泛泛夸奖文案（"你天生丽质"）
✗ 无数字依据的结论
✗ 照片上传到任何服务器
✗ 分析动画期间展示广告
✗ 分享卡片中展示弱项得分
✗ 裸分数展示（必须用 "Top X%" 框架）
```

---

## 9. Tailwind Config Mapping

```ts
colors: {
  cream:          '#FCFAF7',
  white:          '#FFFFFF',
  black:          '#1A1817',
  'muted-fg':     '#8C8883',
  border:         '#EBE7E0',
  coral:          { DEFAULT: '#E45B3C', hover: '#C94A2E', light: '#FFF0EC' },
},
fontFamily: {
  heading: ['Inter', ...sansFallback],
  body:    ['Inter', ...sansFallback],
},
borderRadius: {
  DEFAULT: '10px', sm: '6px', md: '12px', lg: '16px', full: '9999px',
},
boxShadow: {
  card:    '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
  elevated:'0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
  modal:   '0 16px 40px rgba(0,0,0,0.10)',
},
```

---

## 10. Files Reference

| 文件 | 内容 |
|------|------|
| `MASTER.md`（本文件） | 全局设计系统 |
| `../PRD.md` | 完整产品需求文档 |
| `pages/index.md` | Face Analyzer 页面特定覆盖（待创建） |
| `pages/age.md` | Age Detector 页面特定覆盖（待创建） |
| `share-card-styles.md` | 5 种分享卡片风格的详细配色/CSS（待创建） |
