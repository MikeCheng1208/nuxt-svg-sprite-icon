export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  modules: ['../src/module', '@unocss/nuxt'],
  svgSprite: {
    input: './app/assets/svg',  // 明確指向 app 資料夾
    output: './app/assets/sprite/gen',
    defaultSprite: 'icons',
    elementClass: 'svg-icon',
  },
  devtools: { 
    enabled: true
  }
})