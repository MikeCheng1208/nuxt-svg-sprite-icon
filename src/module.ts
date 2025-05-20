import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import { watch } from 'chokidar'
import type { ModuleOptions } from './types'
import { generateSprites } from './utils/sprite-generator'

// 添加去抖(debounce)功能，防止短時間內觸發多次
function debounce(fn: Function, wait: number = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      // @ts-ignore
      fn.apply(this, args);
      timeout = null;
    }, wait);
  };
}

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
      filePath: resolve('./runtime/components/SvgIcon.vue'),
      export: 'default',
      chunkName: 'components/svg-icon'
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
      
      // 去抖處理SVG文件變更，避免過於頻繁觸發
      const debouncedGenerateSprites = debounce(async (event: string, path: string) => {
        console.log(`SVG ${event}: ${path}`)
        // 只重新生成sprites，不觸發任何可能導致計時器衝突的鉤子
        try {
          await generateSprites(inputPath, outputPath, options)
          // 不去觸發Nuxt的生命週期鉤子，避免計時器衝突
          // 用戶可以重新整理頁面，或使用插件提供的refreshSvgSprite方法來手動更新
        } catch (error) {
          console.warn('Failed to regenerate sprites:', error)
        }
      }, 500);
      
      watcher.on('all', debouncedGenerateSprites)
      
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