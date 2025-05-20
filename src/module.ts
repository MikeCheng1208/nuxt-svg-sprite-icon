import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import { watch } from 'chokidar'
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
    elementClass: 'icon',
    optimize: false
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    
    // 解析路徑
    const inputPath = nuxt.options.alias[options.input!] || join(nuxt.options.srcDir, options.input!.replace('~/', ''))
    const outputPath = nuxt.options.alias[options.output!] || join(nuxt.options.srcDir, options.output!.replace('~/', ''))
    
    // 註冊組件
    addComponent({
      name: 'SvgIcon',
      filePath: resolve('./runtime/components/SvgIcon.vue')
    })
    
    // 添加插件
    addPlugin(resolve('./runtime/plugins/svg-sprite.client'))
    
    
    // 生成 sprite 映射模板 - 修正這裡
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
    nuxt.options.alias['#svg-sprite-map'] = spriteMapTemplate.dst
    
    // 開發模式下監控檔案變化
    if (nuxt.options.dev) {
      const watcher = watch(join(inputPath, '**/*.svg'), {
        ignoreInitial: true
      })
      
      watcher.on('all', async (event, path) => {
        console.log(`SVG ${event}: ${path}`)
        // 修正：重新生成 SVG sprites 並觸發模板更新
        await generateSprites(inputPath, outputPath, options)
        // 觸發 Nuxt 的模板重新生成鉤子
        nuxt.hooks.callHook('builder:generateApp')
      })
      
      nuxt.hook('close', () => {
        watcher.close()
      })
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