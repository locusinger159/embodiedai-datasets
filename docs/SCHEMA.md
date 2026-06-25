# Superdata RobotAI — 数据字段标准规范 v3.0

> 本文档定义所有实体类型的标准字段。任何新增或修改数据必须符合此规范。

---

## 1. 实体类型

| 实体 | 存储位置 | 说明 |
|------|---------|------|
| dataset | datasets.json | 机器人训练数据集 |
| standard | standards.json | 数据标准/评测基准/数据格式/行业规范 |
| tool | tools.json | 仿真器/物理引擎/训练框架/可视化工具 |
| blog | blog.json | 技术博客文章 |

---

## 2. 通用字段规范

### 2.1 字段命名
- 使用 **lowerCamelCase**：`robotType`、`dataFormat`
- 跨实体同义字段**必须同名**：统一用 `institution`（不用 `org`），`description`（不用 `desc`）
- 列表字段**必须复数**：`modalities`（不用 `modality`）

### 2.2 受控词汇
- `openness`（替代 `type`）：`open` / `partial` / `apply` / `closed`
- `license`：统一使用 SPDX 标识符，如 `CC-BY-NC-SA-4.0` / `Apache-2.0` / `MIT` / `CC-BY-4.0`。原始文本保留到 `licenseNotes`
- `robotType`：`人形机器人` / `机械臂` / `移动机器人` / `四足机器人` / `多机型` / `灵巧手` / `仿真` / `触觉传感` / `通用`
- `task`：`操作` / `抓取` / `导航` / `装配` / `家居` / `交互` / `运动控制` / `动作捕捉` / `康养护理` / `人类操作` 等
- `modalities`：`RGB` / `深度` / `触觉` / `本体状态` / `动作` / `音频` / `文本` / `力觉` / `力矩` / `LiDAR` / `IMU` / `语言` / `3D点云` / `3D模型` / `3D手部网格` / `物理参数` / `材质` / `GNSS` 等
- `quality.collection`：`遥操作采集` / `仿真生成` / `多源聚合`
- `quality.annotation`：`人工标注` / `自动标注`
- `quality.realWorld`：`真机实测` / `仿真`

### 2.3 链接字段
`links` 对象使用统一键名：
- `site`：官方网站/项目主页（不用 `official`）
- `paper`：论文链接
- `github`：GitHub 仓库
- `huggingface`：HuggingFace 仓库
- `download`：直接下载链接
- `mirror`：镜像站

---

## 3. Dataset（数据集）

### 必填字段 (14)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | string | 唯一标识符，kebab-case | `"bridge-data-v2"` |
| `name` | string | 数据集名称 | `"BridgeData V2"` |
| `institution` | string | 所属机构 | `"UC Berkeley"` |
| `description` | string | 详细描述（Markdown） | `"**BridgeData V2** 是..."` |
| `modalities` | string[] | 模态列表 | `["RGB","深度","动作"]` |
| `robotType` | string[] | 机器人类型 | `["机械臂"]` |
| `task` | string[] | 任务类型 | `["操作","抓取"]` |
| `openness` | string | 开放程度 | `"open"` |
| `license` | string | SPDX 许可证标识符 | `"CC-BY-4.0"` |
| `links` | object | 外部链接 | `{"site":"...","paper":"..."}` |
| `year` | integer | 发布年份 | `2024` |
| `type` | string | **保留兼容旧代码，新代码用 openness** | `"open"` |
| `notes` | string | 简短摘要（列表页用，≤200字） | `"大规模宽数据..."` |
| `scale` | string | 数据规模 | `"50,000+ trajectories"` |

### 推荐字段 (10)

