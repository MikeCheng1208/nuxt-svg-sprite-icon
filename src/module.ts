import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import type { ModuleOptions } from './types'
import { generateSprites } from './utils/sprite-generator'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-svg-sprite',
    configKey: 'svgSprite',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    input: '~/assets/svg',
    output: '~/assets/sprite/gen',
    defaultSprite: 'icons',
    elementClass: 'svg-icon',
    optimize: false,
    watchFiles: false // 預設不監控檔案變化
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    
    // 解析路徑
    const inputPath = nuxt.options.alias[options.input!] || join(nuxt.options.srcDir, options.input!.replace('~/', ''))
    const outputPath = nuxt.options.alias[options.output!] || join(nuxt.options.srcDir, options.output!.replace('~/', ''))
    
    // 註冊組件
    addComponent({
      name: 'SvgIcon',
      filePath: resolve('./runtime/components/SvgIcon.vue'),
      export: 'default',
      chunkName: 'components/svg-icon'
    })
    
    // 添加SVG Sprite插件
    addPlugin({
      src: resolve('./runtime/plugins/svg-sprite.client'),
      mode: 'client'
    })
    
    // 直接緩解 Nuxt DevTools 的計時器問題
    if (nuxt.options.devtools?.enabled) {
      // 暫時禁用 Nuxt DevTools 的自動刷新功能
      // @ts-ignore - 直接設置 Nuxt 內部屬性
      nuxt.options._disableDevtoolsDataRefresh = true;
    }
    
    // 生成 sprite 映射模板
    const spriteMapTemplate = addTemplate({
      filename: 'svg-sprite-map.mjs',
      write: true,
      getContents: async () => {
        try {
          const { spriteMap, spriteContent } = await generateSprites(inputPath, outputPath, options)
          
          return `export const spriteMap = ${JSON.stringify(spriteMap, null, 2)}
export const spriteContent = ${JSON.stringify(spriteContent, null, 2)}
export const options = ${JSON.stringify(options, null, 2)}`
        } catch (error) {
          console.warn('Failed to generate sprites:', error)
          return `export const spriteMap = {}
export const spriteContent = {}
export const options = ${JSON.stringify(options, null, 2)}`
        }
      }
    })
    
    // 註冊虛擬模組
    // @ts-ignore
    nuxt.options.alias['#svg-sprite-map'] = spriteMapTemplate.dst
    
    // 為檔案添加到 nuxt.options.watch 中，讓 Nuxt 內建的 HMR 機制處理
    if (nuxt.options.dev && options.watchFiles) {
      // 使用 Nuxt 內建的監控機制
      const svgPattern = join(inputPath, '**/*.svg');
      if (!nuxt.options.watch) {
        nuxt.options.watch = [];
      }
      nuxt.options.watch.push(svgPattern);
      
      // 註冊 builder:watch 事件處理
      nuxt.hook('builder:watch', (event, path) => {
        if (path.endsWith('.svg') && path.includes(inputPath)) {
          // 當 SVG 檔案變化時只重新生成 sprites，不觸發完整重新建構
          setTimeout(async () => {
            try {
              await generateSprites(inputPath, outputPath, options);
              // 通知有更新但不觸發完整重新構建
              nuxt.callHook('builder:generateApp');
            } catch (error) {
              console.warn('重新生成 SVG Sprites 失敗:', error);
            }
          }, 100); // 小延遲避免連續觸發
        }
      });
    }
    
    // 建構時生成 sprites
    nuxt.hook('build:before', async () => {
      try {
        await generateSprites(inputPath, outputPath, options)
      } catch (error) {
        console.warn('Failed to generate sprites during build:', error)
      }
    })
  }
})

export type { ModuleOptions }