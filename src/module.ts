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
    watchFiles: false, // 預設不監控檔案變化
    devtoolsCompat: true, // 新增：啟用 DevTools 兼容模式
    injectDOMContainer: true // 新增：控制是否向 DOM 中注入 SVG 容器
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    
    // 解析路徑
    const inputPath = nuxt.options.alias[options.input!] || join(nuxt.options.srcDir, options.input!.replace('~/', ''))
    const outputPath = nuxt.options.alias[options.output!] || join(nuxt.options.srcDir, options.output!.replace('~/', ''))
    
    // 檢測 Nuxt DevTools 是否啟用
    const hasDevTools = nuxt.options.modules && 
                       (nuxt.options.modules.includes('@nuxt/devtools') || 
                        nuxt.options.modules.some(m => 
                          typeof m === 'object' && m && 'src' in m && m.src === '@nuxt/devtools'
                        ))
    
    // 更新選項，考慮 DevTools 兼容性
    if (hasDevTools && options.devtoolsCompat) {
      // 如果啟用了 DevTools 兼容模式，應用兼容性調整
      console.log('Nuxt DevTools detected, applying compatibility mode for nuxt-svg-sprite-icon')
    }
    
    const { spriteContent } = await generateSprites(inputPath, outputPath, options)
    
    
    const escapeSvg = (svg: string) => {
      return svg
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
    }
    
    // 創建一個直接包含 SVG 的模板
    const svgTemplate = addTemplate({
      filename: 'svg-sprite-data.mjs',
      write: true,
      getContents: () => {
        
        let svgModuleContent = 'export const spriteContent = {\n'
        
        for (const [key, content] of Object.entries(spriteContent)) {
          svgModuleContent += `  "${key}": \`${escapeSvg(content)}\`,\n`
        }
        
        svgModuleContent += '}\n\n'
        // 傳遞修改後的選項
        const exportOptions = {
          ...options,
          _internal: {
            hasDevTools: hasDevTools
          }
        }
        svgModuleContent += `export const options = ${JSON.stringify(exportOptions, null, 2)}\n`
        
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
    
    
    addComponent({
      name: 'SvgIcon',
      filePath: resolve('./runtime/components/SvgIcon.vue'),
      export: 'default',
      chunkName: 'components/svg-icon'
    })
    
    
    addPlugin({
      src: resolve('./runtime/plugins/svg-sprite.client'),
      mode: 'client'
    })
    
    // 將 SVG 模板添加到虛擬導入中
    nuxt.options.alias['#svg-sprite-data'] = svgTemplate.dst
    
    
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