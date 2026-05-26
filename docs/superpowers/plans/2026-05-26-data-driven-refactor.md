# Data-Driven Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the dataset navigation site from 3 duplicated Markdown files into a single JSON data source with Vue components, adding search/tag filtering.

**Architecture:** Single `datasets.json` as data source, 3 Vue components (DatasetCard, DatasetList, DatasetCategory) registered globally via VitePress theme extension, used directly in Markdown pages. Search and tag filters are client-side Vue computed properties.

**Tech Stack:** VitePress 1.3, Vue 3 (Composition API with `<script setup>`), JSON data, GitHub Pages deployment unchanged.

---

### Task 1: Create the single data source `datasets.json`

**Files:**
- Create: `docs/data/datasets.json`

- [ ] **Step 1: Create the data directory and datasets.json**

```bash
mkdir -p docs/data
```

Write `docs/data/datasets.json` with all datasets extracted from the existing 3 markdown files. Each dataset uses the schema from the spec. The file is a flat JSON array.

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
    "notes": "跨具身最大开源数据集，RT-X 训练必备。覆盖多种机器人形态，适合泛化学习研究。"
  },
  {
    "id": "bridgedata-v2",
    "name": "BridgeData V2",
    "institution": "UC Berkeley RAIL",
    "scale": "85K 操纵轨迹",
    "robotType": ["机械臂"],
    "task": ["操作"],
    "modality": ["视觉", "动作"],
    "type": "open",
    "links": {
      "official": "https://rail-berkeley.github.io/bridgedata",
      "paper": "https://arxiv.org/abs/2403.03954"
    },
    "notes": "小样本学习、模仿学习常用。数据质量高，任务多样。"
  },
  {
    "id": "rh20t",
    "name": "RH20T",
    "institution": "斯坦福大学、Google",
    "scale": "20K 视频，120+ 任务",
    "robotType": ["机械臂"],
    "task": ["操作", "家居"],
    "modality": ["RGB", "深度"],
    "type": "open",
    "links": {
      "official": "https://rh20t.github.io",
      "paper": "https://arxiv.org/abs/2307.11795"
    },
    "notes": "高质量居家机器人视频数据集，适合日常任务学习。"
  },
  {
    "id": "roboset",
    "name": "RoboSet (MobRob)",
    "institution": "Carnegie Mellon University",
    "scale": "220K 演示轨迹",
    "robotType": ["机械臂"],
    "task": ["操作", "装配"],
    "modality": ["多视角视觉"],
    "type": "open",
    "links": {
      "official": "https://roboset.github.io",
      "paper": "https://arxiv.org/abs/2209.13053"
    },
    "notes": "适合策略学习、扩散模型研究。多视角数据便于3D理解。"
  },
  {
    "id": "libero",
    "name": "Libero",
    "institution": "斯坦福大学",
    "scale": "130+ 任务，240W+ 帧",
    "robotType": ["机械臂"],
    "task": ["操作"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://libero-project.github.io",
      "paper": "https://arxiv.org/abs/2306.08640"
    },
    "notes": "长程任务 benchmark，适合指令跟随和任务规划研究。"
  },
  {
    "id": "metaworld",
    "name": "MetaWorld",
    "institution": "Meta AI、UC Berkeley",
    "scale": "50+ 操纵任务",
    "robotType": ["仿真"],
    "task": ["操作"],
    "modality": ["仿真状态"],
    "type": "open",
    "links": {
      "official": "https://meta-world.github.io",
      "paper": "https://arxiv.org/abs/1910.10897"
    },
    "notes": "最常用强化学习基准之一，适合元学习和多任务学习。"
  },
  {
    "id": "rlbench",
    "name": "RLBench",
    "institution": "牛津大学",
    "scale": "100+ 任务",
    "robotType": ["仿真"],
    "task": ["操作", "装配"],
    "modality": ["视觉", "深度", "点云"],
    "type": "open",
    "links": {
      "official": "https://sites.google.com/view/rlbench",
      "paper": "https://arxiv.org/abs/1909.12271"
    },
    "notes": "任务多样，视觉信息丰富，适合模仿学习研究。"
  },
  {
    "id": "maniskill2",
    "name": "ManiSkill2",
    "institution": "斯坦福大学、清华大学",
    "scale": "仿真大规模操纵",
    "robotType": ["机械臂", "仿真"],
    "task": ["操作"],
    "modality": ["点云", "视觉"],
    "type": "open",
    "links": {
      "official": "https://maniskill2.github.io",
      "paper": "https://arxiv.org/abs/2304.04442"
    },
    "notes": "基于 SAPIEN 的高质量仿真数据，支持点云输入。"
  },
  {
    "id": "robosuite",
    "name": "RoboSuite",
    "institution": "UC Berkeley",
    "scale": "多个仿真环境",
    "robotType": ["机械臂", "仿真"],
    "task": ["操作", "装配"],
    "modality": ["仿真状态", "视觉"],
    "type": "open",
    "links": {
      "official": "https://robosuite.ai",
      "paper": "https://arxiv.org/abs/2209.12066"
    },
    "notes": "模块化仿真框架，适合算法开发和基准测试。"
  },
  {
    "id": "calvin",
    "name": "CALVIN",
    "institution": "Bosch Center for AI、图宾根大学",
    "scale": "居家长期操纵",
    "robotType": ["移动机器人"],
    "task": ["操作", "交互"],
    "modality": ["视觉", "语言"],
    "type": "open",
    "links": {
      "official": "https://ut-ras.github.io/CALVIN",
      "paper": "https://arxiv.org/abs/2207.04744"
    },
    "notes": "语言条件 long-horizon 任务，适合指令理解和执行研究。"
  },
  {
    "id": "ario",
    "name": "ARIO",
    "institution": "Carnegie Mellon University",
    "scale": "居家场景操纵数据集",
    "robotType": ["机械臂"],
    "task": ["操作", "家居"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://ario-dataset.github.io"
    },
    "notes": "大规模日常操纵数据，适合泛化策略学习。"
  },
  {
    "id": "ocrl",
    "name": "OCRL",
    "institution": "UC Berkeley",
    "scale": "持续学习数据集",
    "robotType": ["机械臂"],
    "task": ["操作", "抓取"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://sites.google.com/view/oclr/",
      "paper": "https://arxiv.org/abs/2110.13178"
    },
    "notes": "持续学习 benchmark，适合灾难性遗忘研究。"
  },
  {
    "id": "rt-1-data",
    "name": "RT-1 Data",
    "institution": "Google DeepMind",
    "scale": "130K 演示",
    "robotType": ["移动机器人"],
    "task": ["操作", "家居"],
    "modality": ["视觉", "本体状态", "动作"],
    "type": "open",
    "links": {
      "official": "https://robotics-transformer.github.io",
      "paper": "https://arxiv.org/abs/2212.05680"
    },
    "notes": "RT-1 训练数据，适合真实机器人策略学习。"
  },
  {
    "id": "robocat-data",
    "name": "RoboCat Data",
    "institution": "Google DeepMind",
    "scale": "多机器人操纵数据",
    "robotType": ["机械臂", "移动机器人"],
    "task": ["操作"],
    "modality": ["视觉", "动作"],
    "type": "open",
    "links": {
      "official": "https://deepmind.google/blog/robocat",
      "paper": "https://arxiv.org/abs/2306.11706"
    },
    "notes": "自我提升的机器人智能体数据，适合多任务学习。"
  },
  {
    "id": "t-diffusion-data",
    "name": "T-Diffusion Data",
    "institution": "Google DeepMind",
    "robotType": ["机械臂"],
    "task": ["操作", "交互"],
    "modality": ["视觉", "动作"],
    "type": "open",
    "links": {
      "official": "https://deepmind.google/blog/t-diffusion",
      "paper": "https://arxiv.org/abs/2309.12664"
    },
    "notes": "扩散模型在机器人操纵中的应用，适合动作生成研究。"
  },
  {
    "id": "agibot-world",
    "name": "AgiBot World",
    "institution": "智元机器人（AgiBot）",
    "scale": "100W+ 轨迹，2976 小时",
    "robotType": ["人形机器人"],
    "task": ["操作", "家居"],
    "modality": ["视觉", "力控", "本体状态"],
    "type": "open",
    "links": {
      "official": "https://agibot-world.com",
      "paper": "https://arxiv.org/abs/2412.14154"
    },
    "notes": "国内最大人形开源数据集，覆盖真实场景丰富，规模化程度高。"
  },
  {
    "id": "robomind",
    "name": "RoboMIND",
    "institution": "北京人形机器人创新中心",
    "scale": "6W+ 分钟真机数据",
    "robotType": ["人形机器人"],
    "task": ["操作"],
    "modality": ["视觉", "力控", "本体状态"],
    "type": "open",
    "links": {
      "official": "http://www.robomind.cn/",
      "paper": "https://arxiv.org/abs/2410.10000"
    },
    "notes": "国内统一人形数据协议基准，多构型机器人数据。"
  },
  {
    "id": "damo-solo",
    "name": "DAMO-SOLO",
    "institution": "阿里达摩院",
    "robotType": ["机械臂"],
    "task": ["操作"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://damo.alibaba.com/"
    },
    "notes": "阿里达摩院机器人数据集，适合工业操纵研究。"
  },
  {
    "id": "gr-1-dataset",
    "name": "GR-1 Dataset",
    "institution": "傅利叶智能（Fourier Intelligence）",
    "scale": "人形机器人数据集",
    "robotType": ["人形机器人"],
    "task": ["操作"],
    "modality": ["视觉", "力控", "本体状态"],
    "type": "partial",
    "links": {
      "official": "https://www.fourier-intelligence.com/"
    },
    "notes": "傅利叶 GR-1 人形机器人数据，适合双足运动和操纵研究。"
  },
  {
    "id": "h1-dataset",
    "name": "H1 Dataset",
    "institution": "宇树科技（Unitree）",
    "robotType": ["人形机器人"],
    "task": ["操作"],
    "modality": ["本体状态"],
    "type": "open",
    "links": {
      "official": "https://www.unitree.com/"
    },
    "notes": "宇树 H1 人形机器人数据，适合运动控制研究。"
  },
  {
    "id": "isaac-sim",
    "name": "Isaac Sim Dataset",
    "institution": "NVIDIA",
    "robotType": ["仿真"],
    "task": ["操作"],
    "modality": ["视觉", "点云", "深度"],
    "type": "partial",
    "links": {
      "official": "https://developer.nvidia.com/isaac-sim"
    },
    "notes": "NVIDIA 高保真仿真环境，适合 sim-to-real 研究。"
  },
  {
    "id": "habitat",
    "name": "Habitat",
    "institution": "Meta AI",
    "robotType": ["仿真"],
    "task": ["导航"],
    "modality": ["视觉", "深度"],
    "type": "open",
    "links": {
      "official": "https://aihabitat.org",
      "paper": "https://arxiv.org/abs/1904.01201"
    },
    "notes": "大规模室内导航 benchmark，支持 Gibson、Matterport3D 等场景。"
  },
  {
    "id": "igibson",
    "name": "iGibson",
    "institution": "斯坦福大学",
    "robotType": ["仿真"],
    "task": ["导航", "操作", "家居"],
    "modality": ["视觉", "深度", "物理"],
    "type": "open",
    "links": {
      "official": "https://stanfordvl.github.io/igibson",
      "paper": "https://arxiv.org/abs/2010.08628"
    },
    "notes": "交互式家庭仿真环境，支持物理交互。"
  },
  {
    "id": "sapien",
    "name": "SAPIEN",
    "institution": "斯坦福大学、上海交通大学",
    "robotType": ["仿真"],
    "task": ["操作"],
    "modality": ["视觉", "点云"],
    "type": "open",
    "links": {
      "official": "https://sapien.ucsd.edu",
      "paper": "https://arxiv.org/abs/2110.07115"
    },
    "notes": "PartNet-Mobility 物体模型，支持高质量部件级操纵。"
  },
  {
    "id": "fmtc",
    "name": "FMTC",
    "institution": "Carnegie Mellon University",
    "robotType": ["仿真"],
    "task": ["操作"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://fmbench.github.io"
    },
    "notes": "基础模型 benchmark，适合评估 VLA 等模型。"
  },
  {
    "id": "coppeliasim",
    "name": "CoppeliaSim",
    "institution": "Coppelia Robotics",
    "robotType": ["仿真"],
    "task": ["操作"],
    "modality": ["视觉"],
    "type": "open",
    "links": {
      "official": "https://www.coppeliarobotics.com/"
    },
    "notes": "跨平台机器人仿真器，适合教育和研究。"
  },
  {
    "id": "tactiletoolbox",
    "name": "TactileToolbox",
    "institution": "多个高校联合",
    "robotType": ["触觉传感"],
    "task": ["操作"],
    "modality": ["触觉"],
    "type": "open",
    "links": {
      "official": "https://tactile-toolbox.github.io"
    },
    "notes": "统一触觉数据格式工具箱，适合触觉学习研究。"
  },
  {
    "id": "digit-dataset",
    "name": "DIGIT Dataset",
    "institution": "MIT",
    "robotType": ["触觉传感"],
    "task": ["操作"],
    "modality": ["触觉"],
    "type": "open",
    "links": {
      "official": "https://digit.ml",
      "paper": "https://arxiv.org/abs/1905.04128"
    },
    "notes": "DIGIT 触觉传感器数据集，适合视觉-触觉融合。"
  },
  {
    "id": "tactip-datasets",
    "name": "TacTip Datasets",
    "institution": "布里斯托大学",
    "robotType": ["触觉传感"],
    "task": ["操作"],
    "modality": ["触觉"],
    "type": "open",
    "links": {
      "official": "http://tactile.fandom.com/wiki/TacTip"
    },
    "notes": "TacTip GelTip 系列传感器数据，适合主动触觉研究。"
  },
  {
    "id": "softmanip",
    "name": "SoftManip",
    "institution": "多个高校联合",
    "robotType": ["触觉传感"],
    "task": ["操作"],
    "modality": ["视觉", "触觉"],
    "type": "open",
    "links": {
      "official": "http://softmanipulation.com/"
    },
    "notes": "软体机器人操纵数据，适合柔性物体处理研究。"
  },
  {
    "id": "tesla-optimus",
    "name": "Tesla Optimus Data",
    "institution": "特斯拉（Tesla）",
    "robotType": ["人形机器人"],
    "task": ["操作", "装配"],
    "type": "closed",
    "links": {
      "official": "https://www.tesla.com/optimus"
    },
    "notes": "特斯拉 Optimus 人形机器人数据，实际使用需联系特斯拉。"
  },
  {
    "id": "boston-dynamics",
    "name": "Boston Dynamics Data",
    "institution": "Boston Dynamics",
    "robotType": ["四足机器人", "人形机器人"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.bostondynamics.com/"
    },
    "notes": "波士顿动力机器人数据，商业合作可获取。"
  },
  {
    "id": "unitree-h1-internal",
    "name": "Unitree H1 内部数据",
    "institution": "宇树科技（Unitree）",
    "robotType": ["人形机器人"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.unitree.com/h1/"
    },
    "notes": "宇树 H1 人形机器人内部数据，合作可获取。"
  },
  {
    "id": "ubtech-walker",
    "name": "优必选 Walker 数据集",
    "institution": "优必选（UBTech）",
    "robotType": ["人形机器人"],
    "task": ["操作", "交互"],
    "type": "closed",
    "links": {
      "official": "https://www.ubtrobot.com/"
    },
    "notes": "优必选 Walker 系列数据，商业合作可获取。"
  },
  {
    "id": "xiaomi-cyberone",
    "name": "小米 CyberOne 数据",
    "institution": "小米",
    "robotType": ["人形机器人"],
    "task": ["交互"],
    "type": "closed",
    "links": {
      "official": "https://www.mi.com/"
    },
    "notes": "小米 CyberOne 数据，实际使用需联系小米。"
  },
  {
    "id": "narwal-navigation",
    "name": "云鲸导航数据",
    "institution": "云鲸智能",
    "robotType": ["移动机器人"],
    "task": ["导航"],
    "type": "closed",
    "links": {
      "official": "https://www.narwal.com/"
    },
    "notes": "云鲸扫地机器人 SLAM 和导航数据。"
  },
  {
    "id": "ecovacs-slam",
    "name": "科沃斯 SLAM 数据",
    "institution": "科沃斯（Ecovacs）",
    "robotType": ["移动机器人"],
    "task": ["导航"],
    "type": "closed",
    "links": {
      "official": "https://www.ecovacs.com/"
    },
    "notes": "科沃斯家庭服务机器人 SLAM 数据。"
  },
  {
    "id": "deepmind-robotics-internal",
    "name": "Google DeepMind Robotics 内部数据",
    "institution": "Google DeepMind",
    "robotType": ["多机型"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://deepmind.google/robots/"
    },
    "notes": "DeepMind 机器人研究数据，部分通过学术合作可获取。"
  },
  {
    "id": "microsoft-embodied",
    "name": "Microsoft Embodied AI Data",
    "institution": "Microsoft",
    "robotType": ["多机型"],
    "task": ["交互"],
    "type": "closed",
    "links": {
      "official": "https://www.microsoft.com/"
    },
    "notes": "微软具身智能研究数据，学术合作可获取部分。"
  },
  {
    "id": "nvidia-isaac-private",
    "name": "NVIDIA Isaac 私有数据",
    "institution": "NVIDIA",
    "robotType": ["仿真"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.nvidia.com/isaac"
    },
    "notes": "NVIDIA Isaac 仿真平台私有数据，商业合作可获取。"
  },
  {
    "id": "huawei-embodied",
    "name": "华为具身智能数据",
    "institution": "华为",
    "robotType": ["人形机器人"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.huawei.com/"
    },
    "notes": "华为具身智能研究数据，合作可获取。"
  },
  {
    "id": "baidu-robot-learning",
    "name": "百度机器人学习数据",
    "institution": "百度",
    "robotType": ["机械臂", "移动机器人"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.baidu.com/"
    },
    "notes": "百度机器人学习研究数据。"
  },
  {
    "id": "tencent-robotics-x",
    "name": "腾讯 Robotics X 数据",
    "institution": "腾讯",
    "robotType": ["多机型"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.tencent.com/"
    },
    "notes": "腾讯 Robotics X 实验室数据。"
  },
  {
    "id": "sensetime-robot",
    "name": "商汤绝影机器人数据",
    "institution": "商汤科技（SenseTime）",
    "robotType": ["人形机器人", "移动机器人"],
    "task": ["操作"],
    "type": "closed",
    "links": {
      "official": "https://www.sensetime.com/"
    },
    "notes": "商汤绝影具身智能数据。"
  },
  {
    "id": "graspnet",
    "name": "GraspNet-1Billion",
    "institution": "清华大学",
    "scale": "10 亿+ 抓取标注",
    "robotType": ["机械臂"],
    "task": ["抓取"],
    "modality": ["视觉", "深度", "点云"],
    "type": "open",
    "links": {
      "official": "https://graspnet.net"
    },
    "notes": "超大规模抓取检测数据集。"
  },
  {
    "id": "dexnet",
    "name": "DexNet 2.0",
    "institution": "UC Berkeley",
    "scale": "670 万抓取点云",
    "robotType": ["机械臂"],
    "task": ["抓取"],
    "modality": ["视觉", "深度"],
    "type": "open",
    "links": {
      "official": "https://berkeleyautomation.github.io/dex-net/"
    },
    "notes": "抓取姿态规划经典数据集。"
  },
  {
    "id": "gibson",
    "name": "Gibson",
    "institution": "斯坦福大学",
    "robotType": ["仿真"],
    "task": ["导航"],
    "modality": ["视觉", "深度"],
    "type": "open",
    "links": {
      "official": "http://gibsonenv.stanford.edu"
    },
    "notes": "真实场景导航仿真环境。"
  },
  {
    "id": "matterport3d",
    "name": "Matterport3D",
    "institution": "Matterport",
    "robotType": ["仿真"],
    "task": ["导航"],
    "modality": ["视觉", "深度"],
    "type": "open",
    "links": {
      "official": "https://niessner.github.io/Matterport/"
    },
    "notes": "大规模室内场景数据集，常用于导航研究。"
  },
  {
    "id": "robonat",
    "name": "RoboNat",
    "institution": "上海交通大学",
    "robotType": ["机械臂"],
    "task": ["交互", "操作"],
    "modality": ["视觉", "语言"],
    "type": "open",
    "links": {
      "official": "https://robonat.github.io"
    },
    "notes": "自然语言交互机器人数据集。"
  }
]
```

- [ ] **Step 2: Validate JSON syntax**

```bash
node -e "JSON.parse(require('fs').readFileSync('docs/data/datasets.json','utf8')); console.log('Valid JSON, ' + JSON.parse(require('fs').readFileSync('docs/data/datasets.json','utf8')).length + ' datasets')"
```

Expected: `Valid JSON, 49 datasets`

- [ ] **Step 3: Commit**

```bash
git add docs/data/datasets.json
git commit -m "feat: add centralized datasets.json with 49 entries
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Create VitePress theme extension to register global components