| 字段 | 类型 | 说明 |
|------|------|------|
| `dataFormat` | string | 数据格式（纯文本） |
| `dataFormatDetail` | object | 数据格式详情（可选，结构化） |
| `quality` | object | 数据质量：`collection`/`annotation`/`realWorld`/`hasSplit` |
| `tags` | string[] | 自由标签 |
| `citation` | object | 引用信息：`bibtex`/`year`/`venue`/`authors` |
| `vlaCompatible` | string[] | 兼容的 VLA 框架：`pi0`/`openvla`/`gr00t`/`octo`/`rt-2`/`rdt-1b`/`act` |
| `usage` | object | 使用方法：`load`/`preprocess` |
| `dataContent` | object | 数据内容统计 |
| `github` | string | **废弃，用 links.github** |
| `huggingface` | string | **废弃，用 links.huggingface** |

### 条件字段 (3)

| 字段 | 类型 | 说明 | 条件 |
|------|------|------|------|
| `benchmarks` | object[] | 在该数据集上训练的模型的 benchmark 得分 | 存在论文中的评测结果时 |
| `standards` | string[] | 关联的数据标准 ID | 数据集符合某标准时 |
| `changelog` | object[] | 变更日志 | 数据有更新时 |
| `licenseNotes` | string | 许可证补充说明 | license 为非标准 SPDX 或有额外条款时 |

### 禁止字段
- `benchmarkMeta`（属于 standard 实体）
- `requirements`（属于 standard 实体）
- `datasetIds`（属于 standard 实体）
- `datasetCount`（属于 standard 实体）
- `fullName`（属于 standard 实体）
- `scene`（属于 standard 实体）
- `toolType`（属于 tool 实体）

---

## 4. Standard（数据标准/评测基准）

### 必填字段 (8)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识符，kebab-case |
| `name` | string | 标准名称 |
| `fullName` | string | 全称 |
| `institution` | string | 发布机构（统一用 `institution`） |
| `description` | string | 详细描述（Markdown）（统一用 `description`） |
| `type` | string | `format` / `benchmark` / `industry` / `closed` |
| `openness` | string | `open` / `partial` / `standard` / `closed` |
| `links` | object | 外部链接 |

### 推荐字段 (6)

| 字段 | 类型 | 说明 |
|------|------|------|
| `modalities` | string[] | 涉及的模态 |
| `license` | string | SPDX 标识符 |
| `year` | integer | 发布年份 |
| `scene` | string[] | `real` / `sim` / `general` |
| `requirements` | object | RFC 2119 规范性要求：`MUST`/`SHOULD`/`MAY` |
| `datasetIds` | string[] | 关联的数据集 ID |
| `datasetCount` | integer | 关联数据集数量 |

### 条件字段

| 字段 | 类型 | 说明 | 条件 |
|------|------|------|------|
| `benchmarkMeta` | object | 排行榜元信息：`rankBy`/`metric`/`unit`/`higherIsBetter`/`maxScore` | type=benchmark 时 |

### 字段改名（从旧→新）
- `org` → `institution`
- `desc` → `description`
- `modalities`（复数）保持

---

## 5. Tool（工具/平台）

沿用现有 schema，修正：
- `modality` → `modalities`（统一复数）
- `desc` → `description`（如有）

---

## 6. 许可证 SPDX 映射表

| 旧写法 | SPDX 标识符 |
|--------|-----------|
| `Apache 2.0` / `Apache 2.0（完全开源，可商用）` | `Apache-2.0` |
| `MIT` | `MIT` |
| `CC BY 4.0` / `CC-BY-4.0` | `CC-BY-4.0` |
| `CC BY-NC 4.0` / `CC-BY-NC-4.0` | `CC-BY-NC-4.0` |
| `CC BY-NC-SA 4.0` | `CC-BY-NC-SA-4.0` |
| `BSD 3-Clause` / `BSD-3-Clause` / `BSD 2-Clause` | `BSD-3-Clause` / `BSD-2-Clause` |
| `CC BY-NC-ND 4.0...` | `CC-BY-NC-ND-4.0` |
| 其他非标准描述 | 保留原文 + `licenseNotes` 补充 |
