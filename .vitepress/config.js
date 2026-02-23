import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NFD云解析',
  description: '网盘分享链接云解析服务参考文档',
  
  base: '/',
  
  head: [
    ['meta', { name: 'author', content: 'qaiu' }],
    ['meta', { property: 'og:title', content: 'NFD云解析参考文档' }],
    ['meta', { property: 'og:description', content: '网盘分享链接云解析服务参考文档' }],
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],

  themeConfig: {
    siteTitle: 'NFD云解析',
    logo: '/nfd-logo.png',
    
    nav: [
      { text: '指南', link: '/guide/what-is-nfd-parser' },
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
            { text: 'API 参考', link: '/api' },
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
        }
      ],
      '/': [
        {
          text: '开始使用',
          collapsed: false,
          items: [
            { text: '简介', link: '/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '支持的网盘', link: '/guide/supported-platforms' }
          ]
        },
        {
          text: 'API 与示例',
          collapsed: false,
          items: [
            { text: 'API 参考', link: '/api' },
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
        }
      ]
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换' }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/qaiu/netdisk-fast-download' }
    ],

    footer: {
      message: '基于 <a href="https://github.com/qaiu/netdisk-fast-download">netdisk-fast-download</a> 项目',
      copyright: 'Copyright © 2024-2026 qaiu'
    },

    editLink: {
      pattern: 'https://github.com/nfd-parser/nfd-parser.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    lineNumbers: true
  }
})
