import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import type { ModuleOptions } from './types'
import { generateSprites } from './utils/sprite-generator'

/**
 * 安全地將 SVG 內容轉換為 JavaScript 安全的形式
 * 使用來避免在 JavaScript 中直接使用可能會出現語法問題的 SVG 內容
 */
function sanitizeSvgForJs(svg: string): string {
  // 避免用於生成正則表達式的字符
  return svg
    .replace(/\\/g, '\\\\')      // 雙倍轉義反斜線
    .replace(/'/g, "\\'")        // 轉義單引號
    .replace(/"/g, '\\"')        // 轉義雙引號
    .replace(/\u2028/g, '\\u2028') // 轉義行分隔符
    .replace(/\u2029/g, '\\u2029') // 轉義段落分隔符
    .replace(/\//g, '\\/')       // 轉義正斜線，防止被誤認為正則表達式結束
    .replace(/</g, '\\x3C')      // 轉義小於號
    .replace(/>/g, '\\x3E');     // 轉義大於號
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
    
    // 完全避免使用 JSON.stringify 處理 SVG 內容
    const spriteMapTemplate = addTemplate({
      filename: 'svg-sprite-map.mjs',
      write: true,
      getContents: async () => {
        const { spriteMap, spriteContent } = await generateSprites(inputPath, outputPath, options)
        
        // 將 spriteContent 直接寫入為 JavaScript 代碼，避免 JSON.stringify
        let jsContent = '// 此檔案由 nuxt-svg-sprite 模組生成\n\n';
        
        // 處理 spriteMap
        jsContent += `export const spriteMap = ${JSON.stringify(spriteMap, null, 2)};\n\n`;
        
        // 直接處理 spriteContent
        jsContent += 'export const spriteContent = {\n';
        for (const [key, value] of Object.entries(spriteContent)) {
          if (typeof value === 'string') {
            // 將 SVG 內容處理為 JavaScript 安全的字串
            const sanitizedValue = sanitizeSvgForJs(value);
            jsContent += `  "${key}": "${sanitizedValue}",\n`;
          }
        }
        jsContent += '};\n\n';
        
        // 處理 options
        jsContent += `export const options = ${JSON.stringify(options, null, 2)};\n`;
        
        return jsContent;
      }
    })
    
    // 註冊虛擬模組
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