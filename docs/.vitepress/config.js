import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '具身智能数据集导航',
  titleTemplate: 'EmbodiedAI Datasets',
  description: '全球具身智能、机器人、人形机器人数据集情报站 | 只做信息汇总 & 申请导航',
  
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'keywords', content: '具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习' }],
    ['meta', { name: 'description', content: '收录全球具身智能、人形机器人、机械臂、移动机器人数据集，只做情报汇总 & 申请导航，助力算法研发' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
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
            { text: '🤖 人形机器人', link: '/categories/robot/humanoid' },
            { text: '🦾 机械臂', link: '/categories/robot/manipulator' },
            { text: '🚗 移动机器人', link: '/categories/robot/mobile' },
            { text: '🦖 四足机器人', link: '/categories/robot/quadruped' },
            { text: '🖥️ 仿真数据集', link: '/categories/robot/simulation' }
          ]
        }
      ],
      '/categories/': [
        {
          text: '按机器人类型',
          items: [
            { text: '人形机器人', link: '/categories/robot/humanoid' },
            { text: '机械臂', link: '/categories/robot/manipulator' },
            { text: '移动机器人', link: '/categories/robot/mobile' },
            { text: '四足机器人', link: '/categories/robot/quadruped' },
            { text: '仿真数据集', link: '/categories/robot/simulation' }
          ]
        },
        {
          text: '按任务类型',
          items: [
            { text: '抓取', link: '/categories/task/grasp' },
            { text: '操作', link: '/categories/task/manipulation' },
            { text: '导航', link: '/categories/task/navigation' },
            { text: '装配', link: '/categories/task/assembly' },
            { text: '交互', link: '/categories/task/interaction' }
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
