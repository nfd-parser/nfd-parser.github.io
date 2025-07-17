import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NFD Parser 文档',
  description: '网盘分享链接云解析服务参考文档',
  
  // GitHub Pages 配置
  base: '/',
  
  head: [
    ['meta', { name: 'author', content: 'NFD Parser Team' }],
    ['meta', { property: 'og:title', content: 'NFD Parser 文档' }],
    ['meta', { property: 'og:description', content: '网盘分享链接云解析服务参考文档' }]
  ],

  // 主题配置
  themeConfig: {
    // 网站标题
    siteTitle: 'NFD Parser',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: 'API 文档', link: '/api' },
      { text: '使用示例', link: '/examples' },
      { text: '部署指南', link: '/deployment' },
      { text: '配置管理', link: '/configuration' }
    ],

    // 侧边栏
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '简介', link: '/' },
          { text: 'API 接口', link: '/api' },
          { text: '使用示例', link: '/examples' }
        ]
      },
      {
        text: '部署与配置',
        items: [
          { text: '部署指南', link: '/deployment' },
          { text: '配置管理', link: '/configuration' }
        ]
      }
    ],

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nfd-parser' }
    ],

    // 页脚
    footer: {
      message: '基于 netdisk-fast-download 项目的参考文档',
      copyright: 'Copyright © 2024 NFD Parser Team'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/nfd-parser/nfd-parser.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 添加自定义 markdown 插件
    }
  }
})