**Files:**
- Create: `docs/.vitepress/theme/index.js`

- [ ] **Step 1: Create theme/index.js**

```js
import DefaultTheme from 'vitepress/theme'
import DatasetCard from './components/DatasetCard.vue'
import DatasetList from './components/DatasetList.vue'
import DatasetCategory from './components/DatasetCategory.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DatasetCard', DatasetCard)
    app.component('DatasetList', DatasetList)
    app.component('DatasetCategory', DatasetCategory)
  }
}
```

- [ ] **Step 2: Create component placeholder files to verify registration**

```bash
mkdir -p docs/.vitepress/theme/components
```

- [ ] **Step 3: Verify dev server starts without errors**

```bash
npm run dev &
sleep 3
curl -s http://localhost:5173/embodiedai-datasets/ | head -20
kill %1 2>/dev/null
```

Expected: Server starts, no component-not-found errors.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/index.js
git commit -m "feat: add VitePress theme extension for global component registration
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Create DatasetCard.vue component

**Files:**
- Create: `docs/.vitepress/theme/components/DatasetCard.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup>
const props = defineProps({
  dataset: {
    type: Object,
    required: true
  }
})

const typeLabel = {
  open: '🟢 开源',
  partial: '🟡 部分开源',
  apply: '🟠 可申请',
  closed: '🔴 闭源'
}

const typeClass = {
  open: 'type-open',
  partial: 'type-partial',
  apply: 'type-apply',
  closed: 'type-closed'
}
</script>

<template>
  <div class="dataset-card">
    <div class="card-header">
      <h3>{{ dataset.name }}</h3>
      <span :class="['type-badge', typeClass[dataset.type]]">
        {{ typeLabel[dataset.type] }}
      </span>
    </div>
    <table class="card-table">
      <tbody>
        <tr v-if="dataset.institution">
          <td class="label">机构</td>
          <td>{{ dataset.institution }}</td>
        </tr>
        <tr v-if="dataset.scale">
          <td class="label">规模</td>
          <td>{{ dataset.scale }}</td>
        </tr>
        <tr v-if="dataset.robotType?.length">
          <td class="label">机器人类型</td>
          <td>
            <span v-for="rt in dataset.robotType" :key="rt" class="tag">{{ rt }}</span>
          </td>
        </tr>
        <tr v-if="dataset.task?.length">
          <td class="label">任务</td>
          <td>
            <span v-for="t in dataset.task" :key="t" class="tag">{{ t }}</span>
          </td>
        </tr>
        <tr v-if="dataset.modality?.length">
          <td class="label">数据模态</td>
          <td>{{ dataset.modality.join('、') }}</td>
        </tr>
        <tr v-if="dataset.links?.official || dataset.links?.paper">
          <td class="label">链接</td>
          <td>
            <a v-if="dataset.links?.official" :href="dataset.links.official" target="_blank" rel="noopener">官方链接</a>
            <template v-if="dataset.links?.official && dataset.links?.paper"> | </template>
            <a v-if="dataset.links?.paper" :href="dataset.links.paper" target="_blank" rel="noopener">论文</a>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="dataset.notes" class="card-notes">
      {{ dataset.notes }}
    </div>
  </div>
</template>

<style scoped>
.dataset-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1rem 0;
  background: var(--vp-c-bg-soft);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.type-badge {
  font-size: 0.8rem;
  padding: 2px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.type-open {
  background: #e6f7e6;
  color: #2d8a2d;
}

.type-partial {
  background: #fff8e1;
  color: #b8860b;
}

.type-apply {
  background: #fff3e0;
  color: #e65100;
}

.type-closed {
  background: #fce4e4;
  color: #c62828;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.card-table td {
  padding: 0.35rem 0.5rem;
  border: none;
  vertical-align: top;
}

.card-table td.label {
  font-weight: 600;
  white-space: nowrap;
  width: 90px;
  color: var(--vp-c-text-2);
}

.tag {
  display: inline-block;
  background: var(--vp-c-bg-alt);
  padding: 1px 8px;
  border-radius: 4px;
  margin: 0 4px 4px 0;
  font-size: 0.8rem;
}

.card-notes {
  margin-top: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: var(--vp-c-bg-alt);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 4px 4px 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.card-table a {
  font-size: 0.85rem;
}
</style>
```

