# FaceScorer — 产品需求文档

**域名**：facescorer.com
**文档版本**：v1.0
**日期**：2026-05-20

---

## 1. 产品概述

### 1.1 产品定位

facescorer.com 是一个 AI 面部分析平台，提供两个工具：

- **Face Analyzer**（首页 `/`）：面部比例分析与颜值评分
- **Age Detector**（`/age`）：AI 预测面部年龄

所有分析 **100% 在用户浏览器本地完成**，照片不上传任何服务器。

### 1.2 核心价值主张

| 竞品痛点 | 本产品解法 |
|---------|----------|
| 上传照片到服务器，有隐私顾虑 | 纯本地推理，零数据上传，可被代码审计验证 |
| UI 简陋，结果无人主动分享 | 精心设计的分享卡片，以「社交货币」为核心设计目标 |
| 结果是「AI 乱说」，用户不信 | 关键点连线可视化 + 数字可验证，建立信任 |
| 仅英文 | 英文 + 中文双语，后续扩展日文 |
| 全部闭源 | 完全开源，隐私承诺可被验证 |

### 1.3 目标市场

**主力市场**：欧美英语圈（美国、英国、澳大利亚）
**次要市场**：日本
**用户画像**：18-35 岁，对外貌有好奇心，有社交媒体分享习惯

### 1.4 变现方式

Google AdSense 广告，广告位需提前规划，不影响核心体验流程。

### 1.5 增长逻辑

```
SEO 自然流量（主）
  + 用户分享结果卡片（病毒传播）
  + GitHub 开源带来开发者外链
  + Product Hunt / Show HN 发布
```

---

## 2. 市场与竞品

### 2.1 竞品格局

| 竞品 | 问题 |
|------|------|
| Fotor、Vidnoz、Media.io | 照片上传服务器；UI 平庸；无分享设计 |
| attractivenesstest.com | 服务端处理；分享卡片粗糙 |
| aifacerate.com | 已注册但无推广，处于「活死人」状态 |
| prettyscaleme.com、faceratio.net | 本地处理路线正确，但 UI 极其简陋 |

**核心差异化**：本地处理 + 高质量 UI + 病毒分享卡片 + 开源，四者同时实现。

### 2.2 关键词数据（Google Keyword Planner）

**Face Analyzer 方向**

| 关键词 | 月均搜索量 | 竞争 | 趋势 |
|--------|-----------|------|------|
| face analysis | 50,000 | 低 | 稳定 |
| face analyzer | 5,000 | 低 | 稳定 |
| ai face analyzer | 5,000 | 低 | 稳定 |
| face attractiveness analyzer | 5,000 | 低 | 稳定 |
| face analysis free | 5,000 | 低 | **+900% YoY** |
| face shape analyzer | 5,000 | 低 | 稳定 |
| face score analysis | 500 | 低 | **+900% 3个月** |

**Age Detector 方向**

| 关键词 | 月均搜索量 | 竞争 |
|--------|-----------|------|
| age detector | 5,000 | 低 |
| ai age detector | 5,000 | 低 |
| face age detector | 5,000 | 低 |
| age detector online | 5,000 | 低 |

**关键判断**：`face analysis free` 年同比增长 900%，市场处于爆发期，现在进入时机合适。

---

## 3. 产品结构

### 3.1 页面结构

```
facescorer.com/          → Face Analyzer（首页即产品）
facescorer.com/age       → Age Detector
```

首页即产品，用户进入直接可用，无需额外介绍页。

两个页面互相导流：
- Face Analyzer 结果页底部：「顺便 — AI 觉得你几岁？→」
- Age Detector 结果页底部：「查看完整面部分析 →」
- 照片在内存中传递，跳转时无需重新上传

### 3.2 单页结构（两个工具相同模式）

```
Section 1  Hero          标题 + 一句话定位 + 隐私承诺
Section 2  Upload        上传区 / 拍照入口
Section 3  Analyzing     分析动画（过渡态）
Section 4  Result        核心结果展示
Section 5  Share Card    分享卡片
Section 6  FAQ           SEO 内容
```

用户从上传到分享，全程不跳页，沉浸式体验。

---

## 4. 技术方案

### 4.1 技术选型

**放弃 face-api.js 的原因**：最后更新于 2020 年，基本停止维护，存在长期兼容性风险。

**选用 MediaPipe Face Landmarker**：

| 对比项 | face-api.js | MediaPipe Face Landmarker |
|--------|------------|--------------------------|
| 关键点数量 | 68个（2D） | **478个（含 Z 轴深度）** |
| 最后更新 | 2020 | **2025 持续维护** |
| 浏览器后端 | WASM | **WASM + WebGL2** |
| 表情识别 | 基础 | **52个 Blendshape 系数** |
| 手机优化 | 一般 | **专门优化移动端** |
| 包大小 | ~6MB | **~4MB** |

