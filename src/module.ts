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
    
    // 添加SVG Sprite插件，不使用enforce參數
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
    nuxt.options.alias['#svg-sprite-map'] = spriteMapTemplate.dst
    
    // 開發模式下監控檔案變化
    if (nuxt.options.dev) {
      // 使用獨立的watcher實例，完全脫離Nuxt的生命週期
      let watcher: any = null
      
      // 避免在Nuxt初始化時立即創建watcher
      setTimeout(() => {
        watcher = watch(join(inputPath, '**/*.svg'), {
          ignoreInitial: true
        })
        
        // 使用自定義的事件處理機制，完全避免與Nuxt DevTools衝突
        let isGenerating = false;
        
        // 去抖處理SVG文件變更，避免過於頻繁觸發
        const handleFileChange = async (event: string, path: string) => {
          if (isGenerating) return;
          
          console.log(`SVG ${event}: ${path}`);
          isGenerating = true;
          
          try {
            // 只重新生成Sprites文件，不調用nuxt hooks或計時器
            await generateSprites(inputPath, outputPath, options);
            
            // 給系統一些時間處理文件變更
            setTimeout(() => {
              isGenerating = false;
            }, 300);
          } catch (error) {
            console.warn('Failed to regenerate sprites:', error);
            isGenerating = false;
          }
        };
        
        const debouncedHandler = debounce(handleFileChange, 500);
        
        watcher.on('all', (event: string, path: string) => {
          debouncedHandler(event, path);
        });
        
        // 確保在Nuxt關閉時清理watcher
        nuxt.hook('close', () => {
          if (watcher) watcher.close();
        });
      }, 1000); // 延遲1秒創建watcher，避免與Nuxt初始化衝突
    }
    
    // 建構時生成 sprites - 使用一次性操作，避免註冊計時器
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