- [ ] **Step 2: Verify the component loads in dev server**

```bash
npm run dev &
sleep 3
echo "Dev server started - test by visiting http://localhost:5173/embodiedai-datasets/"
```

- [ ] **Step 3: Commit**

```bash
git add docs/.vitepress/theme/components/DatasetCard.vue
git commit -m "feat: add DatasetCard component
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Create DatasetList.vue component with search and tag filtering

**Files:**
- Create: `docs/.vitepress/theme/components/DatasetList.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup>
import { ref, computed } from 'vue'
import datasets from '../../../data/datasets.json'

const searchQuery = ref('')
const selectedRobotTypes = ref(new Set())
const selectedTasks = ref(new Set())
const selectedTypes = ref(new Set())

// Extract unique values for tag buttons
const allRobotTypes = computed(() =>
  [...new Set(datasets.flatMap(d => d.robotType || []))].sort()
)
const allTasks = computed(() =>
  [...new Set(datasets.flatMap(d => d.task || []))].sort()
)
const allTypes = computed(() =>
  [...new Set(datasets.map(d => d.type))]
)

const typeLabel = {
  open: '🟢 开源',
  partial: '🟡 部分开源',
  apply: '🟠 可申请',
  closed: '🔴 闭源'
}

const filteredDatasets = computed(() => {
  return datasets.filter(d => {
    // Text search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const haystack = [d.name, d.institution, d.notes || ''].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    // Robot type filter
    if (selectedRobotTypes.value.size > 0) {
      if (!d.robotType?.some(rt => selectedRobotTypes.value.has(rt))) return false
    }
    // Task filter
    if (selectedTasks.value.size > 0) {
      if (!d.task?.some(t => selectedTasks.value.has(t))) return false
    }
    // Type filter
    if (selectedTypes.value.size > 0) {
      if (!selectedTypes.value.has(d.type)) return false
    }
    return true
  })
})