**年龄估算**：单独轻量 ONNX 模型（~3MB），精度 ±4.5 岁。

**重要发现**：MediaPipe 的 52 个 Blendshape 系数已包含表情信息（眉毛、嘴角、眼睛），情绪判断无需额外模型。

### 4.2 完整技术栈

```
模型层     MediaPipe Face Landmarker（WASM）
           + 轻量年龄估算 ONNX 模型（仅 /age 页加载）

渲染层     Canvas API（关键点 + 连线 + 辅助线动画）

分享卡片   Canvas 手动合成（不用 html2canvas，避免跨域问题）

页面结构   Nuxtjs4 + Vue3 + tailwind.css

托管       Cloudflare Pages（全球 CDN，免费）

模型托管   Cloudflare R2（按需加载，浏览器自动缓存）

开源       GitHub（Apache 2.0 License）
```

### 4.3 模型加载策略

```
页面加载时  → 立即异步预加载模型（后台静默）
用户上传时  → 模型大概率已就绪（<1秒推理）
若未就绪    → 显示进度条（通常 <3秒）
/age 页     → 仅额外加载年龄模型，Face 模型复用
```

---

## 5. 评分系统（Face Analyzer）

### 5.1 技术本质说明

**必须清楚**：AI 无法测量「真实颜值」。产品实际计算的是面部几何比例，包装成有意义的分析报告。这不是缺陷，所有竞品本质上做的是同一件事，用户接受这个逻辑。

页面需明确说明：「基于面部几何比例计算，仅供参考」——这句话反而增加可信度。

### 5.2 评分维度

| # | 维度 | 计算方式 | 权重 |
|---|------|---------|------|
| 1 | 左右对称性 | 左右对应关键点镜像误差均值 | 20% |
| 2 | 面部黄金比例 | 面部长宽比与 1.618 接近程度 | 20% |
| 3 | 三庭匀称度 | 发际-眉/眉-鼻底/鼻底-下巴三段等分方差 | 15% |
| 4 | 五眼对齐 | 眼宽与面宽的 1/5 关系契合度 | 15% |
| 5 | 眼距比例 | 眼间距/面宽接近 0.46 的程度 | 10% |
| 6 | 鼻唇比例 | 嘴角宽/鼻翼宽接近黄金比的程度 | 10% |
| 7 | 下颌轮廓 | 下颌角关键点弧度流畅度 | 10% |

### 5.3 评分算法

- 每项维度单独打分，满分 100
- 加权求和后映射到 **60–99** 区间
- 设置下限 60 分：保护用户情感，提高分享意愿

### 5.4 分数展示策略

**核心原则**：用「前 X%」代替裸分数，框架效应让结果更积极。

```
原始分：62/100
展示为：「全球用户中排名前 41%」

同一数字，不同框架，感受完全不同
```

**维度展示策略**：
- 只展示最高的 2 个维度 + 1 个「有话题性」的维度（共 3 个，不是全部 7 个）
- 最高维度配精确排名：「眼部比例 前 9%」
- 每个维度配一句可验证的描述，不是泛泛的夸奖

---

## 6. 结果报告设计

### 6.1 让用户相信结果的核心机制

**可视化证据先行**：

```
上传照片
  → 关键点从面部中心向外扩散出现（动画，约2秒）
  → 对称轴、三庭线、黄金比例框逐条绘制
  → 数字从 0 计数到最终分数
  → 用户全程在看自己的脸被「量」
```

用户看到测量过程，才会相信测量结果。这是信任建立的关键时刻，不是装饰。

**文案的可验证性原则**：

每一个结论后面必须跟一个数字或事实依据：

```
❌ AI 乱说感（删除）：
「你充满亲和力」「你气质独特」「你天生丽质」

✅ 有根据感（保留）：
「你的眼距/面宽比为 0.44，落在视觉舒适区间 0.42-0.46 内，
 在测量用户中排前 23%，这让你的眼神看起来舒展而不局促」
```

**检验标准**：写完任何一段文案，问「这句话换一个不同的人，还成立吗？」如果成立，删掉，这是 AI 乱说。

### 6.2 报告结构

**第一屏：总分 + 全球排名 + 人格标签**

```
[照片 + 关键点连线]

  84 / 100
  Top 12% Globally

「Harmonious Symmetry」
Your facial structure falls in the top 12% for bilateral symmetry.
```

