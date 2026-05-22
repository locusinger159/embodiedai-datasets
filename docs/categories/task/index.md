# 按任务类型分类

::: tip 说明
按任务类型浏览数据集，包括抓取、操作、导航、装配、交互、家居等。
:::

## 目录

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;">
  <a href="#抓取" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">🤏 抓取</a>
  <a href="#操作" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">🤲 操作</a>
  <a href="#导航" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">🧭 导航</a>
  <a href="#装配" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">🔧 装配</a>
  <a href="#交互" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">💬 交互</a>
  <a href="#家居" style="padding: 6px 12px; background: var(--vp-c-bg-soft); border-radius: 6px; text-decoration: none; color: var(--vp-c-text-1);">🏠 家居</a>
</div>

---

## 抓取 🤏

| 数据集 | 机构 | 说明 |
|--------|------|------|
| GraspNet-1Billion | 清华大学 | 超大规模抓取检测数据集 |
| OCRL | UC Berkeley | 物体操纵持续学习 |
| DexNet 2.0 | 伯克利 | 抓取姿态规划 |

::: info
抓取任务数据集主要关注物体的抓取姿态预测和规划。
:::

---

## 操作 🤲

### 国际开源

| 数据集 | 机构 | 规模 | 说明 |
|--------|------|------|------|
| Open X-Embodiment | Google DeepMind | 100W+ 轨迹 | 跨具身最大数据集 |
| BridgeData V2 | UC Berkeley | 85K 轨迹 | 桌面操纵 |
| RoboSet | CMU | 220K 轨迹 | 策略学习 |
| Libero | 斯坦福 | 130+ 任务 | 长程多任务 |
| RH20T | 斯坦福 | 120+ 任务 | 日常操纵 |

### 国内开源

| 数据集 | 机构 | 说明 |
|--------|------|------|
| AgiBot World | 智元机器人 | 国内最大人形数据集 |
| RoboMIND | 北京人形中心 | 统一人形数据协议 |
| DAMO-SOLO | 阿里达摩院 | 机械臂操纵 |

::: tip
操作任务数据集覆盖抓取、放置、推动等多种动作。
:::

---

## 导航 🧭

| 数据集 | 机构 | 说明 |
|--------|------|------|
| Habitat | Meta AI | 大规模室内导航 |
| Gibson | 斯坦福 | 真实场景导航 |
| Matterport3D | Matterport | 室内场景数据 |
| 云鲸导航数据 | 云鲸 | 扫地机器人导航 |
| 科沃斯 SLAM 数据 | 科沃斯 | 家庭导航 |

::: info
导航数据集主要关注机器人在室内外环境中的路径规划和定位。
:::

---

## 装配 🔧

| 数据集 | 机构 | 说明 |
|--------|------|------|
| RLBench | 牛津 | 100+ 装配任务 |
| RoboSet | CMU | 桌面装配 |
| RoboSuite | 伯克利 | 模块化仿真 |

::: tip
装配任务数据集专注于需要精确对齐和组装的复杂任务。
:::

---

## 交互 💬

| 数据集 | 机构 | 说明 |
|--------|------|------|
| CALVIN | Bosch、图宾根 | 语言条件机器人 |
| RoboNat | 上海交大 | 自然语言交互 |
| T-Diffusion | Google | 自然语言条件策略 |

::: info
交互任务数据集支持自然语言指令理解和执行。
:::

---

## 家居 🏠

| 数据集 | 机构 | 说明 |
|--------|------|------|
| RT-1 Data | Google DeepMind | 居家日常任务 |
| RH20T | 斯坦福、Google | 家庭场景 |
| BridgeData V2 | UC Berkeley | 桌面家务 |
| ARIO | CMU | 居家操纵 |
| iGibson | 斯坦福 | 仿真家庭环境 |
| AgiBot World | 智元 | 家居、餐饮、办公 |

::: tip
家居任务数据集覆盖日常家庭场景中的各种任务。
:::

---

## 全任务类型

::: warning 说明
以下数据集覆盖多种任务类型，或任务类型较为综合。

| 数据集 | 机构 | 任务类型 |
|--------|------|----------|
| Open X-Embodiment | Google DeepMind | 多任务 |
| ManiSkill2 | 斯坦福、清华 | 操纵、手眼协调 |
| MetaWorld | Meta AI、伯克利 | 50+ 任务 |
| RoboMIND | 北京人形中心 | 多任务 |
| Tesla Optimus Data | 特斯拉 | 制造任务 |

:::

---

::: info 继续探索
- [查看所有数据集](/datasets/)
- [按机器人类型浏览](/categories/robot/)
- [提交新数据集](/submit/)
:::
