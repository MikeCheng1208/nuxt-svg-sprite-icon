export default defineNuxtConfig({
  modules: ['../src/module', '@unocss/nuxt'],
  svgSprite: {
    input: '~/assets/svg',
    output: '~/assets/sprite/gen',
    defaultSprite: 'icons',
    elementClass: 'icon-sprite'
  },
  devtools: { enabled: true }
})