# 具身智能数据集导航

> EmbodiedAI Datasets — 全球具身智能、机器人、人形机器人数据集情报站

## 🚀 快速开始

### 方式一：本地开发

```bash
# 克隆项目
git clone https://github.com/embodiedai-datasets/embodiedai-datasets.git
cd embodiedai-datasets

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 方式二：直接部署到 GitHub Pages

1. Fork 本仓库
2. 在仓库 Settings → Pages 中启用 GitHub Pages
3. 选择 `gh-pages` 分支
4. 访问 `https://yourusername.github.io/embodiedai-datasets`

## 📁 项目结构

```
embodiedai-datasets/
├── docs/
│   ├── .vitepress/
│   │   └── config.js      # VitePress 配置
│   ├── index.md           # 首页
│   ├── datasets/
│   │   └── index.md       # 数据集列表页
│   ├── categories/
│   │   ├── robot/         # 按机器人类型分类
│   │   │   └── index.md
│   │   └── task/          # 按任务类型分类
│   │       └── index.md
│   └── submit.md          # 提交页面
├── public/
│   ├── favicon.svg        # 网站图标
│   └── logo-large.svg     # 大 logo
├── package.json
└── README.md
```

## 🌐 部署到其他平台

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

在 Netlify 上创建新站点，连接到 GitHub 仓库即可。

### 自定义域名

1. 购买域名（如 `embodiedai-data.com`）
2. 在 DNS 设置中添加 CNAME 记录指向你的托管平台
3. 在 VitePress 配置中添加 `base` 路径（如果使用子路径）

## 📝 内容更新

### 添加新数据集

编辑 `docs/datasets/index.md`，按以下格式添加：

```markdown
### 新数据集名称

| 字段 | 内容 |
|------|------|
| **机构** | xxx |
| **规模** | xxx |
| **机器人类型** | xxx |
| **任务** | xxx |
| **数据模态** | xxx |
| **类型** | 🟢 开源 / 🔴 闭源 |
| **官方链接** | [链接](url) |
| **论文** | [论文](url) |

::: tip 备注
一句话点评
:::
```

### 提交数据集页面

用户可以通过以下方式提交数据集：
- 邮件：embodisets@163.com
- GitHub Issues
- 在线表单（`docs/submit.md`）

## 📊 数据集统计

- 🟢 开源数据集：26+ 个
- 🔴 闭源/可申请：14+ 个
- 🤖 覆盖机器人类型：5 大类
- 🎯 任务类型：10+ 种

## 🤝 贡献

欢迎提交新的数据集或改进建议！

1. Fork 本仓库
2. 创建新分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

本项目仅做信息导航，内容版权归原数据集机构/作者所有。

## 📧 联系方式

- 邮箱：embodisets@163.com
- GitHub：[embodiedai-datasets](https://github.com/embodiedai-datasets)

---

**Made with ❤️ for the Embodied AI Community**
