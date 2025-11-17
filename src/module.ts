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
      nuxt: '^3.0.0 || ^4.0.0'
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
    
    
    logger.info(`Input path resolved to: ${inputPath}`)
    logger.info(`Output path resolved to: ${outputPath}`)
    logger.info(`Nuxt compatibility version: ${nuxt.options.future?.compatibilityVersion || 'default'}`)
    
    // 驗證配置
    validateOptions(options, logger)
    
    let spriteContent: Record<string, string> = {}
    
    // 生成 sprites 
    const generateSpritesWithErrorHandling = async () => {
      try {
        logger.info(`Attempting to generate sprites from: ${inputPath}`)
        const result = await generateSprites(inputPath, outputPath, options)
        spriteContent = result.spriteContent
        
        if (Object.keys(spriteContent).length === 0) {
          logger.warn(`No SVG files found in: ${inputPath}`)
          logger.warn('Please check if the path exists and contains SVG files')
        } else {
          logger.success(`Generated ${Object.keys(spriteContent).length} sprite(s)`)
        }
        
        return result
      } catch (error) {
        logger.error('Failed to generate sprites:', error)
        logger.error(`Input path: ${inputPath}`)
        logger.error(`Output path: ${outputPath}`)
        spriteContent = {}
        return { spriteMap: {}, spriteContent: {} }
      }
    }
    
    // init（dev mode、build or prod mode）
    await generateSpritesWithErrorHandling()
    
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
      chunkName: 'components/svg-icon',
      global: true
    })
    
    // 註冊 client 插件
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
  // 處理絕對路徑
  if (input.startsWith('./') || input.startsWith('../')) {
    return join(nuxt.options.rootDir, input)
  }
  
  // 處理別名路徑
  if (nuxt.options.alias[input]) {
    return nuxt.options.alias[input]
  }
  
  // 處理 ~ 路徑，優先檢查 Nuxt 4 app
  if (input.startsWith('~/')) {
    const relativePath = input.replace('~/', '')
    
    // 檢查是否為 Nuxt 4 或使用 compatibilityVersion 4
    const isNuxt4 = nuxt.options.future?.compatibilityVersion === 4 || 
                   (nuxt.options.srcDir && nuxt.options.srcDir.includes('/app'))
    
    if (isNuxt4) {
      return join(nuxt.options.rootDir, 'app', relativePath)
    } else {
      return join(nuxt.options.srcDir, relativePath)
    }
  }
  
  // 對於非 ~ 路徑，根據 Nuxt 版本決定 srcDir
  const isNuxt4 = nuxt.options.future?.compatibilityVersion === 4 || 
                 (nuxt.options.srcDir && nuxt.options.srcDir.includes('/app'))
  
  if (isNuxt4) {
    return join(nuxt.options.rootDir, 'app', input)
  } else {
    return join(nuxt.options.srcDir, input)
  }
}

/**
 * 解析輸出路徑
 */
function resolveOutputPath(output: string, nuxt: any): string {
 
  
  if (output.startsWith('./') || output.startsWith('../')) {
    return join(nuxt.options.rootDir, output)
  }
  
  
  if (nuxt.options.alias[output]) {
    return nuxt.options.alias[output]
  }
  
  // 處理 ~ 路徑，優先檢查 Nuxt 4 app
  if (output.startsWith('~/')) {
    const relativePath = output.replace('~/', '')
    
    // 檢查是否為 Nuxt 4 或使用 compatibilityVersion 4
    const isNuxt4 = nuxt.options.future?.compatibilityVersion === 4 || 
                   (nuxt.options.srcDir && nuxt.options.srcDir.includes('/app'))
    
    if (isNuxt4) {
      return join(nuxt.options.rootDir, 'app', relativePath)
    } else {
      return join(nuxt.options.srcDir, relativePath)
    }
  }
  
  // 對於非 ~ 路徑，根據 Nuxt 版本決定 srcDir
  const isNuxt4 = nuxt.options.future?.compatibilityVersion === 4 || 
                 (nuxt.options.srcDir && nuxt.options.srcDir.includes('/app'))
  
  if (isNuxt4) {
    return join(nuxt.options.rootDir, 'app', output)
  } else {
    return join(nuxt.options.srcDir, output)
  }
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
 * 生成 sprite 模組內容
 */
function generateSpriteModule(spriteContent: Record<string, string>, options: ModuleOptions): string {
  const contentEntries = Object.entries(spriteContent)
  
  if (contentEntries.length === 0) {
    return `export const spriteContent = {};\nexport const options = ${JSON.stringify(options, null, 2)};`
  }
  
  // 使用陣列 join 拼接
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