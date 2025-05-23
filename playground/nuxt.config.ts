export default defineNuxtConfig({
  modules: ['../src/module', '@unocss/nuxt'],
  svgSprite: {
    input: '~/assets/svg',
    output: '~/assets/sprite/gen',
    defaultSprite: 'icons',
    elementClass: 'svg-icon',
  },
  devtools: { 
    enabled: true
  }
})