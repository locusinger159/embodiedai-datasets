# 具身智能数据集导航

> EmbodiedAI Datasets — 全球具身智能、机器人、人形机器人数据集情报站

🌐 **线上地址**: [superdata-robotai.com](https://superdata-robotai.com)

## 项目简介

专注收录全球具身智能、人形机器人、机械臂、移动机器人数据集情报。只做信息汇总与申请导航，助力算法研发。

- 📊 收录 **50** 个数据集，覆盖 2 种开放类型
- 📐 收录 **19** 个数据标准与评测基准
- 🤖 覆盖 **6** 大机器人类型：人形、机械臂、移动、四足、仿真、触觉
- 🎯 覆盖 **7** 种任务类型：抓取、操作、导航、装配、交互、家居、运动控制
- 🏛️ 数据来自 **38+** 全球顶级研究机构

## 功能特性

- **数据集详情页** — 每个数据集独立页面，含信息卡片、数据格式 Schema 图、传感器规格、数据统计、BibTeX 引用、相关推荐
- **数据集对比** — 多选横向对比（最多 4 个），高亮差异字段，含数据格式与质量维度
- **数据标准页** — 19 个行业标准/评测基准，表格/卡片双视图，支持多选对比
- **数据格式全景图** — 全局视角查看存储格式分布、Schema 层级深度、传感器类型覆盖
- **标准草案** — 基于 50 个数据集分析提出的统一数据格式建议，社区讨论驱动
- **英文站** — 全站英文版（`/en/`），中/EN 一键切换
- **技术博客** — 数据集深度分析、行业趋势、数据标准讨论，RSS 订阅
- **数据质量标签** — 采集方式、标注质量、真机/仿真占比、数据划分
- **更新追踪** — 部分热门数据集展示 changelog 时间线
- **评论区** — 基于 giscus + GitHub Discussions，每个详情页可评论讨论
- **搜索筛选** — 按名称、机器人类型、任务类型、开放程度筛选
- **表格/卡片视图切换** + 排序 + 分页

## 快速开始

```bash
git clone https://github.com/locusinger159/embodiedai-datasets.git
cd embodiedai-datasets

# 构建
node build.cjs

# 本地预览
npx serve dist
```

## 项目结构

```
embodiedai-datasets/
├── src/
│   ├── partials/                  # 共享组件
│   │   ├── head.html              #   全局 CSS、字体、SEO meta
│   │   ├── navbar.html            #   中文导航栏（含 GitHub CTA）
│   │   ├── navbar-en.html         #   英文导航栏
│   │   ├── footer.html            #   中文 4 列页脚
│   │   └── footer-en.html         #   英文页脚
│   └── pages/                     # 页面模板
│       ├── index.html             #   中文首页（Hero + 统计 + 特性 + 合作机构）
│       ├── datasets.html          #   数据集列表（搜索/筛选/对比/表格/卡片）
│       ├── dataset-detail.html    #   数据集详情（Schema/质量/更新/changelog/评论）
│       ├── standards.html         #   数据标准（多选对比/趋势洞察）
│       ├── standard-detail.html   #   标准详情
│       ├── submit.html            #   提交页（邮件/GitHub 步骤指南/FAQ）
│       ├── blog.html              #   博客列表
│       ├── blog-detail.html       #   博客详情
│       ├── formats.html           #   格式全景图
│       └── standard-proposal.html #   标准草案
├── docs/
│   ├── data/
│   │   ├── datasets.json          #   数据集数据（50 条，中文）
│   │   ├── datasets.en.json       #   数据集数据（英文）
│   │   ├── standards.json         #   数据标准（19 条，中文）
│   │   ├── standards.en.json      #   数据标准（英文）
│   │   └── blog.json              #   博客文章数据
│   ├── public/                    #   静态资源（logo、favicon、CNAME）
│   └── superpowers/               #   设计文档与实施计划
├── build.cjs                      # 构建脚本（零依赖 Node.js，一次构建输出双语言）
├── dist/                          # 构建输出（部署到 gh-pages）
└── .github/workflows/deploy.yml   # GitHub Actions 自动部署
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
  "modality": ["视觉", "深度"],
  "type": "open",
  "links": {
    "official": "https://example.com",
    "paper": "https://arxiv.org/abs/xxxx"
  },
  "description": "详细描述",
  "license": "Apache 2.0",
  "quality": {
    "collection": "遥操作采集",
    "annotation": "人工标注",
    "realWorld": "100%真机",
    "hasSplit": true
  },
  "changelog": [
    {"date": "2024-03", "text": "首次发布"},
    {"date": "2025-01", "text": "V2 更新"}
  ],
  "citation": {
    "bibtex": "@article{...}",
    "authors": "作者",
    "year": 2024,
    "venue": "arXiv"
  },
  "github": "https://github.com/xxx",
  "huggingface": "https://huggingface.co/datasets/xxx"
}
```

| 字段 | 说明 |
|------|------|
| `type` | `open` / `partial` / `apply` / `closed` |
| `quality.collection` | 采集方式：遥操作采集 / 仿真生成 / 多源聚合 |
| `quality.annotation` | 标注质量：人工标注 / 自动标注 |
| `quality.realWorld` | 真机占比：100%真机 / 仿真 |
| `quality.hasSplit` | 是否有 train/val/test 划分 |

## 部署

push 到 main 分支后，GitHub Actions 自动执行：

1. `node build.cjs` — 读取 JSON，注入模板，生成 50 个详情页 + 4 个列表页
2. force push `dist/` → `gh-pages` 分支
3. GitHub Pages serve + 自定义域名 `superdata-robotai.com`

## 技术栈

- **构建**: Node.js 原生脚本，零 npm 依赖
- **前端**: 纯 HTML + CSS + 原生 JavaScript，无框架
- **评论**: giscus（基于 GitHub Discussions）
- **字体**: Google Fonts — Noto Sans SC + Inter
- **托管**: GitHub Pages

## 提交数据集

- 📧 邮件：embodisets@163.com
- 🐙 GitHub Issues：[提交 Issue](https://github.com/locusinger159/embodiedai-datasets/issues/new)
- 🔀 Pull Request：直接编辑 `docs/data/datasets.json`

## 版本记录

### v2.6 (2026-06-02)

- 🧹 数据集大清理：删除 14 个闭源占位条目（均为公司官网链接，非真实数据集）
- 🗃️ 新增 6 个数据集：DROID、MimicGen、RoboCasa、ARNOLD、RoboNet、Ego4D
- 📅 数据集列表/卡片新增「发布时间」字段（表格列 + 卡片展示）
- 📝 补全 39 个数据集的论文链接与发布年份
- 🔄 更新 Unitree H1 条目为真实的 LAFAN1 运动重定向数据集

### v2.5 (2026-06-02)

- 🗃️ 新增 OXE-AugE 数据集（440 万+ 轨迹，Cross-Painting 跨机体增强）
- 🤖 新增 Galaxea GOD 数据集（500 小时真机数据，10 万+ 轨迹，星海图）
- 🔧 精简语言切换控件（保留桌面端中/EN，移除移动端重复控件）
- 🐛 修复博客详情页内容被顶栏遮挡问题

### v2.4 (2026-06-01)

- 🌐 英文站上线（`/en/`），中/EN 语言切换，一次构建输出双语言
- 📝 技术博客板块（列表/详情页 + RSS feed）
- 📊 数据格式全景图（存储格式分布、Schema 层级、传感器覆盖）
- 📐 数据标准草案页（统一 Schema 建议 + 社区讨论）
- ⚖️ 数据集对比增强（增加数据格式和质量维度）

### v2.3 (2026-05-29)

- 🗨️ giscus 评论区集成
- ⚖️ 数据集对比功能（最多 4 个，高亮差异）
- 📋 更新追踪 changelog 时间线
- 🏷️ 数据质量标签（采集方式/标注/真机占比/数据划分）
- ⚠️ 政策类标准增加未公开提示

### v2.2 (2026-05-29)

- 📄 数据集详情页（Schema 图 / 传感器规格 / 数据统计 / BibTeX / 相关推荐）
- 📐 数据标准页面（19 个标准/基准，多选对比，趋势洞察）
- 🔗 数据集列表名称链接到详情页

### v2.1 (2026-05-29)

- 🎨 统一深色主题配色 (`#0B0F1A`)
- 📱 导航栏 72px、Footer 4 列
- 🧭 新增「数据标准」导航入口
- 📊 首页统计新增数据标准数量

### v2.0 (2026-05-28)

- 🏗️ 从 VitePress 迁移到纯静态 HTML 构建系统
- 🎯 深色 Hero + 吉祥物 + 粒子动画
- 📊 数据集表格/卡片双视图 + 筛选 + 排序 + 分页
- 📬 提交页重构（邮件/GitHub 步骤指南/FAQ）
- 🏷️ 首页统计动画 + 合作机构展示

### v1.x (2026-05-26)

- 🚀 基于 VitePress 的初始版本
- 📦 数据集 JSON 数据源
- 🔍 基础搜索筛选
- 📤 GitHub Actions 自动部署到 gh-pages

## 后续待办

> 以下是从 v2.4 迭代中遗留的任务，记录在此防止遗忘。

### 数据翻译
- [ ] 50 个数据集的 `description`、`notes`、`quality` 等文本字段翻译为英文
- [ ] 策略：AI（Claude/DeepL）初译 + 人工审核，优先翻译 TOP 20 热门数据集
- [ ] 文件：`docs/data/datasets.en.json`

### Schema 数据补全
- [ ] 多数数据集的 `dataFormat.schema` 字段当前为模板值，需从论文中提取真实格式结构
- [ ] 优先补全 TOP 20 数据集（Open X-Embodiment、BridgeData V2、RH20T 等）
- [ ] 补全后格式全景图的统计数据将更准确

### 种子博客文章
- [ ] 撰写 3-5 篇技术文章替换 `blog.json` 中的占位内容
- [ ] 建议主题：自动驾驶数据管线经验、数据集格式全景对比、高质量操作数据判断标准、开源生态现状与缺口、XX 数据集深度评测
- [ ] 文件：`docs/data/blog.json`

### 其他
- [ ] 首页可增加 Blog 和标准草案的推荐卡片
- [ ] 导航栏/Footer 中格式全景图和标准草案的入口（如需）
- [ ] schema 数据补全后考虑发布标准草案 v2

## 许可证

本项目仅做信息导航，不提供任何数据集下载。数据集版权归原机构/作者所有。

## 联系方式

- 📧 邮箱：embodisets@163.com
- 🐙 GitHub：[locusinger159/embodiedai-datasets](https://github.com/locusinger159/embodiedai-datasets)