function toggleFilter(set, value) {
  if (set.has(value)) {
    set.delete(value)
  } else {
    set.add(value)
  }
}
</script>

<template>
  <div class="dataset-list">
    <!-- Search -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索数据集名称、机构..."
        class="search-input"
      />
    </div>

    <!-- Tag filters -->
    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">机器人类型：</span>
        <button
          v-for="rt in allRobotTypes"
          :key="rt"
          :class="['filter-tag', { active: selectedRobotTypes.has(rt) }]"
          @click="toggleFilter(selectedRobotTypes, rt)"
        >
          {{ rt }}
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">任务类型：</span>
        <button
          v-for="t in allTasks"
          :key="t"
          :class="['filter-tag', { active: selectedTasks.has(t) }]"
          @click="toggleFilter(selectedTasks, t)"
        >
          {{ t }}
        </button>
      </div>
      <div class="filter-row">
        <span class="filter-label">开放类型：</span>
        <button
          v-for="tp in allTypes"
          :key="tp"
          :class="['filter-tag', { active: selectedTypes.has(tp) }]"
          @click="toggleFilter(selectedTypes, tp)"
        >
          {{ typeLabel[tp] }}
        </button>
      </div>
    </div>

    <!-- Result count -->
    <div class="result-count">
      共 {{ filteredDatasets.length }} 个数据集
    </div>

    <!-- Dataset cards -->
    <DatasetCard
      v-for="ds in filteredDatasets"
      :key="ds.id"
      :dataset="ds"
    />

    <!-- Empty state -->
    <div v-if="filteredDatasets.length === 0" class="empty-state">
      没有匹配的数据集，试试调整筛选条件。
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--vp-c-brand-1);
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-right: 4px;
  white-space: nowrap;
}