标签（如「Harmonious Symmetry」）是社交货币——用户发出去说的不是「我 84 分」，而是「AI 说我是 Harmonious Symmetry 型」。

**第二屏：Top 维度展示（仅 3 个）**

```
✦ 眼部比例      前 9%
  「你的眼距比例接近达芬奇定义的理想值，
   这是面部最容易被他人注意到的特征之一」

✦ 面部对称      前 16%
  「完美对称其实并不存在——你这样的对称程度
   在人群中属于少数，轻微的不对称反而让面孔更有辨识度」

✦ 下颌轮廓      前 45%
  「你的下颌线条流畅，偏柔和风格，
   这在不同文化的审美评价中差异很大」
```

注意第三条用「文化差异大」替代「你这里不好」——保护情感，同时制造讨论话题。

### 6.3 Age Detector 报告特殊设计

```
AI 判断你：24 岁
你的实际年龄：[用户自填]

结果A（显年轻）：
「AI 低估了你 X 岁
 你的面部特征中，眼周紧致度和肤色均匀性
 是让你看起来更年轻的主要原因」

结果B（显年老）：
「AI 高估了你 X 岁
 这通常与照片光线或拍摄角度有关——
 在自然光下重新测试往往会有不同结果」
```

结果 B 的策略：**永远给用户一个「不是我的问题」的解释出口**。用户不会沮丧，还会重新测试（提高留存和页面停留时间）。

---

## 7. 分享卡片设计

### 7.1 核心规格

- 尺寸：竖版 9:16（1080×1920px）
- 技术：Canvas 手动合成
- 触发：分析完成后自动生成预览，无需点击

### 7.2 卡片内容原则

卡片只展示用户「最好的那一面」，不展示弱项：

```
❌ 错误设计：
[用户头像]
颜值评分：84/100
对称性 91% | 黄金比例 78% | 眼距 65%
facescorer.com

✅ 正确设计：
[用户头像，大图]

「Harmonious Symmetry」
Top 12% · Facial Symmetry

Your facial structure creates
a natural sense of trust and warmth.

facescorer.com
```

朋友看到正确设计会问：「Harmonious Symmetry 是什么？我也去测」，这是传播的触发点。

### 7.3 多风格自动匹配

系统根据浏览器语言 + 感知性别静默决定风格，用户无需选择：

| 语言 | 感知性别 | 风格 | 视觉方向 |
|------|---------|------|---------|
| 英文 | 女 | 杂志时尚感 | 米白极简，黑色+金色 |
| 英文 | 男 | 科技数据感 | 深色背景，霓虹渐变 |
| 中文 | 女 | 小红书感 | 奶油白，珊瑚粉+金 |
| 中文 | 男 | 数据科技感 | 深蓝冷调 |
| 日文 | 女/男 | 清冷极简感 | 近白灰，黑白单色 |

**兜底规则**：
- 语言无法识别 → 英文风格
- 性别置信度 < 0.6 → 该语言女性风格
- 性别误判时：卡片下方展示另一风格缩略图，点击即时切换（文案「Switch style」），不标注「男/女」

### 7.4 支持操作

- 下载为 PNG
- 复制到剪贴板
- 直接分享（Web Share API，手机端）

---

## 8. 页面布局与交互

### 8.1 设计原则

**手机优先**：目标用户大概率在手机上搜索和使用，所有设计以手机端为基准，桌面端为增强。

### 8.2 手机端布局（单列）

```
┌─────────────────┐
│  Hero           │  标题 + 一句话 + 隐私承诺（首屏全部可见）
├─────────────────┤
│  Upload         │  大面积拖拽区 / 拍照按钮
├─────────────────┤
│  Analyzing      │  照片 + 关键点动画（过渡态）
├─────────────────┤
│  [照片+连线]    │  全宽方形
│  总分 + 排名    │
│  Top 维度 1     │
│  Top 维度 2     │
│  Top 维度 3     │
├─────────────────┤
│  分享卡片预览   │
│  [下载] [复制]  │
├─────────────────┤
│  Age Detector → │  交叉导流入口
├─────────────────┤
│  FAQ            │  SEO 内容
└─────────────────┘
```

### 8.3 关键交互细节

**上传入口**：

```html
<input type="file" accept="image/*" capture="user">
```

`capture="user"` 手机端优先调起前置摄像头，也可切换相册，一个按钮解决两种场景。

**分析动画**（模型加载期间，2-4秒）：

```
上传完成 → 立即显示用户照片（零延迟）
         → 关键点从面部中心向外扩散（动画）
         → 辅助线逐条延伸绘制
         → 数字从 0 计数到最终分值
等待变成「扫描仪器正在工作」的仪式感
```

