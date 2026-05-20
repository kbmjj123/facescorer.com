# CardScan — 产品需求文档 (PRD)

**版本：** v1.2 MVP（无后端架构 + i18n）
**日期：** 2026-05-09
**作者：** 独立开发者
**产品定位：** 展会/会议后的批量名片数字化 Web 工具
**核心价值：** 把一叠名片变成一张表格，5 分钟搞定
**架构特点：** 纯前端，无服务器，数据不离开用户设备

---

## 目录

1. [产品概述](#1-产品概述)
2. [目标用户](#2-目标用户)
3. [用户痛点与需求](#3-用户痛点与需求)
4. [竞品分析](#4-竞品分析)
5. [产品范围（MVP）](#5-产品范围-mvp)
6. [功能详细需求](#6-功能详细需求)
7. [技术架构](#7-技术架构)（含 7.7 国际化规范）
8. [界面与交互规范](#8-界面与交互规范)
9. [数据字段规范](#9-数据字段规范)
10. [定价方案](#10-定价方案)
11. [SEO 与关键词策略](#11-seo-与关键词策略)
12. [上线计划](#12-上线计划)
13. [成功指标](#13-成功指标)
14. [后续版本规划](#14-后续版本规划)
15. [附录](#15-附录)

---

## 1. 产品概述

### 1.1 产品名称
**CardScan**（域名候选：`cardscan.io` / `batchscan.app`）

### 1.2 一句话描述
上传多张名片图片，AI 在你的浏览器里直接识别所有字段，一键导出 Excel / CSV / vCard，无需注册，无需上传服务器，隐私 100% 保护。

### 1.3 架构核心原则

> **所有计算在用户浏览器本地完成，图片和数据永远不离开用户设备。**

这既是最强的隐私卖点，也是零服务器成本的技术基础。

### 1.4 技术栈总览

```
前端框架：Nuxt.js 3 (SSG 静态生成)
UI：Tailwind CSS
国际化：@nuxtjs/i18n — 支持 en（默认）/ zh 双语
推理引擎：ONNX Runtime Web（WebAssembly 后端）
模型文件：DB + CRNN（从 opencv_zoo 转换，托管在 Cloudflare CDN）
部署：Cloudflare Pages（免费，全球 CDN）
支付：Lemon Squeezy（Payment Links，无需后端）
额度控制：localStorage
```

### 1.5 核心差异化

| 竞品 | 痛点 | CardScan 的解法 |
|------|------|----------------|
| CamCard、ABBYY | 只能一张一张处理 | 批量上传，队列并行识别 |
| 所有现有工具 | 图片上传到服务器，有隐私风险 | 纯本地推理，图片不离开设备 |
| 大厂 OCR API | 按调用量收费，成本不可控 | 本地推理，零边际成本 |
| App 类工具 | 需要下载安装 | Web 即开即用，手机扫码可用 |

---

## 2. 目标用户

### 2.1 主要用户（核心付费群体）
**会展型销售 / BD 人员**
- 场景：参加行业展会、峰会、招商会，单次收到 20–100 张名片
- 痛点：展会结束后需要在 1–2 天内整理完，否则跟进断链
- 设备：**手机拍照 → 手机或电脑处理**（移动端是重要入口）
- 付费意愿：高（时间成本敏感）

### 2.2 次要用户
**日常拜访型销售**（地产 / 保险 / To B SaaS）
- 每周 5–15 张名片，需要持续录入 CRM
- 订阅制的主要来源

**隐私敏感型用户**
- 处理商业机密联系人，不愿意上传到第三方服务器
- 「本地识别」是主要购买理由

### 2.3 非目标用户（MVP 阶段不考虑）
- 需要名片打印服务的用户
- 需要电子名片生成的用户
- 企业级私有化部署（v3 再考虑）

---

## 3. 用户痛点与需求

### 3.1 三层痛点模型

```
第一层（显性）：手动录入太慢、太麻烦
第二层（隐性）：录完之后跟进断链，不知道在哪认识的
第三层（焦虑）：上传到第三方平台担心联系人数据泄露
                ↑ 纯前端架构直接消灭了这层焦虑
```

### 3.2 用户核心需求优先级

| 优先级 | 需求 | 来源依据 |
|--------|------|----------|
| P0 | 批量上传多张图片 | Reddit：「不是一张一张处理」 |
| P0 | 字段识别准确（姓名 ≠ 公司） | Reddit：CamCard/Covve 的核心吐槽 |
| P0 | 导出 Excel/CSV | Google 搜索下拉：scanner to excel 高频 |
| P0 | 导出 vCard | Apple 生态用户标准需求 |
| P0 | 手机端可用（响应式） | 展会场景用手机拍完直接处理 |
| P1 | 识别结果可手动修正 | 准确率不可能 100%，编辑是必须的 |
| P1 | 本地处理隐私承诺 | 差异化卖点，落地页核心文案 |
| P2 | 一张图多名片自动分割 | 技术复杂，v2 核心卖点 |
| P2 | 展会场景标签 | 增加黏性，v2 实现 |
| P3 | CRM 直接 API 集成 | 需要后端，v3 实现 |

---

## 4. 竞品分析

### 4.1 直接竞品

| 产品 | 类型 | 优势 | 弱点 |
|------|------|------|------|
| CamCard | App | 知名度高 | 识别字段分类差，需上传服务器 |
| ABBYY Business Card Reader | iOS App | 识别准确 | 只有 App，无 Web，需登录 |
| Covve | App | 联系人管理 | 识别质量一般 |
| Nexio | Web+App | 批量处理较好 | 功能复杂，数据上传到服务器 |

### 4.2 核心结论
**「本地识别 + Web 端 + 批量处理」三者同时具备的工具，市场上目前不存在。**

---

## 5. 产品范围（MVP）

### 5.1 MVP 包含

```
✅ 多张图片批量上传（最多 20 张/次）
✅ 浏览器本地 ONNX 推理（图片不上传服务器）
✅ AI 自动识别名片字段（DB + CRNN 双模型）
✅ 识别进度实时展示（每张卡片独立状态）
✅ 识别结果手动编辑（inline edit）
✅ 导出 CSV（UTF-8 BOM，兼容 Excel）
✅ 导出 vCard（.vcf）
✅ 导出 Excel（.xlsx，付费功能）
✅ 响应式设计，手机端完整可用
✅ 手机相机直接调用（capture="environment"）
✅ 免费额度：每月 20 张（localStorage 控制）
✅ 付费：Lemon Squeezy Payment Links
✅ 隐私承诺展示（本地处理说明）
✅ SEO 优化落地页
```

### 5.2 MVP 不包含（明确排除）

```
❌ 后端服务器（零服务器架构）
❌ 用户账号注册系统
❌ 一张图多名片自动分割（v2）
❌ 展会标签功能（v2）
❌ CRM 直接 API 集成（v3）
❌ 名片打印/制作（永不做）
❌ 手写笔记识别（技术风险过高）
❌ WebGPU 加速（v2，等浏览器兼容度提升）
```

---

## 6. 功能详细需求

### 6.1 模型加载模块

**功能描述：**
页面首次加载时，从 Cloudflare CDN 下载 ONNX 模型文件到浏览器，后续识别全程离线运行。

**加载流程：**
```
页面加载
→ 检查 IndexedDB 是否已缓存模型
→ 已缓存：直接从 IndexedDB 读取（0 网络请求）
→ 未缓存：从 CDN 下载 → 存入 IndexedDB → 初始化 ONNX Runtime
→ 显示「已就绪」状态，解锁上传区
```

**模型文件大小（需在 CDN 上托管）：**
| 模型 | 文件 | 大小 |
|------|------|------|
| DB（文字检测） | `text_detection_db.onnx` | ~17MB |
| CRNN-CN（中英文识别） | `text_recognition_crnn_ch.onnx` | ~10MB |

**加载状态展示：**
- 首次访问：页面顶部显示进度条「正在加载 AI 模型 (27MB)…」
- 加载完成：进度条消失，上传区变为可用状态
- 后续访问：模型从 IndexedDB 读取，加载时间 < 1 秒，用户无感知
- 加载失败：提示「模型加载失败，请检查网络后刷新」

**性能预期：**
- 首次加载：4G 网络约 10–20 秒，WiFi 约 5–10 秒
- 后续访问：< 1 秒（从 IndexedDB 读取）
- 这是纯前端方案唯一的 UX 代价，通过缓存机制将影响降到最低

---

### 6.2 上传模块

**功能描述：**
用户可以通过拖拽、点击或手机相机拍摄上传多张名片图片。

**详细需求：**
- 支持格式：JPG、PNG、HEIC、WEBP
- 单张图片大小限制：10MB（本地处理，无服务器带宽限制）
- 单次上传数量：免费 ≤ 5 张/次，付费 ≤ 20 张/次
- 上传方式：
  - 桌面端：拖拽 / 点击选择（支持多选）
  - 手机端：点击后弹出「拍照」或「从相册选择」选项
  - 手机相机：`<input accept="image/*" capture="environment">` 直接调用后置摄像头

**上传后交互：**
- 显示缩略图网格预览
- 每张图片右上角有删除按钮
- 显示当前批次总张数
- 点击「开始识别」按钮触发识别流程（不自动识别，避免用户误触）

**边界情况处理：**
- 超出数量限制：弹出 Lemon Squeezy 付费引导
- 图片格式不支持：toast 提示「不支持该格式，请使用 JPG 或 PNG」
- 图片尺寸过小（< 200px）：提示「图片太小，识别效果可能较差」

---

### 6.3 识别模块（浏览器本地推理）

**功能描述：**
使用 ONNX Runtime Web 在浏览器中运行 DB + CRNN 模型，完整推理流程在本地完成。

**推理流程（JavaScript 实现）：**
```
图片文件
→ 图像预处理
  ├── Canvas 解码图片
  ├── 旋转矫正（检测图片 EXIF orientation）
  ├── 尺寸归一化（DB 模型输入：640×640）
  └── 像素值归一化（均值/标准差）
→ DB 模型推理（文字区域检测）
  └── 输出：文字区域的二值化热图 → 解码为多边形框
→ 按文字框裁剪子图
→ CRNN 模型推理（逐框识别文字内容）
  └── 输出：文字字符串列表
→ NLP 规则引擎（字段分类）
  └── 输出：结构化 JSON
```

**识别队列控制：**
- 多张图片顺序处理（串行队列），避免同时多个 ONNX Session 占用内存过多
- 每张处理完立即显示结果卡片，不等待全部完成
- 用户可以在识别进行中就开始编辑已完成的卡片

**NLP 字段分类规则：**
```javascript
// 手机号：中国大陆 / 国际格式
phone: /^(\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3,4}[-\s]?\d{4}$/

// 邮箱
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 网址
website: /^(https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,}/i

// 职位关键词库（200+ 词）
titleKeywords: ['CEO','CTO','CFO','总监','经理','主任',
  'Manager','Director','VP','President','Sales','Engineer',...]

// 公司后缀识别
companyPatterns: ['有限公司','Co., Ltd','Inc.','LLC','Corp.',
  'Group','集团','科技','网络',...]

// 姓名：排除以上规则后，最短的中文词/英文名
// 中文姓名：2–4 个汉字
// 英文姓名：匹配 [A-Z][a-z]+ [A-Z][a-z]+ 格式
```

**性能预期（WebAssembly 后端）：**
| 设备 | 单张识别时间 |
|------|-------------|
| 桌面端（M1/Intel i5+） | 2–4 秒 |
| 中端手机（iPhone 12 / 骁龙 888） | 4–8 秒 |
| 低端手机（骁龙 660 及以下） | 8–15 秒 |

**用户感知优化：**
- 每张卡片显示独立进度动画（skeleton + 转圈）
- 识别完一张立即展示，无需等待全部完成
- 估算剩余时间显示：「还有约 X 秒」

---

### 6.4 结果展示与编辑模块

**功能描述：**
识别完成后，以卡片列表形式展示结果，用户可直接 inline 编辑任意字段。

**结果卡片结构：**
```
┌────────────────────────────────────────┐
│ [名片缩略图 60×40]  ✓ 识别完成         │
│                                        │
│ 姓名   [张三          ]                │
│ 公司   [XX科技有限公司 ]                │
│ 职位   [销售总监       ]                │
│ 手机   [138-0000-0000  ]                │
│ 邮箱   [zhang@xx.com   ]                │
│ 网址   [www.xx.com     ]                │
│ 备注   [              ]  ← 用户自填    │
│                          [删除此卡片]  │
└────────────────────────────────────────┘
```

**置信度视觉提示：**
- 置信度 ≥ 80%：字段正常显示
- 置信度 50–80%：字段输入框显示黄色边框 + tooltip「建议确认」
- 置信度 < 50%：字段输入框显示红色边框 + tooltip「识别不确定」

**编辑交互：**
- 点击任意字段值 → 进入编辑模式（input 获焦）
- 失焦或按 Enter → 退出编辑，自动保存到 Pinia store
- 所有修改实时保存到 localStorage（防止刷新丢失）
- 支持 Tab 键在字段间快速切换

**批量操作栏：**
```
[ ☑ 全选 (5/5) ]  [ 取消全选 ]  [ 删除已选 ]
[ 导出 CSV ]  [ 导出 vCard ]  [ 导出 Excel 🔒付费 ]
```

---

### 6.5 导出模块（纯前端实现）

所有导出在浏览器内生成文件，通过 `URL.createObjectURL` + `<a>` 触发下载，无需服务器。

**CSV 导出：**
```javascript
// 使用 Papa Parse 或手写
// 编码：UTF-8 with BOM（Windows Excel 兼容）
const BOM = '\uFEFF'
const headers = 'First Name,Last Name,Company,Job Title,Phone,Email,Website,Notes'
const rows = cards.map(c => [
  c.firstName, c.lastName, c.company,
  c.title, c.phone, c.email, c.website, c.notes
].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
const csv = BOM + [headers, ...rows].join('\n')
downloadFile(csv, 'text/csv', `cardscan_${date}.csv`)
```

**vCard 导出：**
```javascript
// vCard 3.0 标准
// 多张名片合并为单个 .vcf 文件
const vcards = cards.map(c => `BEGIN:VCARD
VERSION:3.0
FN:${c.name}
N:${c.lastName};${c.firstName};;;
ORG:${c.company}
TITLE:${c.title}
TEL;TYPE=CELL:${c.phone}
EMAIL:${c.email}
URL:${c.website}
END:VCARD`).join('\n')
downloadFile(vcards, 'text/vcard', `cardscan_${date}.vcf`)
```

**Excel 导出（付费功能，使用 SheetJS）：**
```javascript
import * as XLSX from 'xlsx'
const ws = XLSX.utils.json_to_sheet(cards)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Contacts')
XLSX.writeFile(wb, `cardscan_${date}.xlsx`)
```

**库依赖：**
- CSV：原生实现，无需库
- vCard：原生实现，无需库
- Excel：SheetJS（`xlsx` npm 包，约 800KB）

---

### 6.6 付费与额度控制模块

**免费额度控制（纯 localStorage）：**
```javascript
// key: cardscan_usage
// value: { month: '2026-05', count: 3 }

function checkQuota(newCards) {
  const usage = getUsage()          // 读 localStorage
  const currentMonth = getMonth()   // '2026-05'
  if (usage.month !== currentMonth) resetUsage()  // 月初重置
  if (usage.count + newCards > FREE_LIMIT) {
    showUpgradeModal()
    return false
  }
  return true
}
```

**注意事项：**
- localStorage 可被用户清空绕过限制 → MVP 阶段接受，重度用户会主动付费
- 不做服务端额度验证（无后端），MVP 阶段信任用户
- v2 可引入 Cloudflare Workers 做轻量服务端验证

**付费引导弹窗触发时机：**
- 上传超出免费限制时
- 点击「导出 Excel」时（付费功能）
- 页面固定位置的「升级」按钮

**付费流程（Lemon Squeezy）：**
```
用户点击付费按钮
→ 跳转到 Lemon Squeezy 托管的结账页面
→ 完成付款
→ 跳转回 cardscan.io?payment=success
→ 前端读取 URL 参数，存入 localStorage
  { plan: 'one-time' | 'monthly', expiry: timestamp }
→ 解锁付费功能
```

**安全说明：** localStorage 的付费状态可被伪造，MVP 阶段接受。v2 可用 Cloudflare Workers + JWT 做轻量验证。

---

## 7. 技术架构

### 7.1 整体架构（零后端）

```
用户设备（浏览器）
├── Nuxt.js 3 SSG 静态页面
│   ├── 上传 UI
│   ├── 结果编辑 UI
│   └── 导出功能（纯 JS）
│
├── ONNX Runtime Web（WebAssembly）
│   ├── DB 模型（文字检测）
│   └── CRNN-CN 模型（文字识别）
│
└── 本地存储
    ├── IndexedDB（缓存模型文件，~27MB）
    ├── localStorage（使用额度 + 付费状态）
    └── Pinia Store（当前会话识别结果）

Cloudflare Pages（静态托管）
└── 托管 HTML/CSS/JS + ONNX 模型文件

Lemon Squeezy（第三方支付）
└── 托管结账页面，处理支付

无服务器 ✓  无数据库 ✓  无 API ✓
```

### 7.2 技术选型与理由

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| 前端框架 | Nuxt.js 3 (SSG) | Vue 生态，SSG 对 SEO 友好，静态输出直接部署 Cloudflare |
| UI | Tailwind CSS | 无需配置，响应式工具类，与 Nuxt 完美集成 |
| 组件库 | shadcn-vue（可选） | 按需引入，不增加不必要体积 |
| 国际化 | @nuxtjs/i18n v9 | Nuxt 3 官方模块，懒加载语言包，SSG 多语言路由，SEO hreflang 自动生成 |
| 推理引擎 | ONNX Runtime Web | 官方 WebAssembly 支持，`onnxruntime-web` npm 包 |
| 状态管理 | Pinia | Nuxt 3 官方推荐 |
| Excel 导出 | SheetJS (xlsx) | 纯前端 Excel 生成，成熟稳定 |
| 图像处理 | Canvas API | 原生，无需额外库 |
| 模型缓存 | IndexedDB (idb-keyval) | 轻量封装，缓存大文件 |
| 部署 | Cloudflare Pages | 免费，全球 CDN，自动 HTTPS，Git 推送自动部署 |
| 支付 | Lemon Squeezy | 专为独立开发者，无需后端，支持订阅和一次性付费 |

### 7.3 Nuxt.js 项目结构

```
cardscan/
├── nuxt.config.ts              # Nuxt 配置，SSG 模式
├── tailwind.config.ts
├── package.json
│
├── public/
│   └── models/                 # ONNX 模型文件（部署到 Cloudflare）
│       ├── text_detection_db.onnx        (~17MB)
│       └── text_recognition_crnn_ch.onnx (~10MB)
│
├── assets/
│   └── css/
│       └── main.css
│
├── components/
│   ├── UploadZone.vue          # 拖拽上传区
│   ├── CardResult.vue          # 单张名片结果卡片
│   ├── ResultList.vue          # 结果列表容器
│   ├── ExportBar.vue           # 导出操作栏
│   ├── UpgradeModal.vue        # 付费引导弹窗
│   ├── ModelLoader.vue         # 模型加载进度
│   └── PrivacyBadge.vue        # 「本地处理」隐私标识
│
├── composables/
│   ├── useOnnxModel.ts         # ONNX Runtime 模型加载与推理
│   ├── useCardScanner.ts       # 识别主流程编排
│   ├── useExport.ts            # CSV/vCard/Excel 导出
│   ├── useQuota.ts             # 免费额度控制
│   └── useModelCache.ts        # IndexedDB 模型缓存
│
├── stores/
│   └── cards.ts                # Pinia store：识别结果状态
│
├── i18n/
│   ├── en.json                 # 英文翻译（默认语言，source of truth）
│   └── zh.json                 # 中文翻译
│
├── utils/
│   ├── imagePreprocess.ts      # 图像预处理（Canvas）
│   ├── dbDecode.ts             # DB 模型输出解码
│   ├── crnnDecode.ts           # CRNN CTC 解码
│   └── fieldClassifier.ts      # NLP 字段分类规则引擎
│
└── pages/
    ├── index.vue               # 主工具页（落地页 + 工具合一）
    ├── pricing.vue             # 定价页
    ├── privacy.vue             # 隐私政策
    └── terms.vue               # 服务条款
```

### 7.4 ONNX Runtime Web 集成要点

```typescript
// composables/useOnnxModel.ts
import * as ort from 'onnxruntime-web'

// 关键配置：指定 WASM 文件路径
ort.env.wasm.wasmPaths = '/ort-wasm/'  // 需要将 WASM 文件放到 public 目录

export async function loadModels() {
  const dbSession = await ort.InferenceSession.create(
    '/models/text_detection_db.onnx',
    { executionProviders: ['wasm'] }
  )
  const crnnSession = await ort.InferenceSession.create(
    '/models/text_recognition_crnn_ch.onnx',
    { executionProviders: ['wasm'] }
  )
  return { dbSession, crnnSession }
}
```

**重要配置细节：**
- WASM 文件（`ort-wasm.wasm` 等）需要放入 `public/ort-wasm/` 目录
- Cloudflare Pages 需要配置 MIME type：`application/wasm` for `.wasm` 文件
- 模型文件通过 Cloudflare CDN 分发，利用边缘缓存加速下载

### 7.5 Nuxt.js 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // SSG 静态生成，部署到 Cloudflare Pages
  nitro: {
    preset: 'cloudflare-pages'
  },

  // 关闭 SSR（工具页无需服务端渲染）
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  // i18n 配置
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'zh', language: 'zh-CN', file: 'zh.json', name: '中文' },
    ],
    defaultLocale: 'en',
    lazy: true,           // 懒加载语言包，不影响首屏体积
    langDir: 'i18n/',
    strategy: 'prefix_except_default',
    // URL 策略：
    //   英文（默认）：cardscan.io/
    //   中文：       cardscan.io/zh/
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'cardscan_locale',
      redirectOn: 'root',   // 仅在根路径自动跳转
      fallbackLocale: 'en',
    },
  },

  // ONNX Runtime Web 需要的 WASM 头
  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }
    }
  },

  // 构建优化：SheetJS 按需加载
  build: {
    transpile: ['xlsx']
  },

  app: {
    head: {
      title: 'CardScan - Scan Business Cards in Bulk',
      meta: [
        { name: 'description', content: 'Upload multiple business cards. AI extracts contacts locally in your browser. Export to Excel, CSV, vCard. Free, no signup, 100% private.' }
      ]
    }
  }
})
```

**重要：COOP/COEP Headers**

ONNX Runtime Web 的 WebAssembly 多线程模式需要开启 `SharedArrayBuffer`，而这需要设置：
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

在 Cloudflare Pages 中通过 `_headers` 文件配置：
```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### 7.6 Cloudflare Pages 部署配置

```
# 构建配置
Build command:    npm run generate
Output directory: .output/public
Node version:     18

# 自定义域名
cardscan.io → Cloudflare Pages
```

```
# public/_headers（WASM + ONNX 所需 HTTP 头）
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin

/models/*
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/octet-stream

/*.wasm
  Content-Type: application/wasm
  Cache-Control: public, max-age=31536000, immutable
```

```
# public/_redirects（SPA fallback）
/* /index.html 200
```

---

### 7.7 国际化（i18n）规范

#### 语言范围

| 语言代码 | 语言 | URL 前缀 | 用途 |
|----------|------|----------|------|
| `en` | English | 无（默认） | 主市场，SEO 英文关键词 |
| `zh` | 中文（简体） | `/zh/` | 中国大陆 + 海外华人用户 |

#### 翻译文件结构（`i18n/en.json` / `i18n/zh.json`）

```
i18n/
├── en.json    ← 英文，source of truth，先写这个
└── zh.json    ← 中文，与 en.json 保持 key 完全一致
```

Key 命名规范：`{模块}.{元素}.{变体?}`

```json
// i18n/en.json（节选）
{
  "meta": {
    "title": "CardScan — Scan Business Cards in Bulk",
    "description": "Upload multiple business cards. AI extracts contacts locally..."
  },
  "nav": {
    "features": "Features",
    "pricing": "Pricing",
    "upgrade": "Upgrade Pro",
    "lang_toggle": "中文"
  },
  "hero": {
    "title": "Scan business cards in bulk.",
    "title_highlight": "Export to Excel in seconds.",
    "subtitle": "Upload up to 20 cards — AI runs in your browser, 100% private.",
    "privacy_badge": "🔒 Local Processing — No uploads, no servers"
  },
  "upload": {
    "hint": "Drag & drop images here, or",
    "hint_mobile": "Tap to photograph or select images",
    "btn_camera": "📷 Use Camera",
    "btn_files": "Choose Files",
    "btn_start": "Start Recognizing ({count})",
    "quota": "Free: {used} / {limit} cards used this month"
  },
  "card": {
    "field": {
      "name": "Name", "company": "Company", "title": "Job Title",
      "phone": "Phone", "email": "Email", "website": "Website",
      "address": "Address", "notes": "Notes"
    },
    "status": {
      "pending": "Waiting…",
      "processing": "Recognizing (~{seconds}s)…",
      "done": "Done",
      "error": "Failed — tap to retry"
    }
  },
  "export": {
    "csv": "Export CSV",
    "vcf": "Export vCard",
    "excel": "Export Excel",
    "excel_locked": "Export Excel 🔒",
    "confirm": "Export {count} contacts to {format}?"
  },
  "modal": {
    "upgrade": {
      "title": "Unlock unlimited scanning",
      "one_time": "$4.9 · 100 cards one-time",
      "monthly": "$9 / month · Unlimited",
      "yearly": "$79 / year · Best value",
      "dismiss": "Maybe later"
    }
  },
  "common": {
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading…",
    "autosaved": "Autosaved"
  }
}
```

```json
// i18n/zh.json（节选，key 与 en.json 完全一致）
{
  "meta": {
    "title": "CardScan — 批量扫描名片，一键导出 Excel",
    "description": "批量上传名片图片，AI 在浏览器本地识别，导出 Excel/CSV/vCard，免费无需注册。"
  },
  "nav": {
    "features": "功能",
    "pricing": "定价",
    "upgrade": "升级 Pro",
    "lang_toggle": "English"
  },
  "hero": {
    "title": "批量扫描名片，",
    "title_highlight": "几秒钟导出 Excel。",
    "subtitle": "一次最多上传 20 张，AI 在你的浏览器里本地识别，数据不离开设备。",
    "privacy_badge": "🔒 本地处理 — 不上传服务器，完全隐私"
  },
  "upload": {
    "hint": "拖拽名片图片到此处，或",
    "hint_mobile": "点击拍照或从相册选择",
    "btn_camera": "📷 拍照",
    "btn_files": "选择文件",
    "btn_start": "开始识别（{count} 张）",
    "quota": "免费额度：本月已用 {used} / {limit} 张"
  },
  "card": {
    "field": {
      "name": "姓名", "company": "公司", "title": "职位",
      "phone": "手机", "email": "邮箱", "website": "网址",
      "address": "地址", "notes": "备注"
    },
    "status": {
      "pending": "等待中…",
      "processing": "识别中（约 {seconds} 秒）…",
      "done": "完成",
      "error": "识别失败，点击重试"
    }
  },
  "export": {
    "csv": "导出 CSV",
    "vcf": "导出 vCard",
    "excel": "导出 Excel",
    "excel_locked": "导出 Excel 🔒",
    "confirm": "将 {count} 条联系人导出为 {format}？"
  },
  "modal": {
    "upgrade": {
      "title": "解锁无限识别次数",
      "one_time": "¥35 · 100 张一次性套餐",
      "monthly": "¥65 / 月 · 无限次",
      "yearly": "¥560 / 年 · 最划算",
      "dismiss": "稍后再说"
    }
  },
  "common": {
    "cancel": "取消",
    "delete": "删除",
    "loading": "加载中…",
    "autosaved": "已自动保存"
  }
}
```

#### 在组件中使用

```vue
<script setup lang="ts">
const { t, locale } = useI18n()

// SEO：每个页面的 meta 随语言自动切换
useHead({ title: t('meta.title') })
useSeoMeta({ description: t('meta.description') })
</script>

<template>
  <!-- 静态文字 -->
  <h1>{{ $t('hero.title') }}</h1>

  <!-- 带插值的文字 -->
  <p>{{ $t('upload.quota', { used: 3, limit: 20 }) }}</p>

  <!-- 语言切换按钮 -->
  <NuxtLink :to="switchLocalePath(locale === 'en' ? 'zh' : 'en')">
    {{ $t('nav.lang_toggle') }}
  </NuxtLink>
</template>
```

#### SEO 多语言处理

`@nuxtjs/i18n` 在 SSG 模式下自动为每个页面生成：
- `<link rel="alternate" hreflang="en" href="https://cardscan.io/" />`
- `<link rel="alternate" hreflang="zh" href="https://cardscan.io/zh/" />`
- `<link rel="alternate" hreflang="x-default" href="https://cardscan.io/" />`

无需手动配置，模块自动注入。

#### 注意事项

- **定价数字双语分开维护**：英文显示 `$4.9 / $9 / $79`，中文显示 `¥35 / ¥65 / ¥560`（汇率换算后取整），在 `zh.json` 的 `modal.upgrade` 中单独写
- **新增任何 UI 文字时，必须同时更新 `en.json` 和 `zh.json`**，不允许只更新一个
- **不能在模板中出现硬编码字符串**，ESLint 规则 `i18n/no-raw-text` 开启检查

---

## 8. 界面与交互规范

### 8.1 页面结构

```
/          ← 主工具页（英文，默认）
/zh/       ← 主工具页（中文）
/pricing   ← 定价页（英文）
/zh/pricing← 定价页（中文）
/privacy   ← 隐私政策
/terms     ← 服务条款
```

> `@nuxtjs/i18n` SSG 模式会自动为每个页面生成对应的 `/zh/*` 静态文件，无需手动创建中文版页面。

### 8.2 主页面布局（桌面端）

```
[导航栏] Logo | 功能介绍 | 定价 | [升级 Pro]

[模型加载提示]（首次访问时显示）
⟳ 正在加载 AI 模型 (27MB)... ████████░░ 80%

[Hero 区]
  H1: Scan business cards in bulk.
      Export to Excel in seconds.
  副标题: Upload up to 20 cards at once — AI extracts all contact info
          right in your browser. Your data never leaves your device.
  [隐私标识] 🔒 100% Local Processing — No uploads, no servers

[上传区]
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   📎  Drag & drop business card images      │
  │       or click to select (up to 5 free)     │
  │                                             │
  │   [📷 Use Camera]    [🖼 Choose Files]       │
  └─────────────────────────────────────────────┘
  已用额度：Free: 3 / 20 cards used this month  [Upgrade →]

[结果区]（上传后出现）
  [ ☑ Select All ]  [Export CSV]  [Export vCard]  [Export Excel 🔒]
  [卡片列表...]

[产品特性区]（SEO）
  批量处理 | 本地 AI | 隐私安全 | 多格式导出

[FAQ 区]（SEO 长尾词）

[页脚]
```

### 8.3 移动端布局调整

- 导航栏：Logo + 汉堡菜单（隐藏其他链接）
- Hero 区：单列，文字缩小
- 上传区：「Use Camera」按钮置顶，更大点击区域
- 结果卡片：全宽单列，字段标签在上，值在下
- 导出按钮：固定在底部 safe area，始终可见

```
[底部固定操作栏（手机端）]
[Export CSV]  [vCard]  [Excel 🔒]
```

### 8.4 识别状态展示

```
等待中：  [ 🖼 缩略图 ] ────────── 等待中...
识别中：  [ 🖼 缩略图 ] ⟳ 识别中 (约 5 秒)...
完成：    [ 🖼 缩略图 ] ✓ 张三 · XX科技 · 销售总监
失败：    [ 🖼 缩略图 ] ✗ 识别失败 [重试]
```

### 8.5 关键 UX 细节

- **模型首次加载时间较长**：提前在 Hero 区解释「AI 运行在您的浏览器中，首次需要下载模型，之后即时识别」，将等待时间转化为卖点
- **识别中不锁屏**：用户可以在识别进行中浏览已完成的卡片
- **编辑自动保存**：右下角显示「已自动保存」提示 1 秒后消失
- **导出前预览**：点击导出按钮后先显示「将导出 X 条联系人」确认弹窗

---

## 9. 数据字段规范

### 9.1 标准字段

| 字段名 | Key | 说明 |
|--------|-----|------|
| 姓名 | `name` | 全名，同时尝试拆分 firstName/lastName |
| 名 | `firstName` | 拆分结果，英文取第一词，中文取后 1–2 字 |
| 姓 | `lastName` | 拆分结果，英文取最后词，中文取第 1 字 |
| 公司 | `company` | |
| 职位 | `title` | |
| 手机 | `phone` | 保留原始格式（含国际区号） |
| 邮箱 | `email` | 转小写 |
| 网址 | `website` | |
| 地址 | `address` | 可为空 |
| 备注 | `notes` | 用户手填 |

### 9.2 CSV 列头（兼容主流 CRM 格式）

```
First Name,Last Name,Company,Job Title,Phone,Email,Website,Address,Notes
```

HubSpot / Salesforce / Pipedrive 均支持此格式直接导入。

### 9.3 Pinia Store 数据结构

```typescript
// stores/cards.ts
interface CardResult {
  id: string
  thumbnailUrl: string      // blob URL，页面关闭后失效
  status: 'pending' | 'processing' | 'done' | 'error'
  confidence: number        // 0–1，整体置信度
  fields: {
    name: string
    firstName: string
    lastName: string
    company: string
    title: string
    phone: string
    email: string
    website: string
    address: string
    notes: string
  }
  fieldConfidence: Record<string, number>  // 各字段置信度
  edited: boolean           // 用户是否手动编辑过
}
```

---

## 10. 定价方案

### 10.1 方案设计

| 方案 | 价格 | 额度 | 功能 | Lemon Squeezy 类型 |
|------|------|------|------|--------------------|
| 免费 | $0 | 20 张/月 | CSV + vCard 导出 | 无需购买 |
| 按次包 | $4.9 | 100 张（永不过期） | CSV + vCard + Excel | 一次性付款 |
| 月订阅 | $9/月 | 无限次 | 全部功能 + 优先处理 | 订阅 |
| 年订阅 | $79/年 | 无限次 | 全部功能 | 订阅 |

### 10.2 Lemon Squeezy 集成

**无需后端的集成方式：**
1. 在 Lemon Squeezy 后台创建产品和结账链接
2. 设置支付成功后的跳转 URL：`https://cardscan.io?payment=success&plan=one-time&token=xxx`
3. 前端读取 URL 参数，验证后写入 localStorage
4. Lemon Squeezy Webhook（可选，v2 用 Cloudflare Workers 接收）

```javascript
// pages/index.vue：处理支付回调
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success') {
    const plan = params.get('plan')
    activatePlan(plan)  // 写入 localStorage
    showSuccessToast('🎉 升级成功！')
    // 清理 URL 参数
    router.replace({ query: {} })
  }
})
```

### 10.3 定价页面要点

- 「按次包」放在最显眼的位置（转化率最高的入口）
- 强调「无需信用卡，免费开始」
- 隐私承诺在定价页也要重复出现

---

## 11. SEO 与关键词策略

### 11.1 目标关键词

| 类型 | 关键词 | 月搜索量 | 竞争度 | 落地位置 |
|------|--------|----------|--------|----------|
| 主词 | scan business cards | 1K–10K | 中 | H1 主标题 |
| 主词 | business card scanner | 10K–100K | 高 | Meta Title |
| 机会词 | business card OCR | ~1.2K | 低 ⭐ | H2、功能描述 |
| 机会词 | batch scan business cards | <1K | 极低 ⭐⭐ | H2、特性区 |
| 长尾词 | scan business cards to excel | 1K–5K | 低 | FAQ |
| 长尾词 | business card scanner to outlook | 可见 | 低 | FAQ |
| 长尾词 | business card reader for google sheets | 可见 | 低 | FAQ |

### 11.2 Meta 信息

```html
<title>Scan Business Cards in Bulk | Export to Excel & CSV — CardScan</title>
<meta name="description"
  content="Upload multiple business cards at once. AI extracts name, phone, email, company in your browser — 100% private, no uploads. Export to Excel, CSV, or vCard. Free, no signup.">
```

### 11.3 FAQ 内容（植入长尾词，用 Nuxt Content 或硬编码）

1. How do I scan business cards to Excel?
2. Can I scan multiple business cards at once?
3. Is my data safe when scanning business cards online?
4. How to export business cards to Outlook contacts?
5. How to import scanned business cards into Google Sheets?
6. How to scan business cards to HubSpot CRM?
7. What is the best batch business card scanner without an app?
8. Does CardScan work on iPhone and Android?

### 11.4 结构化数据（Schema.org）

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CardScan",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Batch business card scanner. Runs in your browser, no uploads required."
}
```

---

## 12. 上线计划

### 12.1 MVP 开发计划（目标：14 天上线）

```
Day 1   环境搭建
        ├── Nuxt 3 项目初始化（SSG 模式）
        ├── Tailwind CSS 配置
        ├── 安装 @nuxtjs/i18n，创建 i18n/en.json + i18n/zh.json 骨架
        ├── Cloudflare Pages 连接 GitHub，自动部署
        └── 域名解析到 Cloudflare Pages

Day 2   ONNX 集成验证
        ├── 安装 onnxruntime-web
        ├── 从 opencv_zoo 下载 DB + CRNN ONNX 模型
        ├── 放入 public/models/ 目录
        ├── 配置 COOP/COEP Headers（_headers 文件）
        └── Hello World：加载模型 + 跑通单张图片推理

Day 3   图像预处理模块
        ├── Canvas 解码图片
        ├── EXIF 旋转矫正
        ├── 尺寸归一化（DB 模型 640×640 输入）
        └── 像素归一化（均值/标准差）

Day 4   DB 模型推理 + 解码
        ├── 推理：图片 → 热图
        ├── 热图二值化
        ├── 轮廓检测 → 文字区域多边形
        └── 按多边形裁剪子图

Day 5   CRNN 模型推理 + CTC 解码
        ├── 子图归一化（32×W 输入）
        ├── CRNN 推理
        ├── CTC greedy decoder
        └── 输出文字字符串列表

Day 6   NLP 字段分类规则引擎
        ├── 正则匹配：手机 / 邮箱 / 网址
        ├── 关键词库：职位 / 公司后缀
        ├── 姓名启发式识别
        └── 单元测试：20 个样本名片验证准确率

Day 7–8 前端 UI 核心组件
        ├── UploadZone.vue（拖拽 + 多选 + 手机相机）
        ├── ModelLoader.vue（首次加载进度）
        ├── CardResult.vue（结果卡片 + inline 编辑）
        └── ExportBar.vue（导出按钮组）

Day 9   Pinia Store + 识别流程串联
        ├── cards store 定义
        ├── useCardScanner composable（上传 → 识别 → 更新 store）
        ├── IndexedDB 模型缓存（useModelCache composable）
        └── 完整流程联调

Day 10  导出功能
        ├── CSV 导出（UTF-8 BOM）
        ├── vCard 3.0 导出
        └── Excel 导出（SheetJS）

Day 11  响应式移动端适配
        ├── 上传区手机布局调整
        ├── 结果卡片单列布局
        ├── 底部固定导出操作栏
        └── 手机上真机测试

Day 12  付费集成
        ├── Lemon Squeezy 后台创建产品和结账链接
        ├── useQuota composable（localStorage 额度控制）
        ├── UpgradeModal.vue（付费引导弹窗）
        └── 支付成功回调处理

Day 13  测试 + SEO + i18n 验证
        ├── 20 张不同风格名片识别测试（中英文、深浅色、横竖版）
        ├── 移动端全机型测试（iOS Safari / Android Chrome）
        ├── 导出文件验证（Excel 实际打开 + vCard 导入通讯录）
        ├── 中英文切换测试：所有页面文字正确显示，无遗漏 key
        ├── /zh/ 路由正常访问，hreflang 标签自动生成验证
        ├── 浏览器语言为中文时自动跳转 /zh/ 验证
        ├── Meta 信息（中英文各自独立 title/description）
        ├── Schema.org 结构化数据
        └── Lighthouse SEO 检查（EN + ZH 两个版本都跑一遍）

Day 14  上线
        ├── 域名正式绑定
        ├── Lemon Squeezy 生产环境测试（真实扣款验证）
        ├── r/sales、r/entrepreneur 发帖（招募测试用户）
        └── ProductHunt 提交准备
```

### 12.2 已知技术风险与应对

| 风险 | 概率 | 应对方案 |
|------|------|----------|
| COOP/COEP Headers 在某些浏览器导致资源加载失败 | 中 | 先测试 WASM 单线程模式（不需要 SharedArrayBuffer），性能降低但兼容性好 |
| 低端手机识别速度 > 15 秒，用户体验差 | 中 | 显示详细进度 + 告知原因，v2 考虑 WebGPU |
| ONNX 模型浏览器端输出与 Python 端不一致 | 低 | Day 2 的 Hello World 阶段必须验证输出一致性 |
| HEIC 格式在非 Safari 浏览器无法解码 | 高 | 使用 `heic2any` 库在前端转换，或提示用户转为 JPG |
| SheetJS 包体积较大（800KB） | 低 | 动态 import，仅付费用户触发导出时才加载 |

---

## 13. 成功指标

### 13.1 上线第一个月目标

| 指标 | 目标 |
|------|------|
| 独立访客 | 500 UV |
| 识别总张数 | 1,000 张 |
| 付费转化率 | ≥ 3% |
| 第一笔收入 | $49（10 个按次包） |
| 识别准确率 | ≥ 85%（用户编辑率间接衡量） |
| 导出率 | ≥ 70%（上传后成功导出的比例） |

### 13.2 关键健康指标

- **模型加载成功率**：首次加载是最大流失点，目标 > 95%
- **识别完成率**：识别过程中页面关闭率，目标 < 20%
- **导出率**：最重要的产品成功指标，< 70% 说明产品失败
- **付费触发转化率**：哪个弹窗位置转化最高（A/B 测试 v2 做）

---

## 14. 后续版本规划

### v2（上线后 1 个月）

```
[ ] 一张图多名片自动分割（YOLOX 检测 → 切割 → 逐张识别）
[ ] WebGPU 加速（移动端速度从 8 秒降到 2 秒）
[ ] 展会标签（给每批名片打「XX展会·2026年3月」标签）
[ ] Cloudflare Workers 做轻量付费验证（替换纯 localStorage）
[ ] 用户账号系统（保存历史记录）
[ ] HubSpot / Pipedrive CSV 格式兼容导出
```

### v3（上线后 3–6 个月）

```
[ ] 跟进提醒（识别完后设置「3天后提醒」）
[ ] Chrome 插件版
[ ] 团队共享名片库
[ ] HubSpot / Salesforce OAuth 直接导入
```

---

## 15. 附录

### A. ONNX 模型信息

| 模型 | 来源 | ONNX 文件 | 大小 | 许可证 |
|------|------|-----------|------|--------|
| DB | opencv_zoo | `text_detection_db_ic15_resnet18_2021sep.onnx` | ~17MB | Apache 2.0 |
| CRNN-CN | opencv_zoo | `text_recognition_CRNN_CH_2021sep.onnx` | ~10MB | Apache 2.0 |

从 opencv_zoo 下载命令：
```bash
git clone https://github.com/opencv/opencv_zoo
cd opencv_zoo
git lfs pull --include="models/text_detection_db/*.onnx"
git lfs pull --include="models/text_recognition_crnn/*.onnx"
```

### B. ONNX Runtime Web WASM 文件处理

安装后需将 WASM 文件复制到 public 目录：
```bash
# package.json scripts
"postinstall": "cp node_modules/onnxruntime-web/dist/*.wasm public/ort-wasm/"
```

需要复制的文件：
- `ort-wasm.wasm`
- `ort-wasm-simd.wasm`
- `ort-wasm-threaded.wasm`
- `ort-wasm-simd-threaded.wasm`

### C. 关键参考链接

- opencv_zoo：https://github.com/opencv/opencv_zoo
- ONNX Runtime Web 文档：https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- Nuxt 3 Cloudflare Pages 部署：https://nuxt.com/deploy/cloudflare
- Lemon Squeezy 文档：https://docs.lemonsqueezy.com
- SheetJS 文档：https://sheetjs.com
- idb-keyval（IndexedDB 工具库）：https://github.com/jakearchibald/idb-keyval

### D. 测试名片数据准备

1. Canva 设计 20 张不同风格名片：横版/竖版、深色/浅色、中文/英文/中英混排
2. GitHub 搜索 `business card dataset` 获取公开测试数据
3. Reddit beta 测试招募文案：
   > "Built a browser-based business card scanner — your photos never leave your device. Looking for 10 beta testers to try it with real cards. Free lifetime Pro access in return. Comment below!"

---

*文档版本：v1.2 | 架构：纯前端 / 无服务器 / 双语 i18n | 状态：待开发*
*上次修改：2026-05-09 | 下次评审：MVP 上线后*
