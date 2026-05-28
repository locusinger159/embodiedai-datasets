# 具身智能数据集导航

> EmbodiedAI Datasets — 全球具身智能、机器人、人形机器人数据集情报站

🌐 **线上地址**: [superdata-robotai.com](https://superdata-robotai.com)

## 项目简介

专注收录全球具身智能、人形机器人、机械臂、移动机器人数据集情报。只做信息汇总与申请导航，助力算法研发。

- 📊 收录 **55** 个数据集，覆盖 4 种开放类型
- 🤖 覆盖 **7** 大机器人类型：人形、机械臂、移动、四足、仿真、触觉、多机型
- 🎯 覆盖 **6** 种任务类型：抓取、操作、导航、装配、交互、家居
- 🏛️ 数据来自 **40+** 全球顶级研究机构

## 快速开始

```bash
# 克隆项目
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
│   ├── partials/              # 共享组件
│   │   ├── head.html          #   页头（CSS、字体、SEO）
│   │   ├── navbar.html        #   导航栏
│   │   └── footer.html        #   页脚
│   └── pages/                 # 页面模板
│       ├── index.html         #   首页
│       ├── datasets.html      #   数据集列表页
│       └── submit.html        #   提交页面
├── docs/
│   ├── data/datasets.json     # 数据集数据（唯一数据源）
│   └── public/                # 静态资源（logo、favicon、CNAME）
├── build.cjs                  # 构建脚本
├── dist/                      # 构建输出（部署到 gh-pages）
└── .github/workflows/deploy.yml  # 自动部署
```

## 数据维护

所有数据集存储在 `docs/data/datasets.json`，格式如下：

```json
{
  "id": "dataset-id",
  "name": "数据集名称",
  "institution": "机构名称",
  "scale": "数据规模",
  "robotType": ["人形机器人", "机械臂"],
  "task": ["操作", "抓取"],
  "modality": ["视觉", "深度"],
  "type": "open",
  "links": {
    "official": "https://example.com",
    "paper": "https://arxiv.org/abs/xxxx.xxxxx"
  },
  "notes": "一句话点评"
}
```

- `type` 取值：`open`（开源）、`partial`（部分开源）、`apply`（可申请）、`closed`（闭源）

### 添加新数据集

编辑 `docs/data/datasets.json`，在数组末尾追加新条目，提交到 main 分支即可自动部署。

## 提交数据集

如需提交新数据集，可通过以下方式：

- 📧 邮件：embodisets@163.com
- 🐙 GitHub Issues：[提交 Issue](https://github.com/locusinger159/embodiedai-datasets/issues/new)

## 部署

push 到 main 分支后，GitHub Actions 自动执行：

1. `node build.cjs` — 读取 JSON 数据，生成静态 HTML
2. 将 `dist/` 目录推送到 `gh-pages` 分支
3. GitHub Pages 从 `gh-pages` 分支 serve，绑定自定义域名 `superdata-robotai.com`

## 技术栈

- **构建**: Node.js 原生脚本，零外部依赖
- **样式**: 原生 CSS（渐变蓝 + 深色 Hero + 全宽表格）
- **字体**: Google Fonts（Noto Sans SC + Inter）
- **托管**: GitHub Pages + 自定义域名

## 历史版本

v1 基于 VitePress 的版本保留在 `docs/.vitepress/`，可通过以下命令使用：

```bash
npm install
npm run build:v1
npm run preview:v1
```

## 许可证

本项目仅做信息导航，不提供任何数据集下载。数据集版权归原机构/作者所有。

## 联系方式

- 📧 邮箱：embodisets@163.com
- 🐙 GitHub：[locusinger159/embodiedai-datasets](https://github.com/locusinger159/embodiedai-datasets)