**桌面端**：左侧照片+连线，右侧评分数据，双列布局。

### 8.4 照片质量处理

上传后需检测并提示：

| 情况 | 处理方式 |
|------|---------|
| 未检测到人脸 | 提示「请上传清晰的正面照片」 |
| 检测到多张脸 | 高亮最大人脸，提示「已分析最近的面部」 |
| 照片分辨率过低 | 提示「建议使用更清晰的照片以获得准确结果」 |
| 侧脸（超过45°） | 提示「请使用正面照片」 |

美颜滤镜问题：技术上无法检测，在 Tips 中提示「建议使用未经美颜处理的照片，结果更准确」。

---

## 9. 多语言方案

### 9.1 支持语言

| 语言 | 优先级 | 备注 |
|------|--------|------|
| 英文（en） | P0 | 默认语言，首要市场 |
| 简体中文（zh） | P0 | 同步上线 |
| 日文（ja） | P1 | 次要市场 |

### 9.2 实现方式

保留 @nuxtjs/i18n 框架，使用 `i18n/locales/` 目录下的 JSON 文件。新增 ja.json。

### 9.3 语言检测

自动检测 `navigator.language`，手动切换时通过 `useSwitchLocalePath()` 切换。

---

## 10. SEO 方案

### 10.1 页面 SEO 配置

**首页（Face Analyzer）**：

```html
<title>AI Face Analyzer & Scorer — Free, Private, No Upload</title>
<meta name="description" content="Get your AI face analysis score in seconds. 100% in-browser processing — your photo never leaves your device. Free face attractiveness analyzer based on golden ratio & symmetry.">
```

目标关键词：`face analyzer`、`ai face analyzer`、`face attractiveness analyzer`、`face score`、`face analysis free`

**子页（Age Detector）**：

```html
<title>AI Age Detector — How Old Do You Look? Free Face Age Test</title>
<meta name="description" content="Upload your photo and find out what age AI thinks you are. Free AI age detector — runs in your browser, photo stays private.">
```

目标关键词：`age detector`、`ai age detector`、`face age detector online`

### 10.2 hreflang 配置

```html
<link rel="alternate" hreflang="en" href="https://facescorer.com/" />
<link rel="alternate" hreflang="zh" href="https://facescorer.com/zh/" />
<link rel="alternate" hreflang="ja" href="https://facescorer.com/ja/" />
```

### 10.3 FAQ 内容（兼顾 SEO）

Face Analyzer 页面 FAQ：

- How does the AI face analyzer work?
- Is my photo uploaded to a server?
- How is the face score calculated?
- What is facial symmetry and why does it matter?
- How accurate is the AI face attractiveness test?
- What's the difference between face score and real attractiveness?

Age Detector 页面 FAQ：

- How does the AI age detector work?
- Why did AI guess my age wrong?
- What affects how old you look to AI?
- Is this age detector accurate?

---

## 11. 开源策略

### 11.1 License

**Apache 2.0**：允许自由使用和商用，但必须保留原始署名和链接。

### 11.2 GitHub README 核心内容

```markdown
# FaceScorer — AI Face Analysis, 100% In-Browser

[Live Demo](https://facescorer.com) | [中文文档](#) | ⭐ Star if useful

## Why open source?
"We don't store your photos" should be verifiable, not just a promise.
Open source means anyone can audit the code.

## Features
- Face analysis (7 dimensions, golden ratio & symmetry)
- Age detection (±4.5 years accuracy)
- 100% client-side — Cloudflare hosted
- Bilingual (EN / ZH)
- Shareable result cards

## Tech Stack
MediaPipe Face Landmarker · ONNX Runtime Web · Canvas API · Cloudflare Pages

## Deploy your own (3 minutes)
[Deploy to Cloudflare Pages]
```

### 11.3 开源带来的增长机制

```
GitHub README 中的链接          → 高质量外链（DA 极高）
开发者写「MediaPipe 实战教程」  → 引用本项目，自然外链
Show HN / Product Hunt 发布     → 技术社区流量爆发
一键部署按钮                    → 每个部署者都保留原始链接
```

### 11.4 配套技术文章（发布至 Dev.to / Hashnode）

- 「How I built a face analyzer that runs entirely in the browser」
- 「MediaPipe Face Landmarker: 478 landmarks in the browser with ONNX」
- 「Building privacy-first AI tools — no server required」

这些文章本身是 SEO 内容，同时给 GitHub repo 和网站带外链。

### 11.5 发布节奏

