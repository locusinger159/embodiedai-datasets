import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '具身智能数据集导航',
  base: '/',
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
      { text: '提交数据集', link: '/submit' }
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
