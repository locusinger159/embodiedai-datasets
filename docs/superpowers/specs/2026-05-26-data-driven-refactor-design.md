# Data-Driven Refactor for EmbodiedAI Datasets

## Summary

重构数据集导航站的数据层和视图层：将分散在 3 个 Markdown 文件中的数据集提取为单一 JSON 数据源，用 Vue 组件渲染页面，并添加搜索/标签筛选功能。

## Architecture

```
docs/
├── .vitepress/
│   ├── config.js                    # VitePress 配置（修复 ignoreDeadLinks）
│   └── theme/
│       └── components/
│           ├── DatasetList.vue      # 全部数据集列表（搜索+标签筛选）
│           ├── DatasetCategory.vue  # 按维度分类展示
│           └── DatasetCard.vue      # 单个数据集卡片
├── data/
│   └── datasets.json               # 唯一数据源（~45条记录）
├── datasets/index.md               # 引入 DatasetList
├── categories/robot/index.md       # 引入 DatasetCategory(groupBy="robotType")
├── categories/task/index.md        # 引入 DatasetCategory(groupBy="task")
├── submit.md                       # 修复表单（mailto 或移除假表单）
└── index.md                        # 首页（保持现有结构）
```

## Data Schema (datasets.json)

```json
[
  {
    "id": "open-x-embodiment",
    "name": "Open X-Embodiment",
    "institution": "Google DeepMind",
    "scale": "15 种机器人，100W+ 轨迹",
    "robotType": ["多机型"],
    "task": ["操纵"],
    "modality": ["视觉", "本体状态", "动作"],
    "type": "open",
    "links": {
      "official": "https://robotics-transformer-x.github.io",
      "paper": "https://arxiv.org/abs/2310.08864"
    },
    "notes": "跨具身最大开源数据集，RT-X 训练必备。"
  }
]
```

- `type`: "open" | "partial" | "apply" | "closed"
- `robotType`, `task`, `modality`: 数组，支持一个数据集跨多类
- `links.paper` 和 `notes` 可选

## Components

### DatasetList.vue
- 文本搜索框（搜索名称、机构、备注）
- 可点击标签行：机器人类型、任务类型、开源/闭源
- 全部数据集以卡片列表展示
- 无结果时显示空状态提示

### DatasetCategory.vue
- Props: `groupBy: "robotType" | "task"`
- 按维度自动分组，每组有标题锚点
- 复用 DatasetCard 组件

### DatasetCard.vue
- 渲染单个数据集的完整信息（表格形式）
- Props: `dataset: Dataset`

## Search & Filter
- 文本搜索：实时过滤（Vue computed）
- 标签筛选：点击标签切换选中状态，支持多选
- 搜索 + 标签组合过滤

## Fixes Included
1. `ignoreDeadLinks: true` → `false`，修复所有死链接
2. 统一邮箱为 `embodisets@163.com`
3. 提交表单改为简单的联系方式说明 + mailto 链接

## Non-Goals
- 不自定义 VitePress 主题（使用默认主题）
- 不加后端/数据库
- 不更改部署流程（GitHub Actions → gh-pages 保持不变）
