import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '具身智能数据集导航',
  base: '/',
  titleTemplate: 'EmbodiedAI Datasets',
  description: '全球具身智能、机器人、人形机器人数据集情报站 | 只做信息汇总 & 申请导航',
  
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'keywords', content: '具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习' }],
    ['meta', { name: 'description', content: '收录全球具身智能、人形机器人、机械臂、移动机器人数据集，只做情报汇总 & 申请导航，助力算法研发' }]
  ],

  themeConfig: {
    logo: '/logo-large.svg',
    siteTitle: 'EmbodiedAI Datasets',
    
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
            { text: '人形机器人 🤖', link: '/categories/robot/#人形机器人-' },
            { text: '机械臂 🦾', link: '/categories/robot/#机械臂-' },
            { text: '移动机器人 🚗', link: '/categories/robot/#移动机器人-' },
            { text: '四足机器人 🦖', link: '/categories/robot/#四足机器人-' },
            { text: '仿真数据集 🖥️', link: '/categories/robot/#仿真数据集-' },
            { text: '触觉传感 🖐️', link: '/categories/robot/#触觉传感-' }
          ]
        },
        {
          text: '按任务类型',
          link: '/categories/task/',
          items: [
            { text: '抓取 🤏', link: '/categories/task/#抓取-' },
            { text: '操作 🤲', link: '/categories/task/#操作-' },
            { text: '导航 🧭', link: '/categories/task/#导航-' },
            { text: '装配 🔧', link: '/categories/task/#装配-' },
            { text: '交互 💬', link: '/categories/task/#交互-' },
            { text: '家居 🏠', link: '/categories/task/#家居-' }
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
