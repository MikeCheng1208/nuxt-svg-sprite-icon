import { defineNuxtPlugin } from '#app'
import { spriteContent, options } from '#svg-sprite-data'


const state = {
  isSpriteContainerAdded: false
};

export default defineNuxtPlugin({
  name: 'svg-sprite-icon-client',
  setup() {
    
    
    if (process.server) {
      return {};
    }

    // console.log('SVG 模組已載入', Object.keys(spriteContent).length, '個 SVG 檔案');

    // 檢查是否應該注入 DOM 容器
    const shouldInject = options.injectDOMContainer !== false;
    
    // 檢查 DevTools 兼容模式
    const isDevToolsCompat = options.devtoolsCompat !== false && 
                            options._internal && 
                            options._internal.hasDevTools;

    // 添加 SVG sprite 容器到 DOM
    const addSpriteContainer = () => {
      // 如果不應該注入或已經添加，則返回
      if (!shouldInject || state.isSpriteContainerAdded || !document || !document.body) return;
      
      
      if (!spriteContent || Object.keys(spriteContent).length === 0) {
        console.warn('沒有找到任何 SVG 內容');
        return;
      }
      
      // 檢查是否已經存在
      const existingContainer = document.getElementById('nuxt-svg-sprite-container');
      if (existingContainer) {
        existingContainer.remove();
      }
      
      // 建立容器
      const spriteContainer = document.createElement('div');
      spriteContainer.id = 'nuxt-svg-sprite-container';
      spriteContainer.style.display = 'none';
      spriteContainer.setAttribute('aria-hidden', 'true');
      
      // 將所有 sprite 內容加入到容器中
      for (const [name, content] of Object.entries(spriteContent)) {
        if (content) {
          spriteContainer.innerHTML += content;
          // console.log(`添加 SVG: ${name}`);
        }
      }
      
      // 有內容才添加
      if (spriteContainer.innerHTML) {
        // 在 DevTools 兼容模式下，使用更安全的方式注入
        if (isDevToolsCompat) {
          // 使用 requestAnimationFrame 確保在 DOM 完全準備好後再注入
          requestAnimationFrame(() => {
            document.body.insertBefore(spriteContainer, document.body.firstChild);
            state.isSpriteContainerAdded = true;
          });
        } else {
          document.body.insertBefore(spriteContainer, document.body.firstChild);
          state.isSpriteContainerAdded = true;
        }
      } else {
        console.warn('SVG sprite 容器為空，未添加到 DOM');
      }
    };

    // 初始化 SVG sprite
    if (shouldInject) {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // 文檔已加載完成，立即添加
        addSpriteContainer();
      } else {
        // 等待 DOM 完全加載
        document.addEventListener('DOMContentLoaded', () => {
          addSpriteContainer();
        });
      }
    }


    return {
      provide: {
        svgSprite: {
          reload: () => {
            if (shouldInject) {
              state.isSpriteContainerAdded = false;
              addSpriteContainer();
            }
          },
          getOptions: () => {
            return options;
          }
        }
      }
    };
  }
})