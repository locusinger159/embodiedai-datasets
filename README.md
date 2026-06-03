# Superdata RobotAI — 具身智能数据集导航

> 全球具身智能、机器人、人形机器人数据集情报站

🌐 **线上地址**: [superdata-robotai.com](https://superdata-robotai.com)

## 项目简介

专注收录全球具身智能、人形机器人、机械臂、移动机器人数据集情报。只做信息汇总与申请导航，助力算法研发。

- 📊 收录 **43** 个数据集
- 📐 收录 **19** 个数据标准与评测基准
- 🔧 收录 **11** 个工具与平台
- 🤖 覆盖 **7** 大机器人类型：人形机器人、机械臂、移动机器人、四足机器人、多机型、触觉传感、灵巧手
- 🎯 覆盖 **7** 种任务类型：操作、抓取、导航、装配、家居、交互、运动控制
- 🏷️ 热门标签：世界模型、RLDS、遥操作、VLA、大规模 等
- 🏛️ 数据来自 **34+** 全球顶级研究机构

## 功能特性

- **AI 语义搜索** — 全站右下角 🔍 浮动搜索，自然语言输入，百炼 text-embedding-v4（2048 维）+ 关键词加权混合检索
- **数据集详情页** — 每个数据集独立页面，含信息卡片、Schema 图、传感器规格、数据统计、BibTeX 引用、相关推荐
- **数据集对比** — 多选横向对比（最多 4 个），高亮差异字段
- **侧边栏筛选** — 280px 左侧筛选面板（机器人类型/任务/开放程度/热门标签），右侧列表展示
- **数据标准页** — 19 个行业标准/评测基准，表格/卡片双视图，支持多选对比
- **工具/平台** — 11 个仿真平台、数据处理框架、可视化工具独立版块
- **数据格式全景图** — 全局视角查看存储格式分布、Schema 层级深度、传感器覆盖
- **标准草案** — 基于 43 个数据集分析提出的统一数据格式建议
- **英文站** — 全站英文版（`/en/`），中/EN 一键切换
- **技术博客** — 数据集深度分析、技术实践，RSS 订阅
- **评论区** — 基于 giscus + GitHub Discussions

## 快速开始

```bash
git clone https://github.com/locusinger159/embodiedai-datasets.git
cd embodiedai-datasets

# 构建
node build.cjs

# 本地预览
npx serve dist
```

### AI 搜索

```bash
# 生成嵌入（需要百炼 API Key）
DASHSCOPE_API_KEY=sk-xxx node scripts/embed.cjs

# 复制嵌入到 FC 部署目录
cp dist/embeddings.json fc/embeddings.json

# 部署阿里云 FC（上传 fc/ 目录）
```

## 项目结构

```
embodiedai-datasets/
├── src/
│   ├── partials/
│   │   ├── head.html              #   全局 CSS、字体
│   │   ├── navbar.html / navbar-en.html
│   │   ├── footer.html / footer-en.html
│   │   └── search-widget.html     #   AI 搜索浮动组件
│   └── pages/
│       ├── index.html             #   首页
│       ├── datasets.html          #   数据集列表（侧边栏筛选）
│       ├── dataset-detail.html    #   数据集详情
│       ├── standards.html         #   数据标准列表
│       ├── standard-detail.html   #   标准详情
│       ├── tools.html             #   工具/平台列表
│       ├── tool-detail.html       #   工具/平台详情
│       ├── submit.html            #   提交页
│       ├── blog.html / blog-detail.html
│       ├── formats.html           #   格式全景图
│       └── standard-proposal.html #   标准草案
├── docs/data/
│   ├── datasets.json / datasets.en.json       # 43 个数据集
│   ├── standards.json / standards.en.json     # 19 个标准
│   ├── tools.json / tools.en.json             # 11 个工具
│   └── blog.json                              # 博客文章
├── scripts/
│   └── embed.cjs                 #   嵌入生成脚本（百炼 text-embedding-v4）
├── fc/
│   ├── index.js                  #   阿里云 FC 搜索后端
│   ├── package.json
│   └── embeddings.json           #   预计算嵌入索引
├── build.cjs                     #   构建脚本（零依赖）
└── dist/                         #   构建输出
```

## 数据格式

### 数据集 (datasets.json)

```json
{
  "id": "dataset-id",
  "name": "数据集名称",
  "institution": "机构",
  "scale": "数据规模",
  "robotType": ["人形机器人"],
  "task": ["操作"],
  "modality": ["RGB", "深度", "动作"],
  "tags": ["世界模型", "遥操作", "RLDS"],
  "type": "open",
  "links": { "official": "...", "paper": "..." },
  "description": "详细描述",
  "license": "CC BY-NC-SA 4.0",
  "quality": {
    "collection": "遥操作采集",
    "annotation": "人工标注",
    "realWorld": "真机实测",
    "hasSplit": true
  },
  "citation": { "year": 2025, "venue": "arXiv" },
  "github": "...",
  "huggingface": "..."
}
```

| 字段 | 说明 |
|------|------|
| `type` | `open` / `partial` / `apply` / `closed` |
| `tags` | 自由标签，用于热门标签筛选和 AI 搜索 |
| `quality.collection` | 采集方式：遥操作采集 / 仿真生成 / 多源聚合 |
| `quality.annotation` | 标注质量：人工标注 / 自动标注 |
| `quality.realWorld` | 真机占比：真机实测 / 仿真 |

## 部署

push 到 main 分支后，GitHub Actions 自动执行：

1. `node build.cjs` — 读取 JSON，注入模板，生成全站页面
2. force push `dist/` → `gh-pages` 分支
3. GitHub Pages serve + 自定义域名 `superdata-robotai.com`

## 技术栈

- **构建**: Node.js 原生脚本，零 npm 依赖
- **前端**: 纯 HTML + CSS + 原生 JavaScript，无框架
- **搜索**: 百炼 text-embedding-v4 (2048-dim) + 阿里云函数计算 FC
- **评论**: giscus（基于 GitHub Discussions）
- **字体**: Google Fonts — Noto Sans SC + Inter
- **托管**: GitHub Pages

## 提交数据集

- 📧 邮箱：embodisets@163.com
- 🐙 GitHub Issues：[提交 Issue](https://github.com/locusinger159/embodiedai-datasets/issues/new)
- 🔀 Pull Request：直接编辑 `docs/data/datasets.json`

## 版本记录

### v2.7 (2026-06-03)

- 🤖 **AI 语义搜索上线** — 百炼 text-embedding-v4 (2048 维) + 阿里云 FC + 关键词加权混合检索
- 🔧 **工具/平台板块** — 11 个仿真平台、数据处理框架、可视化工具独立版块
- 🏷️ **标签系统** — 新增 `tags` 字段，热门标签筛选，清理 54→19 个核心标签
- 🎨 **侧边栏筛选布局** — 数据集 + 标准页面统一左侧筛选面板
- 🏗️ **GR-1 拆分** — Fourier ActionNet（真机）+ NVIDIA GR-1 仿真 两个独立条目
- 🔄 **AgiBot World → AGIBOT WORLD 2026** — 全面重写（G2 平台、两阶段发布）
- 🆕 **UnifoLM-WBT** — 宇树 G1 全身遥操作数据集（340h, 189 万轨迹）
- 📝 **描述格式化** — 全部 43 数据集 + 19 标准 + 11 工具重构（段落/加粗/链接）
- 🎯 **品牌更名** — EmbodiedAI Datasets → Superdata RobotAI
- 📰 **技术博客** — AI 语义搜索技术实践文章
- 🐛 **Bug 修复** — SoftManip 删除、TacTip/RealSource 链接更新、TactileToolbox→PyTouch

### v2.6 (2026-06-02)

- 🧹 数据集清理：删除 14 个闭源占位条目
- 🗃️ 新增 6 个数据集：DROID、MimicGen、RoboCasa、ARNOLD、RoboNet、Ego4D
- 📅 数据集列表新增「发布时间」字段

### v2.5 (2026-06-02)

- 🗃️ 新增 OXE-AugE、Galaxea GOD 数据集
- 🔧 精简语言切换控件

### v2.4 (2026-06-01)

- 🌐 英文站上线（`/en/`）
- 📝 技术博客板块 + RSS
- 📊 数据格式全景图

### v2.3 (2026-05-29)

- 🗨️ giscus 评论区、数据集对比、数据质量标签

### v2.2 (2026-05-29)

- 📄 数据集详情页、数据标准页面

### v2.1 (2026-05-29)

- 🎨 统一深色主题、新增「数据标准」导航

### v2.0 (2026-05-28)

- 🏗️ 从 VitePress 迁移到纯静态 HTML

### v1.x (2026-05-26)

- 🚀 基于 VitePress 的初始版本

## 许可证

本项目仅做信息导航，不提供任何数据集下载。数据集版权归原机构/作者所有。

## 联系方式

- 📧 邮箱：embodisets@163.com
- 🐙 GitHub：[locusinger159/embodiedai-datasets](https://github.com/locusinger159/embodiedai-datasets)
