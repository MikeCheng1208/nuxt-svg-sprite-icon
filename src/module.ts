import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import type { ModuleOptions } from './types'
import { generateSprites } from './utils/sprite-generator'


declare global {
  const $SvgSpriteData: {
    spriteContent: Record<string, string>;
    options: ModuleOptions;
  }
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
    
    // 生成 SVG Sprites
    const { spriteMap, spriteContent } = await generateSprites(inputPath, outputPath, options)
    
    // 將 SVG 內容安全轉換為 JavaScript 字串
    const escapeSvg = (svg: string) => {
      return svg
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
    }
    
    // 創建一個直接包含 SVG 內容的模板
    const svgTemplate = addTemplate({
      filename: 'svg-sprite-data.mjs',
      write: true,
      getContents: () => {
        // 將 SVG 內容轉換為 JavaScript 字串
        let svgModuleContent = 'export const spriteContent = {\n'
        
        for (const [key, content] of Object.entries(spriteContent)) {
          svgModuleContent += `  "${key}": \`${escapeSvg(content)}\`,\n`
        }
        
        svgModuleContent += '}\n\n'
        svgModuleContent += `export const options = ${JSON.stringify(options, null, 2)}\n`
        
        return svgModuleContent
      }
    })
    
    // 為虛擬模組創建類型宣告文件
    addTemplate({
      filename: 'svg-sprite-data.d.ts',
      write: true,
      getContents: () => `
declare module '#svg-sprite-data' {
  export const spriteContent: Record<string, string>;
  export const options: any;
}
`
    })
    
    // 註冊組件
    addComponent({
      name: 'SvgIcon',
      filePath: resolve('./runtime/components/SvgIcon.vue'),
      export: 'default',
      chunkName: 'components/svg-icon'
    })
    
    // 添加插件
    addPlugin({
      src: resolve('./runtime/plugins/svg-sprite.client'),
      mode: 'client'
    })
    
    // 將 SVG 模板添加到虛擬導入中
    nuxt.options.alias['#svg-sprite-data'] = svgTemplate.dst
    
    // 為檔案添加到 nuxt.options.watch 中，讓 Nuxt 內建的 HMR 機制處理
    if (nuxt.options.dev && options.watchFiles) {
      // 使用 Nuxt 內建的監控機制
      const svgPattern = join(inputPath, '**/*.svg');
      if (!nuxt.options.watch) {
        nuxt.options.watch = [];
      }
      nuxt.options.watch.push(svgPattern);
      
      // 監控文件變化時重新生成
      nuxt.hook('builder:watch', (event, path) => {
        if (path.endsWith('.svg') && path.includes(inputPath)) {
          // 觸發全頁重新載入
          nuxt.callHook('builder:generateApp')
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