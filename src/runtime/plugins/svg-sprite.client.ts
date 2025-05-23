import { defineNuxtPlugin } from '#app'
import { spriteContent, options } from '#svg-sprite-data'

type PluginState = {
  isSpriteContainerAdded: boolean;
  isInitialized: boolean;
  retryCount: number;
}

const CONTAINER_ID = 'nuxt-svg-sprite-container';
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 100;

// 使用響應式狀態管理
const state: PluginState = {
  isSpriteContainerAdded: false,
  isInitialized: false,
  retryCount: 0
};

export default defineNuxtPlugin({
  name: 'svg-sprite-icon-client',
  setup() {
    // 服務端渲染時直接返回
    if (process.server) {
      return {};
    }

    // 初始化 SVG sprite 系統
    const initializeSvgSprite = async (): Promise<void> => {
      if (state.isInitialized) {
        return;
      }

      try {
        await addSpriteContainer();
        state.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize SVG sprite system:', error);
        
        // 重試機制
        if (state.retryCount < MAX_RETRY_COUNT) {
          state.retryCount++;
          setTimeout(() => {
            initializeSvgSprite();
          }, RETRY_DELAY * state.retryCount);
        }
      }
    };

    // 添加 SVG sprite 容器到 DOM（優化版本）
    const addSpriteContainer = async (): Promise<void> => {
      // 檢查前置條件
      if (state.isSpriteContainerAdded || !document?.body) {
        return;
      }
      
      // 驗證 sprite 內容
      if (!spriteContent || Object.keys(spriteContent).length === 0) {
        console.warn('[nuxt-svg-sprite-icon] No SVG content found');
        return;
      }
      
      // 移除現有容器（如果存在）
      removeExistingContainer();
      
      // 創建並配置容器
      const container = createSpriteContainer();
      
      // 批次添加所有 sprite 內容
      const spriteElements = Object.entries(spriteContent)
        .filter(([, content]) => content && typeof content === 'string' && content.trim())
        .map(([, content]) => content);
      
      if (spriteElements.length === 0) {
        console.warn('[nuxt-svg-sprite-icon] No valid SVG content to add');
        return;
      }
      
      // 使用 DocumentFragment 優化 DOM 操作
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = spriteElements.join('');
      
      // 將所有子節點移動到 fragment
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      container.appendChild(fragment);
      
      // 一次性插入到 DOM
      document.body.insertBefore(container, document.body.firstChild);
      state.isSpriteContainerAdded = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[nuxt-svg-sprite-icon] Added ${spriteElements.length} sprite(s) to DOM`);
      }
    };

    // 移除現有容器
    const removeExistingContainer = (): void => {
      const existingContainer = document.getElementById(CONTAINER_ID);
      if (existingContainer) {
        existingContainer.remove();
      }
    };

    // 創建 sprite 容器
    const createSpriteContainer = (): HTMLDivElement => {
      const container = document.createElement('div');
      container.id = CONTAINER_ID;
      container.style.cssText = 'display: none; position: absolute; width: 0; height: 0; overflow: hidden;';
      container.setAttribute('aria-hidden', 'true');
      container.setAttribute('data-nuxt-svg-sprite', 'true');
      return container;
    };

    // 重新加載 sprite 系統
    const reloadSprites = async (): Promise<void> => {
      state.isSpriteContainerAdded = false;
      state.isInitialized = false;
      state.retryCount = 0;
      await initializeSvgSprite();
    };

    // 獲取 sprite 統計信息
    const getSpriteStats = () => {
      return {
        spriteCount: Object.keys(spriteContent).length,
        isInitialized: state.isInitialized,
        isContainerAdded: state.isSpriteContainerAdded,
        options: { ...options }
      };
    };

    // 根據文檔狀態初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeSvgSprite, { once: true });
    } else {
      // 使用 requestIdleCallback 或 setTimeout 延遲執行以避免阻塞
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(initializeSvgSprite);
      } else {
        setTimeout(initializeSvgSprite, 0);
      }
    }

    // 提供插件 API
    return {
      provide: {
        svgSprite: {
          reload: reloadSprites,
          getStats: getSpriteStats,
          getOptions: () => ({ ...options }),
          isReady: () => state.isInitialized && state.isSpriteContainerAdded
        }
      }
    };
  }
})