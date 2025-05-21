import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate } from '@nuxt/kit'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
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
    
    // 確保輸出目錄存在
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true })
    }
    
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
    
    // 生成 sprite 到實際檔案，然後只在虛擬模組中引用路徑
    const generateAndSaveSprites = async () => {
      const { spriteMap, spriteContent } = await generateSprites(inputPath, outputPath, options)
      
      // 將 sprite 內容寫入到實際檔案
      for (const [spriteName, content] of Object.entries(spriteContent)) {
        const spritePath = join(outputPath, `${spriteName}.svg`)
        writeFileSync(spritePath, content, 'utf8')
      }
      
      // 將映射寫入檔案
      const mapPath = join(outputPath, 'sprite-map.json')
      writeFileSync(mapPath, JSON.stringify({
        spriteMap,
        options
      }, null, 2), 'utf8')
      
      return { spriteMap, mapPath }
    }
    
    // 首次生成 sprite
    const { spriteMap, mapPath } = await generateAndSaveSprites()
    
    // 生成一個映射文件，只包含引用
    const mapTemplate = addTemplate({
      filename: 'svg-sprite-map.mjs',
      write: true,
      getContents: async () => {
        return `// 此檔案由 nuxt-svg-sprite 模組生成
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'

// 讀取 sprite 映射檔案
const __dirname = dirname(fileURLToPath(import.meta.url))
const mapPath = join(__dirname, '${mapPath.replace(nuxt.options.buildDir, '').replace(/\\/g, '/')}')
const map = JSON.parse(readFileSync(mapPath, 'utf8'))

// 讀取所有 sprite SVG 檔案
const spriteContent = {}
for (const [spriteName, info] of Object.entries(map.spriteMap)) {
  try {
    const path = join(__dirname, '${outputPath.replace(nuxt.options.buildDir, '').replace(/\\/g, '/')}', \`\${spriteName}.svg\`)
    spriteContent[spriteName] = readFileSync(path, 'utf8')
  } catch (e) {
    console.warn(\`無法讀取 \${spriteName}.svg\`, e)
  }
}

export const spriteMap = map.spriteMap
export const options = map.options
export { spriteContent }
`
      }
    })
    
    // 註冊虛擬模組
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#svg-sprite-map'] = `${mapTemplate.dst}`
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
          // 當 SVG 文件變化時，重新生成
          void generateAndSaveSprites().then(() => {
            // 通知有更新但不觸發完整重新構建
            nuxt.callHook('builder:generateApp')
          })
        }
      })
    }
    
    // 建構時重新生成 sprites
    nuxt.hook('build:before', async () => {
      await generateAndSaveSprites()
    })
  }
})

export type { ModuleOptions }