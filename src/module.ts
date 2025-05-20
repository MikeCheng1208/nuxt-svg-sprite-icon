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
    elementClass: 'svg-icon',
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
    
    // 添加SVG Sprite插件
    addPlugin({
      src: resolve('./runtime/plugins/svg-sprite.client'),
      mode: 'client'
    })
    
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
    
    // 開發模式下監控檔案變化
    if (nuxt.options.dev) {
      // 防止過多HMR觸發的狀態管理
      let isProcessingSvg = false;
      let svgWatcher: ReturnType<typeof watch> | null = null;
      
      // 延遲初始化watcher，避免與Nuxt初始化階段衝突
      setTimeout(() => {
        // 使用更大的debounce時間減少觸發頻率
        const debouncedRegenerate = debounce(async () => {
          if (isProcessingSvg) return;
          
          isProcessingSvg = true;
          
          try {
            await generateSprites(inputPath, outputPath, options);
          } catch (error) {
            console.warn('重新生成SVG Sprites失敗:', error);
          } finally {
            // 延遲重置標誌，減少連續觸發
            setTimeout(() => {
              isProcessingSvg = false;
            }, 500);
          }
        }, 1000); // 增加debounce時間到1秒
        
        // 初始化文件監控，添加寫入完成等待
        svgWatcher = watch(join(inputPath, '**/*.svg'), {
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
          }
        });
        
        // 處理文件變更事件
        svgWatcher.on('all', () => {
          debouncedRegenerate();
        });
        
        // 確保在Nuxt關閉時清理watcher
        nuxt.hook('close', () => {
          if (svgWatcher) {
            svgWatcher.close();
          }
        });
      }, 2000); // 延遲2秒創建watcher
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