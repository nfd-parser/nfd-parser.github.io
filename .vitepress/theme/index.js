import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 修复导航栏标题显示
    if (typeof window !== 'undefined') {
      // 在客户端运行时修复标题
      const fixNavTitle = () => {
        const titleElements = document.querySelectorAll('.VPNavBarTitle .title')
        titleElements.forEach(el => {
          if (el && el.textContent && el.textContent.includes('VitePress')) {
            el.textContent = 'NFD Parser'
          }
        })
      }
      
      // 页面加载后执行
      router.onAfterRouteChanged = () => {
        setTimeout(fixNavTitle, 100)
      }
      
      // 初始加载时执行
      setTimeout(fixNavTitle, 100)
    }
  }
}