.filter-tag {
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tag:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-tag.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.result-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-3);
  font-size: 1rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/theme/components/DatasetList.vue
git commit -m "feat: add DatasetList component with search and tag filters
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Create DatasetCategory.vue component

**Files:**
- Create: `docs/.vitepress/theme/components/DatasetCategory.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup>
import { computed } from 'vue'
import datasets from '../../../data/datasets.json'

const props = defineProps({
  groupBy: {
    type: String,
    required: true,
    validator: (v) => ['robotType', 'task'].includes(v)
  }
})

const groupLabel = {
  robotType: '机器人类型',
  task: '任务类型'
}

const groups = computed(() => {
  const map = new Map()
  for (const ds of datasets) {
    const keys = ds[props.groupBy] || []
    for (const key of keys) {
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ds)
    }
  }
  // Sort groups by key name
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
})
</script>

<template>
  <div class="dataset-category">
    <div class="category-toc">
      <span class="toc-label">快速跳转：</span>
      <a
        v-for="[key] in groups"
        :key="key"
        :href="'#' + encodeURIComponent(key)"
        class="toc-link"
      >
        {{ key }}
      </a>
    </div>

    <section
      v-for="[key, dsList] in groups"
      :key="key"
      :id="key"
      class="category-section"
    >
      <h2>{{ key }}</h2>
      <p class="section-count">{{ dsList.length }} 个数据集</p>
      <DatasetCard
        v-for="ds in dsList"
        :key="ds.id"
        :dataset="ds"
      />
    </section>
  </div>
</template>

<style scoped>
.category-toc {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.toc-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.toc-link {
  padding: 4px 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.15s;
}

.toc-link:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

.category-section {
  margin-bottom: 2rem;
}

.category-section h2 {
  margin-bottom: 0.25rem;
}

.section-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/theme/components/DatasetCategory.vue
git commit -m "feat: add DatasetCategory component for grouped views
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Update datasets/index.md to use DatasetList

**Files:**
- Rewrite: `docs/datasets/index.md`

- [ ] **Step 1: Replace content with component usage**

```markdown
# 全部数据集

