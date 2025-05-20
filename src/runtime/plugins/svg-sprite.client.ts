import { defineNuxtPlugin } from '#app'

// 用於追踪插件是否已經執行過
let isInitialized = false;
// 保存已加載的sprite內容
let cachedSpriteContent: Record<string, string> | null = null;

export default defineNuxtPlugin({
  name: 'svg-sprite-client',
  setup(nuxtApp) {
    // 防止在服務器端運行
    if (process.server) {
      return;
    }

    // 在client端初始化SVG sprite，使用自包含的方式處理
    const initSvgSprite = async () => {
      if (isInitialized) return;

      try {
        // 重新使用直接導入，但將其與Nuxt生命週期解耦
        const svgSpriteMap = await import('#svg-sprite-map');
        const { spriteContent } = svgSpriteMap;
        
        // 緩存sprite內容以供刷新時使用
        cachedSpriteContent = spriteContent || {};

        if (!spriteContent || Object.keys(spriteContent).length === 0) {
          console.warn('No SVG sprite content found');
          return;
        }
        
        // 建立一個隱藏的容器來存放所有 sprite
        const spriteContainer = document.createElement('div');
        spriteContainer.id = 'nuxt-svg-sprite-container';
        spriteContainer.style.display = 'none';
        spriteContainer.setAttribute('aria-hidden', 'true');
        
        // 將所有 sprite 內容加入到容器中
        for (const content of Object.values(spriteContent)) {
          spriteContainer.innerHTML += content;
        }
        
        // 檢查是否已經存在此容器，避免重複注入
        const existingContainer = document.getElementById('nuxt-svg-sprite-container');
        if (existingContainer) {
          existingContainer.remove();
        }
        
        // 將容器加入到 body 的開頭
        if (spriteContainer.innerHTML) {
          document.body.insertBefore(spriteContainer, document.body.firstChild);
          isInitialized = true;
        }
      } catch (error) {
        console.warn('Failed to load SVG sprite content:', error);
      }
    };

    // 在DOM就緒後，與Nuxt生命週期事件分離的方式初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initSvgSprite, 0);
      });
    } else {
      // 使用setTimeout將初始化過程與當前任務隊列分離
      setTimeout(initSvgSprite, 0);
    }
    
    // 提供刷新SVG sprite的方法，但不依賴於Nuxt的hooks
    return {
      provide: {
        refreshSvgSprite: async () => {
          if (process.server) return;
          
          try {
            // 使用緩存的sprite內容刷新
            if (cachedSpriteContent) {
              const container = document.getElementById('nuxt-svg-sprite-container');
              
              if (container) {
                // 刷新現有容器而不是重新創建
                let newContent = '';
                for (const content of Object.values(cachedSpriteContent)) {
                  newContent += content;
                }
                container.innerHTML = newContent;
              } else {
                // 如果容器不存在，重新初始化
                isInitialized = false;
                initSvgSprite();
              }
            } else {
              // 如果沒有緩存內容，重新初始化
              isInitialized = false;
              initSvgSprite();
            }
          } catch (error) {
            console.warn('Failed to refresh SVG sprite:', error);
            
            // 出錯時重試
            isInitialized = false;
            setTimeout(initSvgSprite, 10);
          }
        }
      }
    };
  }
})