```
阶段一：核心功能完成，代码整理干净
         → 同一周提交 Product Hunt + Show HN + 开源
         → 集中引爆，利用平台新鲜度加权

阶段二：根据 Issue 和数据迭代
         → 不提前承诺功能路线图
```

---

## 12. 隐私与合规

### 12.1 隐私承诺

- 所有图片处理 100% 在浏览器本地完成
- 不上传、不存储、不传输任何图片数据
- 关闭页面/刷新后图片自动销毁
- 开源代码可被任何人审计验证

### 12.2 页面展示

隐私承诺出现在三个位置：
- Hero 区（显眼位置）
- 上传区（上传按钮附近）
- FAQ（详细解释）

### 12.3 合规要求

**欧盟 AI Act**：需明确告知用户「你正在被 AI 分析」，说明分析局限性，面向欧洲用户必须包含此声明。

**未成年人保护**：需要年龄声明（「本工具面向 13 岁以上用户」）。

**免责声明**：「评分基于几何比例计算，仅供参考，不代表真实吸引力评估，结果因人而异」——此声明必须出现在结果页。

---

## 13. 广告变现

### 13.1 广告位规划

广告位必须提前设计，不能交给 AdSense 自动投放破坏体验。

| 位置 | 格式 | 时机 |
|------|------|------|
| FAQ 区块内 | 原生内容广告 | 页面底部，不干扰主流程 |
| 结果页分享卡片下方 | Banner | 用户已看到结果，情绪高点已过 |
| Age Detector 结果页 | Banner | 同上 |

**绝对禁止**：分析动画过程中插入广告、分享卡片生成过程中插入广告——这两个是产品体验的高光时刻。

### 13.2 广告收益预期参考

CPC 数据显示该领域广告主出价较高（`face attractiveness analyzer` CPC 最高 $34.74），说明美容、整形咨询类广告主对这类流量有需求，广告 RPM 预期高于普通工具站。

---

## 14. 已知风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| 手机低端设备模型加载慢 | 高 | 上传后立即显示照片，动画填充等待时间；显示加载进度条 |
| 用户上传美颜照片导致结果偏差 | 高 | Tips 中提示「建议未美颜照片」；免责声明覆盖 |
| 竞品 fork 代码去掉品牌自建站 | 中 | Apache 2.0 要求保留署名；原站 SEO 权重更高 |
| 负面口碑（「AI 乱说」） | 中 | 可视化证据 + 数字可验证 + 明确免责声明 |
| MediaPipe 未来 API 变更 | 低 | 持续维护的库，风险低；关注 Release Notes |
| 欧盟合规问题 | 低 | 已规划免责声明和透明度声明 |

---

## 15. 开发优先级

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| P0 | Face Analyzer 核心流程（上传→分析→结果） | 必须 |
| P0 | 关键点连线可视化动画 | 必须 |
| P0 | 手机端拍照入口 + 响应式布局 | 必须 |
| P0 | 英文 + 中文双语 | 必须 |
| P0 | 隐私声明 + 免责声明 | 必须 |
| P1 | 分享卡片（多风格自动匹配） | 重要 |
| P1 | 一键换肤纠错机制 | 重要 |
| P1 | Age Detector（`/age` 页） | 重要 |
| P1 | 两工具交叉导流 + 照片内存传递 | 重要 |
| P1 | GitHub 开源 + README | 重要 |
| P2 | 日文语言支持 | 次要 |
| P2 | FAQ SEO 内容完善 | 次要 |
| P2 | Product Hunt / Show HN 发布 | 次要 |

---

## 16. 关键决策记录

| 决策 | 结论 | 原因 |
|------|------|------|
| 域名 | facescorer.com | 直接关联面部分析，强于泛用域名 |
| 技术模型 | MediaPipe Face Landmarker | 持续维护，478关键点，手机优化，替代停更的 face-api.js |
| 页面结构 | 首页即 Face Analyzer，/age 为子页 | 主力关键词直接对应首页权重最高，省去设计首页导航成本 |
| 工具数量 | 只做 Face + Age | 其他方向（voice/hand）搜索意图验证后不符合，精简ROI最高 |
| 分享卡片风格 | 自动匹配+一键换肤，不让用户选 | 减少决策疲劳，保护分享冲动 |
| 评分展示 | 「前X%」而非裸分数 | 框架效应，同一数字更积极的呈现 |
| 分享卡片内容 | 只展示最高维度，不展示弱项 | 给每个用户找到值得炫耀的点 |
| 变现方式 | Google AdSense | 工具站标准路径，无需用户付费降低使用门槛 |
| 开源协议 | Apache 2.0 | 自由传播同时要求保留署名，被动外链积累 |
