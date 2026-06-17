# Superdata RobotAI — 具身智能数据集导航

> 全球具身智能、机器人、人形机器人数据集情报站

🌐 **线上地址**: [superdata-robotai.com](https://superdata-robotai.com)

## 项目简介

专注收录全球具身智能、人形机器人、机械臂、移动机器人数据集情报。只做信息汇总与申请导航，助力算法研发。

- 📊 收录 **63** 个数据集
- 📐 收录 **19** 个数据标准与评测基准
- 🔧 收录 **18** 个工具与平台
- 🤖 覆盖 **8** 大机器人类型：人形机器人、机械臂、移动机器人、四足机器人、多机型、触觉传感、灵巧手、通用
- 🎯 覆盖 **16** 种任务类型：操作、抓取、导航、装配、家居、交互、运动控制、可供性分割、3D运动预测、康养护理 等
- 🏷️ 热门标签：世界模型、RLDS、遥操作、VLA、大规模、可供性 等
- 🏛️ 数据来自 **53** 个全球顶级研究机构

## 功能特性

- **AI 语义搜索** — 全站右下角 🔍 浮动搜索，自然语言输入，百炼 text-embedding-v4（2048 维）+ 关键词加权混合检索
- **数据集详情页** — 每个数据集独立页面，含信息卡片、Schema 图、传感器规格、数据统计、BibTeX 引用、相关推荐
- **数据集对比** — 多选横向对比（最多 4 个），高亮差异字段
- **侧边栏筛选** — 280px 左侧筛选面板（机器人类型/任务/开放程度/热门标签），右侧列表展示
- **数据标准页** — 19 个行业标准/评测基准，每条含 RFC 2119 规范性要求（MUST/SHOULD/MAY），表格/卡片双视图
- **工具/平台** — 18 个仿真平台、物理引擎、训练框架、可视化工具，侧边栏按工具类型筛选，每条含教程模块（快速开始/依赖/外部教程）
- **数据格式全景图** — 全局视角查看存储格式分布、Schema 层级深度、传感器覆盖
- **技术博客** — 6 篇深度文章：Qwen-Robot 模型矩阵解析 / 7 天 VLA 项目实战 / AI 搜索技术实践 / GR-1 数据生态测评 / UniACT 深度解析，RSS 订阅
- **英文站** — 全站英文版（`/en/`），中/EN 一键切换
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
│   ├── datasets.json / datasets.en.json       # 63 个数据集
│   ├── standards.json / standards.en.json     # 19 个标准
│   ├── tools.json / tools.en.json             # 18 个工具
│   └── blog.json                              # 博客文章
├── scripts/
│   ├── embed.cjs                 #   嵌入生成脚本（百炼 text-embedding-v4）
│   ├── validate.cjs              #   数据校验（JSON schema / 必填字段 / 跨语言一致性 / URL）
│   └── scan-fiction-risk.py      #   AI 虚构数据风险扫描（多维度打分）
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

### v2.10 (2026-06-17)

- 🏥 **康养护理数据集** — 新增 6 个数据集（57→63）：OpenRoboCare（Cornell 专业护理演示）、ETRI-Activity3D-LivingLab（韩国 55 种老年日常动作）、KFall（KAIST 跌倒前检测 IMU）、EC-AR（郑州大学 养老动作识别）、MedMassage-12K（中科院 穴位按摩 VLM）、CeTI-Age-Kinematics（TU Dresden 老年运动学），新增「康养护理」任务类型
- 🗑️ **删除 RoboNat** — AI 虚构数据集（论文 arxiv 2409.00001 指向脑瘫检测 XAI 论文），与 FMTC/OCRL 同为第三例虚构
- 📅 **年份字段补全** — 全部 63 个数据集添加显式 `year` 字段（2017-2026），修复数据集列表年份排序 bug
- 🔍 **防虚构体系** — 新增 `validate.cjs`（6 大校验项：JSON schema / 必填字段 / 跨语言一致性 / 年份覆盖 / 受控词汇 / URL 格式）和 `scan-fiction-risk.py`（多维度 AI 虚构风险扫描），三层防御写入项目约定
- 📝 **Qwen-Robot 博客** — 阿里首个具身大模型矩阵深度解析（Manip + Nav + World），含与 GR00T 横向对比
- 🐛 **修复** — HuggingFace `/datasets/` 前缀缺失、OpenLET 下载链接夹带中文、数据集列表排序下拉框映射错误

### v2.9 (2026-06-08)

- 💬 **AI 助手 Phase 2** — DeepSeek V4 Flash 驱动，检索结果注入 system prompt 生成结构化推荐。双按钮入口（💬AI 助手 + 🔍搜索），右侧抽屉面板，多轮对话 + 引用来源
- 💻 **全部数据集快速上手** — 59 个数据集补充 `usage` 字段（加载代码/依赖库/预处理说明），`dataFormat` 扩展 layout/index/format
- 📝 **GR-1 数据生态深度测评** — 三数据集横向对比（ActionNet/NVIDIA 仿真/GR00T N1），实战选型指南
- 🔧 **工具教程模块** — 18 个工具各含快速开始命令、依赖包列表、外部教程链接
- 🎨 **工具详情页与数据集页对齐** — 统一 CSS 布局、section-block 结构、3 列 info-grid
- 🐛 **修复** — 工具 links 缺少 section-block 包装、DOM div 闭合 bug、相关推荐算法优化（≥3 阈值 + 5 维加权）、数据集页间距统一
- 🗑️ **删除 OCRL** — 验证为 AI 虚构条目（论文链接指向量子计算论文）

### v2.8 (2026-06-05)

- 📊 **+16 数据集** — 43→59：AFUN 论文 11 个评测基准（HANDAL/3DOI/HOVA-500K/ReasonAFF/InstructPart/SceneFun3D/RoboMIND2/HOI4D/VITRA）+ BC-Z + ALOHA + InternScenes + Kairos-HomeWorld + GR00T N1 + MotionMillions + DexGraspVLA + SynGrasp-1B
- 🔧 **+7 工具** — 11→18：PyBullet、MuJoCo、Webots、Isaac Lab、Gazebo Sim、Rerun、RViz
- 🎯 **新任务分类** — 可供性分割、3D 运动预测、接触点预测、人机交互、物体交互、3D 场景理解、语义分割、语言推理
- 🏷️ **工具页改版** — robotType+task 替换为 toolType（仿真器/物理引擎/训练框架/可视化/触觉模拟），新增筛选侧边栏
- 📋 **数据标准规范性要求** — 19 个标准各含 RFC 2119 三级要求（MUST/SHOULD/MAY），引用自官方规范
- 🌳 **Schema 树重构** — 兄弟节点 `/` 渲染、observation↔action 嵌套修正、16 个数据集 schema 真实化
- 🔗 **全站链接校验** — 197 个 URL 逐一验证，修复 16 个失效，删除 FMTC（AI 虚构条目）
- 🚮 **删除 FMTC** — 验证为 Claude 4.7 生成的虚构数据集（链接不存在/论文不相关）
- 📝 **博客** — 新手 7 天 VLA 项目实战（MuJoCo + π0-3.5B + BC-Z）
- 🐛 **Bug 修复** — 工具详情页空白块、搜索框缺图标、HuggingFace `/datasets/` 前缀

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
