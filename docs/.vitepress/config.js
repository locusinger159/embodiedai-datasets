import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '具身智能数据集导航',
  base: '/',
  titleTemplate: 'EmbodiedAI Datasets',
  description: '全球具身智能、机器人、人形机器人数据集情报站 | 只做信息汇总 & 申请导航',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/机器人.png' }],
    ['meta', { name: 'keywords', content: '具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习' }],
    ['meta', { name: 'description', content: '收录全球具身智能、人形机器人、机械臂、移动机器人数据集，只做情报汇总 & 申请导航，助力算法研发' }]
  ],

  themeConfig: {
    logo: '/学生bot.png',
    siteTitle: '',

    nav: [
      { text: '首页', link: '/' },
      { text: '全部数据集', link: '/datasets/' },
      { text: '提交数据集', link: '/submit' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/embodiedai-datasets' }
    ],

    footer: {
      message: '收录全球具身智能、机器人数据集情报，助力算法研发。',
      copyright: 'Copyright © 2026 EmbodiedAI Datasets'
    }
  },

  scrollOffset: 64
})