::: info 数据集总数
本站已收录 **49** 个具身智能/机器人数据集，包括开源、闭源、可申请等类型。使用搜索框和标签筛选快速定位。
:::

<DatasetList />

---

## 数据集类型说明

| 标识 | 类型 | 说明 |
|------|------|------|
| 🟢 开源 | Open Source | 可自由下载使用 |
| 🟡 部分开源 | Partial Open | 部分数据开源，部分需申请 |
| 🟠 可申请 | Apply Required | 需申请或注册获取 |
| 🔴 闭源 | Closed Source | 不公开，需合作申请 |

::: info 需要帮助？
- 想提交新数据集？→ [提交页面](/submit/)
- 需要更多数据集信息？→ 联系邮箱：embodisets@163.com
:::
```

- [ ] **Step 2: Commit**

```bash
git add docs/datasets/index.md
git commit -m "refactor: replace inline dataset table with DatasetList component
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Update categories/robot/index.md and categories/task/index.md

**Files:**
- Rewrite: `docs/categories/robot/index.md`
- Rewrite: `docs/categories/task/index.md`

- [ ] **Step 1: Rewrite categories/robot/index.md**

```markdown
# 按机器人类型分类

::: tip 说明
按机器人类型浏览数据集，包括人形机器人、机械臂、移动机器人、四足机器人、仿真数据集、触觉传感。
:::

<DatasetCategory groupBy="robotType" />

::: info 继续探索
- [查看所有数据集](/datasets/)
- [按任务类型浏览](/categories/task/)
- [提交新数据集](/submit/)
:::
```

