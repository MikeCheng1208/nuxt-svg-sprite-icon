export default defineNuxtConfig({
  modules: ['../src/module', '@unocss/nuxt'],
  svgSprite: {
    input: '~/assets/svg',
    output: '~/assets/sprite/gen',
    defaultSprite: 'icons',
    elementClass: 'svg-icon'
  },
  devtools: { 
    enabled: true,
    timeline: {
      enabled: false // 關閉timeline功能以避免Timer計時器問題
    }
  },
  // 關閉debug輸出以減少console錯誤
  debug: false
})