import { defineNuxtModule, addComponent, addPlugin, createResolver, addTemplate, useLogger } from '@nuxt/kit'
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
    name: 'nuxt-svg-sprite-icon',
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
    optimize: false
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const logger = useLogger('nuxt-svg-sprite-icon')
    
    // 解析和驗證路徑
    const inputPath = resolveInputPath(options.input!, nuxt)
    const outputPath = resolveOutputPath(options.output!, nuxt)
    
    // 驗證配置
    validateOptions(options, logger)
    
    let spriteContent: Record<string, string> = {}
    
    // 生成 sprites 的函數
    const generateSpritesWithErrorHandling = async () => {
      try {
        const result = await generateSprites(inputPath, outputPath, options)
        spriteContent = result.spriteContent
        logger.success(`Generated ${Object.keys(spriteContent).length} sprite(s)`)
        return result
      } catch (error) {
        logger.error('Failed to generate sprites:', error)
        spriteContent = {}
        return { spriteMap: {}, spriteContent: {} }
      }
    }
    
    // 初始生成（僅在開發模式或構建時）
    if (nuxt.options.dev || nuxt.options._build) {
      await generateSpritesWithErrorHandling()
    }
    
    // 創建優化的 SVG 模板
    const svgTemplate = addTemplate({
      filename: 'svg-sprite-data.mjs',
      write: true,
      getContents: () => generateSpriteModule(spriteContent, options)
    })
    
    // 創建類型聲明文件
    addTemplate({
      filename: 'svg-sprite-data.d.ts',
      write: true,
      getContents: () => generateTypeDeclaration()
    })
    
    // 註冊組件
    addComponent({
      name: 'SvgIcon',
      filePath: resolve('./runtime/components/SvgIcon.vue'),
      export: 'default',
      chunkName: 'components/svg-icon'
    })
    
    // 註冊客戶端插件
    addPlugin({
      src: resolve('./runtime/plugins/svg-sprite.client'),
      mode: 'client'
    })
    
    // 設置虛擬模組別名
    nuxt.options.alias['#svg-sprite-data'] = svgTemplate.dst
    
    // 構建時重新生成
    nuxt.hook('build:before', async () => {
      if (!nuxt.options.dev) {
        await generateSpritesWithErrorHandling()
      }
    })
  }
})

/**
 * 解析輸入路徑
 */
function resolveInputPath(input: string, nuxt: any): string {
  return nuxt.options.alias[input] || join(nuxt.options.srcDir, input.replace('~/', ''))
}

/**
 * 解析輸出路徑
 */
function resolveOutputPath(output: string, nuxt: any): string {
  return nuxt.options.alias[output] || join(nuxt.options.srcDir, output.replace('~/', ''))
}

/**
 * 驗證選項
 */
function validateOptions(options: ModuleOptions, logger: any): void {
  if (!options.input) {
    logger.warn('Input path is not specified, using default: ~/assets/svg')
  }
  
  if (!options.defaultSprite) {
    logger.warn('Default sprite name is not specified, using default: icons')
  }
  
  if (options.optimize && !options.svgoOptions) {
    logger.info('SVG optimization enabled without custom options, using defaults')
  }
}

/**
 * 生成 sprite 模組內容（優化版本）
 */
function generateSpriteModule(spriteContent: Record<string, string>, options: ModuleOptions): string {
  const contentEntries = Object.entries(spriteContent)
  
  if (contentEntries.length === 0) {
    return `export const spriteContent = {};\nexport const options = ${JSON.stringify(options, null, 2)};`
  }
  
  // 使用陣列 join 而非字串拼接以提升效能
  const contentLines = contentEntries.map(([key, content]) => 
    `  "${escapeKey(key)}": \`${escapeSvgContent(content)}\``
  )
  
  return [
    'export const spriteContent = {',
    contentLines.join(',\n'),
    '};',
    '',
    `export const options = ${JSON.stringify(options, null, 2)};`
  ].join('\n')
}

/**
 * 轉義 SVG 內容
 */
function escapeSvgContent(svg: string): string {
  return svg
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
}

/**
 * 轉義物件鍵
 */
function escapeKey(key: string): string {
  return key.replace(/"/g, '\\"')
}

/**
 * 生成類型聲明
 */
function generateTypeDeclaration(): string {
  return `declare module '#svg-sprite-data' {
  export const spriteContent: Record<string, string>;
  export const options: import('./types').ModuleOptions;
}`
}

export type { ModuleOptions }