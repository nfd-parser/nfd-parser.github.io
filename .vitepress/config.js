import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NFD Parser 文档',
  description: '网盘分享链接云解析服务参考文档',
  
  // GitHub Pages 配置
  base: '/',
  
  head: [
    ['meta', { name: 'author', content: 'NFD Parser Team' }],
    ['meta', { property: 'og:title', content: 'NFD Parser 文档' }],
    ['meta', { property: 'og:description', content: '网盘分享链接云解析服务参考文档' }],
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],

  // 主题配置
  themeConfig: {
    // 网站标题和logo
    siteTitle: 'NFD Parser',
    logo: '/logo.svg',
    
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API 参考', link: '/api' },
      { text: '示例', link: '/examples' },
      { 
        text: '更多',
        items: [
          { text: '部署指南', link: '/deployment' },
          { text: '配置文件', link: '/configuration' },
          { text: 'GitHub', link: 'https://github.com/qaiu/netdisk-fast-download' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '介绍',
          collapsed: false,
          items: [
            { text: '什么是 NFD Parser', link: '/guide/what-is-nfd-parser' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '支持的网盘', link: '/guide/supported-platforms' }
          ]
        },
        {
          text: 'API 接口',
          collapsed: false,
          items: [
            { text: 'API 概览', link: '/api' },
            { text: '接口详情', link: '/guide/api-details' },
            { text: '响应格式', link: '/guide/response-format' }
          ]
        },
        {
          text: '使用示例',
          collapsed: false,
          items: [
            { text: '基础用法', link: '/examples' },
            { text: '编程语言示例', link: '/guide/language-examples' },
            { text: '批量处理', link: '/guide/batch-processing' }
          ]
        }
      ],
      '/': [
        {
          text: '开始使用',
          collapsed: false,
          items: [
            { text: '简介', link: '/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: 'API 接口', link: '/api' },
            { text: '使用示例', link: '/examples' }
          ]
        },
        {
          text: '部署与配置',
          collapsed: false,
          items: [
            { text: '部署指南', link: '/deployment' },
            { text: '配置文件', link: '/configuration' }
          ]
        },
        {
          text: '高级用法',
          collapsed: true,
          items: [
            { text: '批量处理', link: '/guide/batch-processing' },
            { text: '错误处理', link: '/guide/error-handling' },
            { text: '性能优化', link: '/guide/performance' }
          ]
        }
      ]
    },

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