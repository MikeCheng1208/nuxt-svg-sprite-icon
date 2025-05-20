import { defineNuxtPlugin } from '#app'

// 保存全局組件的 State
const state = {
  spriteContent: null as Record<string, string> | null,
  isSpriteContainerAdded: false
};

export default defineNuxtPlugin({
  name: 'svg-sprite-icon-client',
  setup(nuxtApp) {
    // 防止在服務器端運行
    if (process.server) {
      return {};
    }

    // 載入並初始化SVG sprites的函數
    const loadSpriteContent = async () => {
      if (state.spriteContent) return state.spriteContent;
      
      // @ts-ignore - Nuxt 運行時處理
      const svgSpriteMap = await import('#svg-sprite-map');
      
      if (svgSpriteMap && typeof svgSpriteMap.spriteContent === 'object') {
        state.spriteContent = svgSpriteMap.spriteContent || {};
        return state.spriteContent;
      }
      return {};
    };

    // 添加SVG sprite容器到DOM
    const addSpriteContainer = async () => {
      // 多重檢查以避免重複添加
      if (state.isSpriteContainerAdded || !document || !document.body) return;
      
      const spriteContent = await loadSpriteContent();
      if (!spriteContent || Object.keys(spriteContent).length === 0) {
        return;
      }
      
      // 檢查是否已經存在此容器
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
      for (const content of Object.values(spriteContent)) {
        if (content) {
          spriteContainer.innerHTML += content;
        }
      }
      
      // 有內容才添加
      if (spriteContainer.innerHTML) {
        document.body.insertBefore(spriteContainer, document.body.firstChild);
        state.isSpriteContainerAdded = true;
      }
    };

    // 初始化 SVG sprite
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // 文檔已加載完成，立即添加
      addSpriteContainer();
    } else {
      // 等待 DOM 完全加載
      document.addEventListener('DOMContentLoaded', () => {
        addSpriteContainer();
      });
    }

    // 提供重新加載方法
    return {
      provide: {
        svgSprite: {
          reload: async () => {
            state.isSpriteContainerAdded = false;
            await addSpriteContainer();
          }
        }
      }
    };
  }
})