- [ ] **Step 2: Rewrite categories/task/index.md**

```markdown
# 按任务类型分类

::: tip 说明
按任务类型浏览数据集，包括抓取、操作、导航、装配、交互、家居等。
:::

<DatasetCategory groupBy="task" />

::: info 继续探索
- [查看所有数据集](/datasets/)
- [按机器人类型浏览](/categories/robot/)
- [提交新数据集](/submit/)
:::
```

- [ ] **Step 3: Commit**

```bash
git add docs/categories/robot/index.md docs/categories/task/index.md
git commit -m "refactor: replace category pages with DatasetCategory component
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Fix config.js — dead links and cleanup

**Files:**
- Modify: `docs/.vitepress/config.js`

- [ ] **Step 1: Fix config.js**

Change `ignoreDeadLinks: true` to `false`. The sidebar items for category pages now point to the single-page component views, so update anchor links to match the component-generated `id` attributes (which use `encodeURIComponent` for Chinese characters).

```js
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '具身智能数据集导航',
  base: '/embodiedai-datasets/',
  titleTemplate: 'EmbodiedAI Datasets',
  description: '全球具身智能、机器人、人形机器人数据集情报站 | 只做信息汇总 & 申请导航',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'keywords', content: '具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习' }],
    ['meta', { name: 'description', content: '收录全球具身智能、人形机器人、机械臂、移动机器人数据集，只做情报汇总 & 申请导航，助力算法研发' }]
  ],

  themeConfig: {
    logo: '/logo-large.svg',
    siteTitle: '',

    nav: [
      { text: '首页', link: '/' },
      { text: '全部数据集', link: '/datasets/' },
      { text: '按机器人类型', link: '/categories/robot/' },
      { text: '按任务类型', link: '/categories/task/' },
      { text: '提交数据集', link: '/submit/' }
    ],

    sidebar: {
      '/datasets/': [
        {
          text: '数据集分类',
          items: [
            { text: '全部数据集', link: '/datasets/' },
            { text: '按机器人类型', link: '/categories/robot/' },
            { text: '按任务类型', link: '/categories/task/' }
          ]
        }
      ],
      '/categories/': [
        {
          text: '按机器人类型',
          link: '/categories/robot/',
          items: [
            { text: '人形机器人', link: '/categories/robot/#%E4%BA%BA%E5%BD%A2%E6%9C%BA%E5%99%A8%E4%BA%BA' },
            { text: '机械臂', link: '/categories/robot/#%E6%9C%BA%E6%A2%B0%E8%87%82' },
            { text: '移动机器人', link: '/categories/robot/#%E7%A7%BB%E5%8A%A8%E6%9C%BA%E5%99%A8%E4%BA%BA' },
            { text: '四足机器人', link: '/categories/robot/#%E5%9B%9B%E8%B6%B3%E6%9C%BA%E5%99%A8%E4%BA%BA' },
            { text: '仿真', link: '/categories/robot/#%E4%BB%BF%E7%9C%9F' },
            { text: '触觉传感', link: '/categories/robot/#%E8%A7%A6%E8%A7%89%E4%BC%A0%E6%84%9F' }
          ]
        },
        {
          text: '按任务类型',
          link: '/categories/task/',
          items: [
            { text: '抓取', link: '/categories/task/#%E6%8A%93%E5%8F%96' },
            { text: '操作', link: '/categories/task/#%E6%93%8D%E4%BD%9C' },
            { text: '导航', link: '/categories/task/#%E5%AF%BC%E8%88%AA' },
            { text: '装配', link: '/categories/task/#%E8%A3%85%E9%85%8D' },
            { text: '交互', link: '/categories/task/#%E4%BA%A4%E4%BA%92' },
            { text: '家居', link: '/categories/task/#%E5%AE%B6%E5%B1%85' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/embodiedai-datasets' }
    ],

    footer: {
      message: '收录全球具身智能、机器人数据集情报，助力算法研发。',
      copyright: 'Copyright © 2024 EmbodiedAI Datasets'
    }
  }
})
```

Key changes:
- Removed `ignoreDeadLinks: true`
- Updated sidebar anchor links to use URL-encoded Chinese characters (matching `encodeURIComponent` output used in DatasetCategory.vue)
- Removed emoji from sidebar items (they don't render reliably as URL fragments)

- [ ] **Step 2: Commit**

```bash
git add docs/.vitepress/config.js
git commit -m "fix: remove ignoreDeadLinks, update sidebar anchors for component-based pages
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Fix submit.md — replace fake form with practical contact

**Files:**
- Rewrite: `docs/submit.md`

- [ ] **Step 1: Rewrite submit.md**

Replace the non-functional HTML form with clean contact information and a mailto link.

```markdown
# 提交数据集

::: tip 欢迎提交
欢迎提交数据集信息，我们审核后收录到导航站。
:::

## 提交方式

### 邮件提交

发送邮件至 **[embodisets@163.com](mailto:embodisets@163.com)**

请包含以下信息：

| 字段 | 必填 | 说明 |
|------|------|------|
| 数据集名称 | ✅ | 官方名称 |
| 机构 | ✅ | 发布机构/公司 |
| 规模 | ⭕ | 轨迹数/小时/场景数等 |
| 机器人类型 | ⭕ | 人形/机械臂/移动/四足/仿真/触觉 |
| 任务类型 | ⭕ | 抓取/操作/导航/装配/交互/家居 |
| 数据模态 | ⭕ | 视觉/力控/点云/触觉等 |
| 类型 | ✅ | 开源/部分开源/可申请/闭源 |
| 官方链接 | ✅ | 官网或 GitHub |
| 论文链接 | ⭕ | 有则提供 |
| 备注 | ⭕ | 一句话点评 |

### GitHub Issues

在 [GitHub 仓库](https://github.com/embodiedai-datasets/embodiedai-datasets) 提交 Issue。

---

## 常见问题

### Q: 提交后多久审核？
A: 我们会在 3-5 个工作日内审核并回复。

### Q: 可以提交闭源数据集吗？
A: 可以，只要数据集真实存在且有获取渠道。

### Q: 如何更新已有数据集信息？
A: 通过同样方式联系我们，我们会及时更新。

---

::: info 免责声明
- 本网站仅做信息导航，不提供任何数据集下载
- 数据集版权归原机构/作者所有
- 如有版权问题，请联系删除
:::
```

- [ ] **Step 2: Commit**

```bash
git add docs/submit.md
git commit -m "fix: replace non-functional form with mailto link and clear instructions
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 10: Update index.md — fix email and stats

**Files:**
- Modify: `docs/index.md`

- [ ] **Step 1: Update email and stats in index.md**

The two changes needed in `docs/index.md`:

1. Line 80: Change email from `embodisets@163.com` to `embodisets@163.com` (already correct, no change needed)
2. Lines 65-69: Update dataset count to match current data (49 datasets)

Change the stats block:
```markdown
::: tip 最新统计
- **开源数据集**: 32+ 个
- **闭源/可申请**: 15+ 个
- **覆盖机器人类型**: 6 大类
- **任务类型**: 6 种
:::
```

Use Edit to make this change in `docs/index.md`.

- [ ] **Step 2: Commit**

```bash
git add docs/index.md
git commit -m "fix: update dataset stats to reflect current data
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 11: Update README.md — unify email

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Change email in README.md**

Change `submit@embodiedai-data.com` to `embodisets@163.com` on line 98 of README.md.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "fix: unify contact email to embodisets@163.com
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: Build, verify, and finalize

- [ ] **Step 1: Build the project**

```bash
npm run build
```

Expected: Build succeeds with no dead link errors. Output in `docs/.vitepress/dist/`.

- [ ] **Step 2: Verify no dead links**

Check that the build output doesn't contain dead link warnings:

```bash
npm run build 2>&1 | grep -i "dead" && echo "DEAD LINKS FOUND" || echo "No dead links"
```

Expected: `No dead links`

- [ ] **Step 3: Verify all files are tracked**

```bash
git status
```

Ensure all new files are committed and no unexpected files remain.

- [ ] **Step 4: Final commit if needed**

```bash
git status
```

If clean, no commit needed. If there are lingering changes:

```bash
git add -A
git commit -m "chore: finalize data-driven refactor
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Plan Summary

| Task | Action | Files |
|------|--------|-------|
| 1 | Create datasets.json | `docs/data/datasets.json` (new) |
| 2 | Theme extension | `docs/.vitepress/theme/index.js` (new) |
| 3 | DatasetCard component | `docs/.vitepress/theme/components/DatasetCard.vue` (new) |
| 4 | DatasetList component | `docs/.vitepress/theme/components/DatasetList.vue` (new) |
| 5 | DatasetCategory component | `docs/.vitepress/theme/components/DatasetCategory.vue` (new) |
| 6 | Update datasets page | `docs/datasets/index.md` (rewrite) |
| 7 | Update category pages | `docs/categories/robot/index.md`, `docs/categories/task/index.md` (rewrite) |
| 8 | Fix config | `docs/.vitepress/config.js` (modify) |
| 9 | Fix submit page | `docs/submit.md` (rewrite) |
| 10 | Fix index stats | `docs/index.md` (modify) |
| 11 | Fix README email | `README.md` (modify) |
| 12 | Build & verify | — |
