# Superdata RobotAI — Code Wiki

> 本文档为 `embodiedai-datasets` 仓库的完整代码百科，覆盖项目整体架构、模块职责、关键类与函数、依赖关系、运行方式，并在末尾给出优化方向与商业模式建议。
>
> - 线上站点：[superdata-robotai.com](https://superdata-robotai.com)
> - 仓库：[locusinger159/embodiedai-datasets](https://github.com/locusinger159/embodiedai-datasets)
> - 当前版本：v2.13（2026-06-22）

---

## 目录

1. [项目概览](#1-项目概览)
2. [整体架构](#2-整体架构)
3. [目录结构](#3-目录结构)
4. [主要模块职责](#4-主要模块职责)
5. [关键类与函数说明](#5-关键类与函数说明)
6. [数据模型与 Schema](#6-数据模型与-schema)
7. [依赖关系](#7-依赖关系)
8. [项目运行方式](#8-项目运行方式)
9. [部署与 CI/CD](#9-部署与-cicd)
10. [优化方向](#10-优化方向)
11. [商业模式建议](#11-商业模式建议)

---

## 1. 项目概览

### 1.1 定位

**Superdata RobotAI** 是一个专注「具身智能 / 人形机器人 / 机械臂 / 移动机器人」领域的**数据集情报导航站**。它不托管任何数据集下载，只做三件事：

1. **信息汇总**：收录全球数据集、数据标准、工具平台、Benchmark 排行榜、学术论文；
2. **申请导航**：提供官方链接、论文链接、GitHub/HuggingFace 入口；
3. **智能推荐**：通过 AI 语义搜索 + 反向推荐向导，帮助算法研发者快速找到合适的数据集。

### 1.2 核心数据指标（v2.13）

| 维度 | 数量 |
|------|------|
| 数据集 | 94 |
| 数据标准 / 评测基准 | 23 |
| 工具 / 平台 | 18 |
| Benchmark 排行榜 | 6（LIBERO / EmbodiedBench / CALVIN / RLBench / SimplerEnv / FurnitureBench） |
| Benchmark 论文数据 | 61 条 |
| AI 论文知识库 | 137 篇全文嵌入 |
| 覆盖机构 | 72 |
| 机器人类型 | 8 大类 |
| 任务类型 | 18 种 |
| VLA 框架兼容标注 | 7 大（π0 / OpenVLA / GR00T N1 / Octo / RT-2 / RDT-1B / ACT） |

### 1.3 技术栈特征

- **构建**：Node.js 原生脚本，**零 npm 依赖**（仅 `package.json` 中保留 `vitepress` 作为旧版兼容）
- **前端**：纯 HTML + CSS + 原生 JavaScript，**无任何前端框架**
- **搜索后端**：阿里云函数计算 FC + 百炼 `text-embedding-v4`（2048 维）+ DeepSeek V4 Flash
- **评论**：giscus（基于 GitHub Discussions）
- **托管**：GitHub Pages + 自定义域名 `superdata-robotai.com`
- **字体**：Google Fonts — Noto Sans SC + Inter

### 1.4 许可证

- **数据**（`docs/data/*.json`）：CC BY-NC-SA 4.0（署名-非商业-相同方式共享）
- **代码**（`build.cjs` / `scripts/` / `src/`）：AGPL-3.0（Copyleft，衍生作品必须开源）
- **数据集本身**：版权归原机构 / 作者所有，本站不托管下载

---

## 2. 整体架构

### 2.1 架构分层

项目采用「**数据驱动 + 静态构建 + 边缘 AI**」的三层架构：

```
┌─────────────────────────────────────────────────────────────┐
│                     数据层 (docs/data/)                       │
│   datasets.json | standards.json | tools.json | blog.json   │
│   *.en.json (英文镜像)                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ 读取
┌────────────────────────▼────────────────────────────────────┐
│              构建层 (build.cjs, 零依赖)                       │
│   1. 读取 partials (head/navbar/footer/search-widget)        │
│   2. 读取数据 JSON                                           │
│   3. 模板替换 {{HEAD}} {{NAVBAR}} {{FOOTER}} {{...}}         │
│   4. 输出中英双语静态 HTML 到 dist/                          │
└────────────────────────┬────────────────────────────────────┘
                         │ 产物
┌────────────────────────▼────────────────────────────────────┐
│              展示层 (dist/, GitHub Pages)                     │
│   纯静态 HTML/CSS/JS，无运行时依赖                            │
│   - 数据集列表 / 详情 / 对比 / 反向推荐                       │
│   - 标准列表 / 详情 / 规范性要求                              │
│   - 工具列表 / 详情 / 教程                                   │
│   - Benchmark 排行榜                                        │
│   - 博客 / RSS                                              │
│   - 数据格式全景图 / 标准草案                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch
┌────────────────────────▼────────────────────────────────────┐
│          AI 服务层 (fc/index.js, 阿里云 FC)                   │
│   /api/search    — 语义搜索（embedding + 关键词加权）         │
│   /api/assistant — LLM 对话助手（检索结果注入 system prompt） │
│   依赖：百炼 embedding + DeepSeek V4 Flash + 预计算向量索引   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户浏览器
   │
   ├──① 浏览静态页面（GitHub Pages CDN 分发）
   │
   ├──② 点击右下角 🔍 按钮 → POST /api/search
   │        ↓
   │    fc/index.js 接收 query
   │        ↓
   │    调用百炼 text-embedding-v4 把 query 转向量
   │        ↓
   │    与 fc/embeddings.json 中预计算的 94+23+18 条向量做余弦相似度
   │        ↓
   │    关键词加权（robotType/task/modality 命中加分，上限 +20）
   │        ↓
   │    返回 Top 5 数据集 + Top 3 标准 + Top 5 工具 + Top 8 论文
   │
   └──③ 点击 💬 AI 助手 → POST /api/assistant
            ↓
        同上检索 + 把 Top 8 结果注入 system prompt
            ↓
        调用 DeepSeek V4 Flash 生成结构化推荐
            ↓
        返回 { reply, sources: [{id,name,score,link}] }
```

### 2.3 构建产物分布

```
dist/                           # 中文站根
├── index.html                  # 首页
├── datasets/                   # 数据集列表 + 94 个详情页
├── standards/                  # 标准列表 + 23 个详情页
├── benchmarks/                 # 6 个排行榜
├── tools/                      # 工具列表 + 18 个详情页
├── recommend/                  # 反向推荐向导
├── blog/                       # 博客列表 + 7 篇详情
├── formats/                    # 数据格式全景图
├── standard-proposal/          # 标准草案
├── submit/                     # 提交页
├── rss.xml                     # RSS 订阅
├── embeddings.json             # 预计算向量索引（供前端潜在使用）
├── .nojekyll                   # 禁用 Jekyll
└── en/                         # 英文站镜像（结构同上）
```

---

## 3. 目录结构

```
embodiedai-datasets/
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions：构建 + 校验 + 部署 gh-pages
├── docs/
│   ├── .vitepress/                 # VitePress 旧版残留（已弃用，保留兼容）
│   ├── data/                       # ★ 核心数据源
│   │   ├── datasets.json           # 94 个数据集（中文）
│   │   ├── datasets.en.json        # 英文镜像
│   │   ├── standards.json          # 23 个标准 / 评测基准
│   │   ├── standards.en.json
│   │   ├── tools.json              # 18 个工具 / 平台
│   │   ├── tools.en.json
│   │   └── blog.json               # 7 篇博客
│   ├── datasets/index.md           # VitePress 旧版入口（已弃用）
│   ├── public/                     # 静态资源（CNAME、Logo PNG）
│   └── superpowers/                # 迭代设计文档
│       ├── plans/                  # 实施计划
│       └── specs/                  # 设计规格
├── fc/                             # ★ 阿里云函数计算后端
│   ├── index.js                    # HTTP 服务（搜索 + LLM 助手）
│   ├── package.json
│   ├── embeddings.json             # 数据集/标准/工具的预计算向量
│   ├── embeddings_papers.json      # 137 篇论文的向量索引
│   └── papers_text.json            # 论文 PDF 抽取后的文本块
├── scripts/                        # ★ 数据治理工具链
│   ├── embed.cjs                   # 生成 embeddings.json
│   ├── embed-papers.cjs            # 生成 embeddings_papers.json
│   ├── extract-papers.py           # 从 PDF 抽文本并分块
│   ├── validate.cjs                # 数据校验（6 大检查项 + 可选链接健康）
│   └── scan-fiction-risk.py        # AI 虚构数据风险扫描
├── src/
│   ├── partials/                   # ★ HTML 片段（构建时注入）
│   │   ├── head.html               # 全局 <head> + CSS 变量 + 响应式样式
│   │   ├── navbar.html / navbar-en.html
│   │   ├── footer.html / footer-en.html
│   │   └── search-widget.html      # 右下角浮动 AI 搜索组件
│   └── pages/                      # ★ 页面模板
│       ├── index.html              # 首页
│       ├── datasets.html           # 数据集列表（侧边栏筛选 + 对比）
│       ├── dataset-detail.html     # 数据集详情
│       ├── standards.html          # 标准列表
│       ├── standard-detail.html    # 标准详情（RFC 2119 要求）
│       ├── tools.html              # 工具列表
│       ├── tool-detail.html        # 工具详情
│       ├── benchmark.html          # 单个排行榜
│       ├── benchmarks-list.html    # 排行榜索引
│       ├── recommend.html          # 反向推荐向导
│       ├── blog.html / blog-detail.html
│       ├── formats.html            # 格式全景图
│       ├── standard-proposal.html  # 标准草案
│       └── submit.html             # 提交页
├── build.cjs                       # ★ 零依赖静态构建器
├── package.json                    # 仅声明 vitepress（旧版兼容）
├── LICENSE                         # CC BY-NC-SA 4.0 + AGPL-3.0
└── README.md                       # 项目说明 + 版本记录
```

---

## 4. 主要模块职责

### 4.1 构建器 `build.cjs`

**职责**：零依赖静态站点生成器（SSG）。读取数据 + 模板，输出中英双语静态 HTML。

**核心流程**：

1. 读取 `src/partials/` 下的 head / navbar / footer / search-widget 片段；
2. 读取 `docs/data/` 下的中英文 JSON 数据；
3. 对每个页面调用 `buildPage()`，执行 `{{KEY}}` → 值的字符串替换；
4. 为每个数据集 / 标准 / 工具 / 博客 / 排行榜生成独立详情页；
5. 拷贝静态资源到 `dist/`，输出构建统计。

**关键设计**：

- **i18n**：通过 `UI[lang]` 字典在构建时注入中英文字符串，无运行时翻译开销；
- **模板复用**：中英文共享 `src/pages/` 下的同一套模板，仅替换 `{{NAVBAR}}` / `{{FOOTER}}`；
- **相关推荐**：在构建期为每个数据集计算 5 维加权相似度（robotType×3 + task×2 + standards×5 + tags×1 + institution×3），取 Top 6 预渲染到详情页；
- **Schema 树渲染**：`buildSchemaTree()` 把 `"episode → step → observation / action"` 字符串解析为带缩进的 HTML 树。

### 4.2 AI 后端 `fc/index.js`

**职责**：阿里云函数计算上的 HTTP 服务，提供两个端点：

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/search` | POST | 语义搜索：query → embedding → 余弦相似度 + 关键词加权 → Top N |
| `/api/assistant` | POST | LLM 助手：检索 Top 8 → 注入 system prompt → DeepSeek 生成结构化推荐 |

**检索算法**：

```
finalScore = cosineSim(queryVec, itemVec) * 100
           + keywordBoost(item, extractedKeywords)   # 上限 +20
           + typeBonus                                # 论文 +10
```

关键词加权规则：
- 命中 `robotType` → +6 / 项
- 命中 `task` → +5 / 项
- 命中 `modality` → +3 / 项
- 总 boost 上限 20

**LLM 调用**：

- 模型：`deepseek-v4-flash`（默认，可通过 `DEEPSEEK_MODEL` 环境变量覆盖）
- `max_tokens=1200`，`temperature=0.3`，`max_input_tokens=16000`
- 历史对话：过滤 system 消息 + 仅保留最近 4 轮（防止 context overflow）

### 4.3 数据治理脚本 `scripts/`

| 脚本 | 语言 | 职责 |
|------|------|------|
| `embed.cjs` | Node.js | 调百炼 API 把 94 数据集 + 23 标准 + 18 工具转 2048 维向量，输出 `dist/embeddings.json` |
| `embed-papers.cjs` | Node.js | 把 `papers_text.json` 中的论文分块批量嵌入，输出 `fc/embeddings_papers.json` |
| `extract-papers.py` | Python | 用 PyMuPDF (`fitz`) 从 `papers/*.pdf` 抽文本，按 500 字分块（每篇最多 10 块），输出 `fc/papers_text.json` |
| `validate.cjs` | Node.js | 6 大校验：JSON 解析 / 必填字段 / 跨语言 ID 一致性 / 年份覆盖 / 受控词汇 / URL 格式；可选 `--links` 跑 HTTP HEAD 检查 |
| `scan-fiction-risk.py` | Python | 多维度打分（12 个风险因子）扫描 AI 虚构数据集，输出高/中/低风险报告 |

### 4.4 前端组件 `src/partials/search-widget.html`

**职责**：右下角浮动双按钮（💬 AI 助手 + 🔍 搜索）+ 右侧抽屉面板。

**特性**：

- 两个模式：`chat`（多轮对话，调 `/api/assistant`）和 `search`（单次检索，调 `/api/search`）；
- 快捷键：`Cmd/Ctrl + K` 打开搜索，`Esc` 关闭；
- 渲染：搜索模式按数据集 / 标准 / 工具分组展示；对话模式渲染 markdown 粗体 + 列表 + 引用来源 chip；
- 移动端：面板宽度自适应 100vw。

### 4.5 数据层 `docs/data/`

所有数据均为**手写 JSON**，无 ORM、无数据库。每条数据集条目含 20+ 字段（详见 [§6](#6-数据模型与-schema)）。

**数据治理流程**：

```
新增数据集 → 编辑 datasets.json → 跑 validate.cjs → 跑 scan-fiction-risk.py
         → 必要时跑 embed.cjs 重建向量 → 跑 build.cjs → git push 自动部署
```

---

## 5. 关键类与函数说明

> 本项目无 class 定义，全部为函数式 / 过程式代码。以下按文件分组列出关键函数。

### 5.1 `build.cjs`

| 函数 | 签名 | 职责 |
|------|------|------|
| `buildAll(lang)` | `(lang: 'zh'\|'en') => void` | 构建指定语言的全套页面，输出到 `dist/` 或 `dist/en/` |
| `buildPage(templateFile, replacements)` | `(string, Object) => string` | 读取模板，执行 `{{KEY}}` 替换，注入 search-widget |
| `buildDetailPage(ds)` | `(dataset) => string` | 构建单个数据集详情页（含 Schema 树、VLA badge、Benchmark、相关推荐） |
| `buildStandardDetail(ss)` | `(standard) => string` | 构建标准详情页（含 RFC 2119 规范性要求分组渲染） |
| `buildSchemaTree(schema)` | `(string) => string` | 把 `"a → b / c"` 解析为带缩进的 HTML 树 |
| `splitOutsideParens(text, sep)` | `(string, string) => string[]` | 在括号外分割字符串（处理 `（仿真）/ 真机` 这类情况） |
| `formatDescription(s)` | `(string) => string` | 描述文本转 HTML：自动链接 URL、`**bold**`、段落换行 |
| `getActiveNav(page)` | `(string) => string` | 返回当前页对应的导航高亮 HTML |
| `esc(s)` | `(string) => string` | HTML 转义（`& < > "`） |

### 5.2 `fc/index.js`

| 函数 | 签名 | 职责 |
|------|------|------|
| `cosineSim(a, b)` | `(number[], number[]) => number` | 余弦相似度计算 |
| `embedQuery(text, apiKey)` | `(string, string) => Promise<number[]>` | 调百炼 API 把 query 转 2048 维向量 |
| `extractKeywords(query)` | `(string) => {robotType, task, modality}` | 从 query 提取结构化关键词（基于词典匹配） |
| `keywordBoost(item, keywords)` | `(Object, Object) => number` | 关键词加权打分（上限 20） |
| `search(queryVec, query)` | `(number[], string) => Object` | 混合检索：embedding 相似度 + 关键词加权，返回 4 类 Top N |
| `assistant(query, history, apiKey, model)` | `(string, Array, string, string) => Promise<{reply, sources}>` | LLM 助手：检索 + 注入 context + 调 DeepSeek |

### 5.3 `scripts/validate.cjs`

| 函数 | 职责 |
|------|------|
| `checkRequired(entries, required, entityType)` | 检查每条记录的必填字段 |
| `checkUrlOnce(url, method)` | 单次 HTTP HEAD/GET 探测链接健康 |
| `checkUrl(url)` | 带重试 + 主机友好策略的链接检查 |
| `printSummary()` | 输出校验结果汇总（errors / warnings） |

### 5.4 `scripts/scan-fiction-risk.py`

| 逻辑块 | 职责 |
|--------|------|
| `RISK_WEIGHTS` 字典 | 12 个风险因子的权重（如 `no_official_link: 3`，`no_year: 3`） |
| `KNOWN_GOOD` 集合 | 已人工验证的合规数据集 ID，命中则减 5 分 |
| `VAGUE_SCALE_PATTERNS` | 模糊规模描述的正则列表（如 `^未知`、`^—$`） |
| 主循环 | 遍历数据集打分，按高（≥5）/ 中（3-4）/ 低（<3）输出报告 |

### 5.5 `src/partials/search-widget.html`（前端 JS）

| 函数 | 职责 |
|------|------|
| `open(m)` | 打开面板，`m` 为 `'chat'` 或 `'search'` |
| `renderSearch(data)` | 渲染搜索结果（按数据集 / 标准 / 工具分组） |
| `renderChatHistory()` | 渲染多轮对话历史 + 引用来源 chip |
| `simpleMarkdown(text)` | 轻量 markdown 渲染（粗体 / 列表 / 换行） |
| `doSubmit()` | 异步提交：根据 mode 调不同 API |

---

## 6. 数据模型与 Schema

### 6.1 数据集 `datasets.json`

```jsonc
{
  "id": "open-x-embodiment",          // 唯一 ID（URL slug）
  "name": "Open X-Embodiment",
  "institution": "Google DeepMind",
  "scale": "15 种机器人，100W+ 轨迹",
  "robotType": ["多机型"],             // 受控词汇，9 选 1+
  "task": ["操作"],                    // 受控词汇，18 选 1+
  "modality": ["视觉", "本体状态", "动作"],
  "tags": ["大规模", "RLDS", "跨具身"], // 自由标签
  "type": "open",                      // open | partial | apply | closed
  "links": {
    "official": "https://...",
    "paper": "https://arxiv.org/..."
  },
  "description": "Markdown 风格长描述",
  "license": "Apache 2.0",
  "year": 2024,
  "vlaCompatible": ["pi0", "openvla", "octo", "rt-2", "rdt-1b", "gr00t"],
  "quality": {
    "collection": "多源聚合",          // 遥操作采集 | 仿真生成 | 多源聚合
    "annotation": "部分人工标注",
    "realWorld": "100%真机",
    "hasSplit": true
  },
  "dataFormat": {
    "storage": "RLDS / TFDS",
    "size": "1TB+",
    "compression": "gzip",
    "schema": "episode → step → observation / action / reward / discount",
    "layout": "...",
    "index": "...",
    "format": "..."
  },
  "dataContent": {
    "sensors": ["RGB 相机", "深度相机", "关节编码器"],
    "scenes": "多场景",
    "objects": "数千种",
    "tasks": "数百种操作任务",
    "episodes": "1,000,000+",
    "annotations": ["自然语言指令", "动作序列", "奖励信号"]
  },
  "usage": {                           // 快速上手代码
    "load": "import tensorflow_datasets as tfds\n...",
    "deps": ["tensorflow-datasets", "tensorflow", "numpy"],
    "preprocess": "..."
  },
  "citation": {
    "bibtex": "@article{...}",
    "authors": "...",
    "year": 2024,
    "venue": "ICRA 2024"
  },
  "changelog": [
    { "date": "2023-10", "text": "首次发布" }
  ],
  "standards": ["rlds", "oxe-schema"], // 关联标准 ID
  "benchmarks": [                      // 该数据集训练的模型在 benchmark 上的得分
    {
      "benchmarkId": "libero",
      "suite": "LIBERO-Goal",
      "model": "OpenVLA",
      "modelSize": "7B",
      "score": 84.7,
      "unit": "%",
      "higherIsBetter": true,
      "paper": "https://arxiv.org/...",
      "paperTitle": "...",
      "conditions": "..."
    }
  ],
  "samples": [                         // 样例预览图
    { "thumb": "...", "url": "...", "caption": "..." }
  ],
  "github": "https://github.com/...",
  "huggingface": "https://huggingface.co/datasets/..."
}
```

### 6.2 标准 `standards.json`

```jsonc
{
  "id": "rlds",
  "name": "RLDS",
  "fullName": "Reinforcement Learning Datasets Standard",
  "org": "Google DeepMind",
  "type": "format",                    // format | benchmark | industry | closed
  "openness": "open",                  // open | partial | standard | closed
  "scene": ["real", "sim"],
  "modalities": ["RGB", "Proprioception", "Action"],
  "license": "Apache 2.0",
  "desc": "Markdown 长描述",
  "links": { "site": "...", "github": "...", "paper": "..." },
  "year": 2023,
  "datasetIds": ["open-x-embodiment", ...], // 反向关联数据集
  "datasetCount": 15,
  "requirements": [                    // RFC 2119 规范性要求
    {
      "level": "must",                 // must | should | may
      "category": "Schema 结构",
      "text": "数据必须以 episode 为最外层组织单元",
      "detail": "..."
    }
  ],
  "benchmarkMeta": {                   // 仅当 type=benchmark 时存在
    "metric": "成功率",
    "metricEn": "Success Rate",
    "unit": "%",
    "higherIsBetter": true,
    "rankBy": "dataset"                // dataset | model
  }
}
```

### 6.3 工具 `tools.json`

```jsonc
{
  "id": "robosuite",
  "name": "RoboSuite",
  "institution": "UC Berkeley",
  "toolType": "仿真器",                // 仿真器 | 物理引擎 | 训练框架 | 可视化 | 触觉模拟
  "type": "open",
  "links": { "official": "...", "paper": "..." },
  "description": "...",
  "license": "MIT",
  "tutorial": {
    "quickstart": "pip install robosuite\n...",
    "deps": ["mujoco", "numpy"],
    "links": [{ "name": "官方文档", "url": "..." }]
  },
  "citation": { "year": 2020, "venue": "arXiv", "authors": "..." },
  "github": "..."
}
```

### 6.4 博客 `blog.json`

```jsonc
{
  "id": "qwen-robot-series",
  "title": "...",
  "titleEn": "...",
  "date": "2026-06-16",
  "tags": ["Qwen-Robot", "VLA", ...],
  "tagsEn": [...],
  "summary": "...",
  "summaryEn": "...",
  "contentHtml": "<p>...</p>",        // 直接存 HTML
  "contentHtmlEn": "<p>...</p>",
  "author": "Superdata RobotAI"
}
```

### 6.5 受控词汇表（摘自 `validate.cjs`）

| 字段 | 合法值 |
|------|--------|
| `robotType` | 人形机器人 / 机械臂 / 移动机器人 / 四足机器人 / 多机型 / 触觉传感 / 仿真 / 灵巧手 / 通用 |
| `task` | 操作 / 抓取 / 导航 / 装配 / 家居 / 交互 / 运动控制 / 可供性分割 / 3D运动预测 / 接触点预测 / 人机交互 / 物体交互 / 3D场景理解 / 语义分割 / 语言推理 / 康养护理 / 人类操作 / 动作捕捉 |
| `type` | open / partial / apply / closed |
| `toolType` | 仿真器 / 物理引擎 / 训练框架 / 可视化 / 触觉模拟 |
| `vlaCompatible` | pi0 / openvla / gr00t / octo / rt-2 / rdt-1b / act |

---

## 7. 依赖关系

### 7.1 运行时依赖

**前端**：**零依赖**。纯 HTML + CSS + 原生 JS，仅通过 CDN 加载 Google Fonts。

**后端 `fc/index.js`**：**零 npm 依赖**。仅用 Node.js 内置 `http` 模块 + 全局 `fetch`（Node 18+）。

### 7.2 构建时依赖

**`build.cjs`**：**零依赖**。仅用 Node.js 内置 `fs` / `path`。

**`scripts/`**：

| 脚本 | 依赖 |
|------|------|
| `embed.cjs` | Node 18+ 内置 `fetch`，无 npm 依赖 |
| `embed-papers.cjs` | Node 内置 `https` |
| `extract-papers.py` | Python 3 + `fitz`（PyMuPDF） |
| `validate.cjs` | Node 内置 `http` / `https` |
| `scan-fiction-risk.py` | Python 3 标准库 |

### 7.3 外部服务依赖

| 服务 | 用途 | 密钥环境变量 |
|------|------|-------------|
| 阿里云百炼（DashScope） | `text-embedding-v4` 向量化 | `DASHSCOPE_API_KEY` |
| DeepSeek API | LLM 对话生成 | `DEEPSEEK_API_KEY` |
| 阿里云函数计算 FC | 托管 `fc/index.js` | 部署侧配置 |
| GitHub Pages | 静态站点托管 | `GITHUB_TOKEN`（CI 用） |
| giscus | 评论系统 | 无需密钥，基于 GitHub Discussions |
| Google Fonts | 字体 CDN | 无 |

### 7.4 `package.json` 中的 `vitepress`

`devDependencies` 中保留了 `vitepress: ^1.3.0`，但 `build.cjs` 已完全取代 VitePress。保留原因：

1. `scripts.dev` 仍指向 `vitepress dev docs`（用于旧版调试）；
2. `docs/.vitepress/` 目录残留（含旧主题组件）；
3. 历史兼容，避免破坏外部链接。

实际生产构建走 `node build.cjs`，**不依赖 vitepress**。

---

## 8. 项目运行方式

### 8.1 环境要求

- **Node.js** ≥ 18（构建 + FC 后端，需原生 `fetch`）
- **Python** ≥ 3.8（仅论文抽取和虚构扫描脚本需要）
- **可选**：PyMuPDF（`pip install pymupdf`）用于论文 PDF 抽取

### 8.2 本地构建

```bash
# 1. 克隆
git clone https://github.com/locusinger159/embodiedai-datasets.git
cd embodiedai-datasets

# 2. 构建静态站点（零依赖，无需 npm install）
node build.cjs

# 3. 本地预览
npx serve dist
# 或
python3 -m http.server 8000 --directory dist
```

构建产物输出到 `dist/`，包含中文站（根）和英文站（`dist/en/`）。

### 8.3 数据校验

```bash
# 基础校验（JSON / 必填字段 / 跨语言一致性 / 受控词汇 / URL 格式）
node scripts/validate.cjs

# 含链接健康检查（HTTP HEAD/GET，约 30s）
node scripts/validate.cjs --links

# AI 虚构风险扫描
python3 scripts/scan-fiction-risk.py
```

### 8.4 重建向量索引

当数据集 / 标准 / 工具数据变更后，需重建嵌入：

```bash
# 数据集/标准/工具的向量
DASHSCOPE_API_KEY=your_key node scripts/embed.cjs
# 输出：dist/embeddings.json

# 论文向量（需先跑 extract-papers.py 生成 papers_text.json）
DASHSCOPE_API_KEY=your_key node scripts/embed-papers.cjs
# 输出：fc/embeddings_papers.json
```

### 8.5 本地启动 AI 搜索后端

```bash
cd fc

# 配置密钥
export DASHSCOPE_API_KEY=your_bailian_key
export DEEPSEEK_API_KEY=your_deepseek_key
# 可选：export DEEPSEEK_MODEL=deepseek-v4-flash

# 启动（端口 9000）
node index.js
```

前端 `search-widget.html` 中硬编码了线上 FC 地址 `https://superdaa-search-kuccdqlnpa.cn-hangzhou.fcapp.run`。本地调试时需替换为 `http://localhost:9000`。

### 8.6 论文知识库构建

```bash
# 1. 将 PDF 放入 papers/datasets/ 或 papers/standards/ 或 papers/tools/
# 2. 抽取文本并分块
python3 scripts/extract-papers.py
# 输出：fc/papers_text.json

# 3. 生成嵌入
DASHSCOPE_API_KEY=your_key node scripts/embed-papers.cjs
# 输出：fc/embeddings_papers.json
```

### 8.7 npm scripts

```jsonc
{
  "dev": "vitepress dev docs",          // 旧版 VitePress 调试（已弃用）
  "build": "node build.cjs",            // ★ 生产构建
  "preview": "npx serve dist",          // 预览构建产物
  "build:v1": "vitepress build docs",   // 旧版构建
  "preview:v1": "vitepress preview docs"
}
```

---

## 9. 部署与 CI/CD

### 9.1 GitHub Actions 工作流 `.github/workflows/deploy.yml`

**触发**：push 到 `main` 分支 或 手动 `workflow_dispatch`。

**步骤**：

1. **Checkout** 代码；
2. **Setup Node 20**；
3. **Build**：`node build.cjs`；
4. **Validate**：
   - 检查无未解析的 `{{KEY}}` 模板变量；
   - 检查关键页面 `<div>` 标签平衡；
   - 检查数据集数量 ≥ 50、工具数量 ≥ 10；
5. **Deploy**：`cd dist && git init && git push -f HEAD:gh-pages`。

### 9.2 域名与托管

- **域名**：`superdata-robotai.com`（`docs/public/CNAME`）
- **托管**：GitHub Pages，从 `gh-pages` 分支提供
- **HTTPS**：GitHub Pages 自动签发 Let's Encrypt 证书
- **CDN**：GitHub Pages 自带全球 CDN

### 9.3 阿里云 FC 部署

`fc/index.js` 部署为阿里云函数计算 Web 函数，HTTP 触发器地址：

```
https://superdaa-search-kuccdqlnpa.cn-hangzhou.fcapp.run
```

环境变量配置：`DASHSCOPE_API_KEY`、`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`（可选）。

---

## 10. 优化方向

### 10.1 架构层面

#### 10.1.1 构建器可维护性

**现状**：`build.cjs` 单文件 1200+ 行，包含 i18n 字典、所有页面构建逻辑、Schema 树渲染、相关推荐算法。

**建议**：

- 拆分为 `build/` 目录：`build/i18n.js`、`build/pages/dataset.js`、`build/pages/standard.js`、`build/utils.js`（esc / formatDescription / buildSchemaTree）；
- 将 i18n 字典抽到独立 JSON 文件 `build/i18n/zh.json` / `en.json`，便于非开发者贡献翻译；
- 引入简单的模板引擎（如 mustache 风格的 50 行实现），替代 `String.replace` + `RegExp`，支持条件渲染和循环，减少详情页构建函数中的字符串拼接。

#### 10.1.2 数据层演进

**现状**：手写 JSON，无 schema 校验文件，跨语言同步靠人工。

**建议**：

- 引入 JSON Schema（`schemas/dataset.schema.json`），在 `validate.cjs` 中用 `ajv` 做严格校验；
- 中英文数据合并为单文件 + `i18n` 字段（如 `{ "name": { "zh": "...", "en": "..." } }`），消除双文件同步问题；
- 考虑迁移到 TypeScript + 单一数据源，构建时生成中英双 JSON。

#### 10.1.3 前端交互

**现状**：每个列表页（datasets / standards / tools）内嵌大段原生 JS，逻辑重复。

**建议**：

- 抽取公共 `filter.js`（侧边栏筛选 + 分页 + 视图切换），三个列表页复用；
- 引入 Web Components 或极轻量框架（如 Preact 3KB）管理状态，减少 DOM 操作；
- 数据集对比功能可升级为持久化（localStorage），支持跨会话保留选中的数据集。

### 10.2 性能层面

#### 10.2.1 构建产物体积

**现状**：94 个数据集详情页 × 平均 30KB = ~2.8MB，加上英文版共 ~6MB。

**建议**：

- 详情页的 `DATASETS_JSON` 只在列表页注入，详情页改为构建时静态渲染（已部分实现），但相关推荐可进一步精简；
- 启用 HTML 压缩（`html-minifier-terser`），预计减少 15-20% 体积；
- CSS 抽取为外部文件（当前内联在 `head.html`），利用浏览器缓存，预计首屏减少 30KB × 页面数。

#### 10.2.2 搜索后端冷启动

**现状**：阿里云 FC 冷启动时需加载 `embeddings.json`（~300KB）+ `embeddings_papers.json`（数 MB），首次请求可能 2-5s。

**建议**：

- 把向量索引改为按需加载（lazy load papers）；
- 引入 FC 预留实例（reserved instance）消除冷启动；
- 长期可迁移到向量数据库（如 Milvus / Pinecone / 阿里云 OpenSearch 向量检索），支持 Top-K 加速。

#### 10.2.3 嵌入模型升级

**现状**：百炼 `text-embedding-v4` 2048 维，73 条实体向量约 300KB。

**建议**：

- 评估 `bge-m3` 或 `Qwen3-Embedding-8B`（开源），可本地部署降成本；
- 对论文知识库（137 篇 × 10 chunk = 152 条）考虑量化到 int8，体积减少 75%。

### 10.3 数据治理层面

#### 10.3.1 自动化校验闭环

**现状**：`validate.cjs` 和 `scan-fiction-risk.py` 需手动运行，CI 只检查模板渲染和数量。

**建议**：

- 将 `validate.cjs` 和 `scan-fiction-risk.py` 接入 GitHub Actions，PR 必须通过才能合并；
- 高风险条目（score ≥ 5）自动创建 Issue 提醒人工复核；
- 引入 `linkinator` 或类似工具每周定时扫描死链，自动开 Issue。

#### 10.3.2 数据贡献流程

**现状**：提交数据集靠邮件或 PR 手动编辑 JSON。

**建议**：

- 提供 Web 表单提交（`/submit/` 页面扩展），后端用 GitHub Actions 自动生成 PR；
- 表单内置 schema 校验，避免缺字段；
- 贡献者提交后自动跑虚构风险扫描，反馈评分。

### 10.4 用户体验层面

#### 10.4.1 搜索体验

**现状**：搜索结果按 4 类分组，无跨类排序；LLM 助手仅返回文本 + sources。

**建议**：

- 搜索结果支持统一排序 + 类别筛选 tab；
- 引入查询意图识别（如「对比」「推荐」「下载」），不同意图走不同检索策略；
- LLM 助手支持流式输出（SSE），减少首字等待；
- 增加搜索历史 + 收藏夹（localStorage）。

#### 10.4.2 移动端

**现状**：响应式已实现，但侧边栏筛选在移动端折叠为顶部 2 列网格。

**建议**：

- 移动端改为抽屉式筛选（点击按钮从左滑出）；
- 详情页表格在窄屏改为卡片堆叠；
- 增加底部导航栏（首页 / 数据集 / 推荐 / 搜索）。

#### 10.4.3 SEO

**现状**：每个详情页有独立 `<title>` 和 `<meta description>`，但无结构化数据。

**建议**：

- 注入 JSON-LD（`Dataset` schema），让 Google 识别为数据集富媒体结果；
- 生成 `sitemap.xml`，提交 Google Search Console；
- 增加 Open Graph + Twitter Card 元标签，社交分享有预览图。

### 10.5 安全层面

#### 10.5.1 API 密钥

**现状**：FC 后端通过环境变量读取密钥，安全。但 `search-widget.html` 中硬编码了 FC 地址，可能被滥用。

**建议**：

- FC 端增加 Referer / Origin 白名单校验；
- 引入简单速率限制（如每 IP 每分钟 30 次）；
- 考虑 API Key 机制（前端带 key，FC 校验）。

#### 10.5.2 XSS 防护

**现状**：`esc()` 函数转义用户输入，但博客 `contentHtml` 直接注入 HTML（信任作者）。

**建议**：

- 博客内容引入 DOMPurify 在构建时清洗；
- 评论系统 giscus 已隔离，无风险。

---

## 11. 商业模式建议

### 11.1 当前定位分析

项目当前是**纯公益开源项目**，许可证为 CC BY-NC-SA 4.0（数据）+ AGPL-3.0（代码），明确禁止商业使用。这形成了：

**优势**：
- 数据集质量高（94 条人工精选 + 虚构扫描）
- 已建立专家品牌（v2.13，3 个月迭代 13 版）
- 独家内容壁垒：137 篇论文知识库、6 个 Benchmark 排行榜、VLA 兼容性标注
- AI 搜索 + 反向推荐形成差异化

**约束**：
- 非商业许可证限制了直接变现
- 无用户系统，无法沉淀私域流量
- 数据集本身版权属于原机构，不能转售

### 11.2 商业化路径

基于项目在 `docs/superpowers/specs/` 中已表达的「**从目录 → 分析平台 → 标准化 → 工具链**」愿景，建议分三阶段商业化：

#### 阶段一：影响力变现（0-6 个月）

**目标**：在不违反 NC 许可的前提下，通过内容影响力变现。

| 渠道 | 形式 | 预期 |
|------|------|------|
| 技术博客 | 深度测评文章（如 GR-1 测评、Qwen-Robot 解析）接受赞助 | 单篇 5K-2W |
| 企业专访 | 数据集发布方 / 机器人公司付费专访 | 单篇 1-3W |
| 行业报告 | 季度《具身智能数据集行业报告》PDF，邮件订阅 | 199-599/份 |
| 线下沙龙 | 「具身智能数据集」主题闭门会，企业赞助 | 单场 5-10W |
| Newsletter | 付费订阅周报（新增数据集 + 行业动态 + 深度分析） | 99/月 |

**关键动作**：
- 把博客从 7 篇扩展到每周 1-2 篇，引入外部作者；
- 建立邮件列表（当前只有 RSS）；
- 在站点增加「赞助伙伴」位（非广告，类似开源项目 sponsor）。

#### 阶段二：B 端增值服务（6-18 个月）

**目标**：基于数据集分析积累，向 B 端提供付费增值服务。

**产品 1：企业数据集选型咨询**

- 企业场景：机器人公司需要选数据集训练 VLA，但不知道哪些合适；
- 服务：基于站内 94 数据集 + 反向推荐引擎，提供定制化选型报告；
- 定价：5-20W / 项目，含数据集对比、成本估算、合规风险分析。

**产品 2：数据集合规审计**

- 企业场景：使用某数据集前需确认许可证、商用限制、隐私合规；
- 服务：基于站内 license 字段 + 法律知识，输出合规报告；
- 定价：1-5W / 数据集。

**产品 3：Benchmark 评测服务**

- 企业场景：模型公司想在 6 个 benchmark 上评测，但环境搭建复杂；
- 服务：提供托管评测环境，输出排行榜可提交的成绩；
- 定价：按评测次数，2K-1W / 次。

**产品 4：企业版 API**

- 把 `/api/search` 和 `/api/assistant` 包装为付费 API；
- 企业可集成到自己内部系统；
- 定价：999/月（1万次调用）起。

**关键动作**：
- 上线企业版 landing page（`/enterprise/`）；
- 建立销售线索收集（免费试用 → 商机转化）；
- 与 3-5 家头部机器人公司建立 pilot。

#### 阶段三：标准化 + 工具链（18-36 个月）

**目标**：项目文档中明确提到的「**标准被采纳后，开发数据生产工具链、标准数据定制等商业化产品**」。

**产品 1：具身智能数据格式标准认证**

- 基于站内 23 个标准 + `standard-proposal.html` 中的社区草案，推动行业标准落地；
- 提供认证服务：数据集符合标准 → 颁发认证徽章；
- 定价：认证费 1-5W / 数据集。

**产品 2：数据生产工具链**

- 基于标准，开发数据采集 → 清洗 → 标注 → 发布的一站式工具；
- 开源核心 + 企业版增值（如分布式采集、私有部署）；
- 定价：企业版 5-20W / 年。

**产品 3：标准数据定制**

- 企业有特定场景（如康养护理），需定制数据集；
- 服务：撮合数据采集方 + 标注方 + 质量审计；
- 定价：项目制，50-200W / 项目。

**产品 4：数据集交易平台**

- 撮合数据集供给方和需求方，收取佣金；
- 提供托管、计费、合规审查；
- 定价：交易额 10-15% 佣金。

**关键动作**：
- 联合 1-2 家头部机构（如清华、上交、阿里）发起标准工作组；
- 申请加入全国机器人标准化技术委员会（SAC/TC591）；
- 发布开源工具链 MVP，建立开发者社区。

### 11.3 风险与对策

| 风险 | 对策 |
|------|------|
| NC 许可证限制商业使用 | 数据保持 NC，但代码工具链用双许可（开源版 AGPL + 商业版付费） |
| 数据集版权属于原机构 | 严格定位为「导航 + 分析」，不托管数据；交易平台只撮合不存储 |
| 大厂入场（如 HuggingFace 做同类站） | 强化中文市场 + 深度分析 + 标准化工作，形成护城河 |
| 用户增长放缓 | 拓展到具身智能全栈（仿真器、模型、硬件），不只做数据集 |
| 商业化与开源社区冲突 | 设立「社区版」+「企业版」边界，社区版永久免费 |

### 11.4 关键指标（North Star）

| 阶段 | 时间 | 北极星指标 | 目标 |
|------|------|-----------|------|
| 影响力 | 0-6 月 | 月活用户（MAU） | 1W → 5W |
| 影响力 | 0-6 月 | 邮件订阅数 | 0 → 5000 |
| B 端 | 6-18 月 | 付费企业数 | 0 → 20 |
| B 端 | 6-18 月 | API 调用量 / 月 | 0 → 100W |
| 标准化 | 18-36 月 | 标准采纳机构数 | 0 → 10 |
| 标准化 | 18-36 月 | 工具链 GitHub Star | 0 → 5000 |

### 11.5 立即可执行的 3 件事

1. **上线邮件订阅**：在首页和博客页加订阅框，用 ConvertKit / Mailchimp 免费版起步，沉淀私域流量；
2. **开放赞助位**：在 footer 和博客侧栏加「赞助伙伴」位，接受机器人公司赞助（非广告，类似 OSS sponsor）；
3. **发布首份行业报告**：基于 94 数据集 + 6 benchmark，发布《2026 具身智能数据集行业报告》，免费版引流 + 付费版深度分析（199 元）。

---

## 附录：版本演进时间线

| 版本 | 日期 | 关键变化 |
|------|------|---------|
| v1.x | 2026-05-26 | VitePress 初始版本 |
| v2.0 | 2026-05-28 | 从 VitePress 迁移到纯静态 HTML |
| v2.1 | 2026-05-29 | 统一深色主题、新增「数据标准」导航 |
| v2.2 | 2026-05-29 | 数据集详情页、数据标准页面 |
| v2.3 | 2026-05-29 | giscus 评论区、数据集对比、数据质量标签 |
| v2.4 | 2026-06-01 | 英文站上线、技术博客、数据格式全景图 |
| v2.5-2.6 | 2026-06-02 | 数据集清理 + 新增 DROID/MimicGen 等 |
| v2.7 | 2026-06-03 | AI 语义搜索上线、工具板块、品牌更名 |
| v2.8 | 2026-06-05 | +16 数据集、+7 工具、Schema 树重构 |
| v2.9 | 2026-06-08 | AI 助手 Phase 2（DeepSeek）、快速上手字段 |
| v2.10 | 2026-06-17 | 康养护理数据集、防虚构体系 |
| v2.11 | 2026-06-19 | +29 数据集、VLA 兼容性、反向推荐 |
| v2.12 | 2026-06-21 | Benchmark 排行榜、LICENSE 双许可 |
| v2.13 | 2026-06-22 | 论文知识库（137 篇）、Benchmark 体系优化 |

---

*本文档由代码分析自动生成，最后更新：2026-06-22*
