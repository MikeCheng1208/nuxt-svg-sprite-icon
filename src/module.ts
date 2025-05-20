import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import type { ModuleOptions } from './types'
import { generateSprites } from './utils/sprite-generator'

// 安全地將物件轉換為 JSON 字串，特別處理正則表達式問題
function safeStringify(obj: any): string {
  // 移除或轉義可能導致正則表達式錯誤的內容
  return JSON.stringify(obj, (key, value) => {
    // 處理特殊字符，尤其是正則表達式中常見的問題字符
    if (typeof value === 'string') {
      // 轉義可能在正則表達式中產生問題的反斜線、斜線和特殊控制字符
      return value
        .replace(/\\/g, '\\\\')  // 雙重轉義反斜線
        .replace(/\u2028/g, '\\u2028')  // 處理行分隔符
        .replace(/\u2029/g, '\\u2029'); // 處理段落分隔符
    }
    return value;
  }, 2);
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
    
    // 使用 addTemplate 生成 sprite 映射模板
    const spriteMapTemplate = addTemplate({
      filename: 'svg-sprite-map.mjs',
      write: true,
      getContents: async () => {
        const { spriteMap, spriteContent } = await generateSprites(inputPath, outputPath, options)
        
        // 使用安全的 JSON 字串化處理
        return `export const spriteMap = ${safeStringify(spriteMap)}
export const spriteContent = ${safeStringify(spriteContent)}
export const options = ${safeStringify(options)}`
      }
    })
    
    // 註冊虛擬模組 - 使用 nitro:config 鉤子而非直接修改 alias
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#svg-sprite-map'] = `${spriteMapTemplate.dst}`
    })
    
    // 在初始化時確保 sprites 被生成
    nuxt.hooks.hook('ready', async () => {
      await generateSprites(inputPath, outputPath, options)
    })
    
    // 為檔案添加到 nuxt.options.watch 中，讓 Nuxt 內建的 HMR 機制處理
    if (nuxt.options.dev && options.watchFiles) {
      // 使用 Nuxt 內建的監控機制
      const svgPattern = join(inputPath, '**/*.svg');
      if (!nuxt.options.watch) {
        nuxt.options.watch = [];
      }
      nuxt.options.watch.push(svgPattern);
      
      // 監控文件變化
      nuxt.hook('builder:watch', (event, path) => {
        if (path.endsWith('.svg') && path.includes(inputPath)) {
          // 當 SVG 文件變化時，直接重新生成
          void generateSprites(inputPath, outputPath, options).then(() => {
            // 通知有更新但不觸發完整重新構建
            nuxt.callHook('builder:generateApp')
          })
        }
      })
    }
    
    // 建構時生成 sprites
    nuxt.hook('build:before', async () => {
      await generateSprites(inputPath, outputPath, options)
    })
  }
})

export type { ModuleOptions }