import { defineNuxtPlugin } from '#app'
// @ts-ignore
import { spriteContent, options } from '#svg-sprite-data'

type PluginState = {
  isSpriteContainerAdded: boolean;
  isInitialized: boolean;
  retryCount: number;
}

const CONTAINER_ID = 'nuxt-svg-sprite-container';
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 100;
const PAINT_SERVER_FEATURE_REGEX = /url\(#|<(linearGradient|radialGradient|pattern|filter|mask|clipPath)\b/i

// 使用響應式狀態管理
const state: PluginState = {
  isSpriteContainerAdded: false,
  isInitialized: false,
  retryCount: 0
};

function needsPaintServerCompat(spriteContent: Record<string, string>): boolean {
  try {
    return Object.values(spriteContent).some((content) => PAINT_SERVER_FEATURE_REGEX.test(content))
  } catch {
    return false
  }
}

export default defineNuxtPlugin({
  name: 'svg-sprite-icon-client',
  setup() {
    if (process.server) return {};
    
    // init SVG sprite 
    const initializeSvgSprite = async (): Promise<void> => {
      if (state.isInitialized) {
        return;
      }

      try {
        await addSpriteContainer();
        state.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize SVG sprite system:', error);
        
        // retry 機制
        if (state.retryCount < MAX_RETRY_COUNT) {
          state.retryCount++;
          setTimeout(() => {
            initializeSvgSprite();
          }, RETRY_DELAY * state.retryCount);
        }
      }
    };

    // 添加 SVG sprite 到 DOM
    const addSpriteContainer = async (): Promise<void> => {
      
      if (state.isSpriteContainerAdded || !document?.body) {
        return;
      }
      
      
      if (!spriteContent || Object.keys(spriteContent).length === 0) {
        console.warn('[nuxt-svg-sprite-icon] No SVG content found');
        return;
      }
      
      
      removeExistingContainer();
      
      
      const container = createSpriteContainer();
      
      
      const spriteElements = Object.entries(spriteContent)
        .filter(([, content]) => content && typeof content === 'string' && content.trim())
        .map(([, content]) => content);
      
      if (spriteElements.length === 0) {
        console.warn('[nuxt-svg-sprite-icon] No valid SVG content to add');
        return;
      }
      
      
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = spriteElements.join('');
      
      
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      container.appendChild(fragment);
      
      
      document.body.insertBefore(container, document.body.firstChild);
      state.isSpriteContainerAdded = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[nuxt-svg-sprite-icon] Added ${spriteElements.length} sprite(s) to DOM`);
      }
    };

    
    const removeExistingContainer = (): void => {
      const existingContainer = document.getElementById(CONTAINER_ID);
      if (existingContainer) {
        existingContainer.remove();
      }
    };

    // 創建 sprite
    const createSpriteContainer = (): HTMLDivElement => {
      const container = document.createElement('div');
      container.id = CONTAINER_ID;
      const compatMode = needsPaintServerCompat(spriteContent)
      container.style.cssText = compatMode
        ? 'position: absolute; width: 0; height: 0; overflow: hidden;'
        : 'display: none; position: absolute; width: 0; height: 0; overflow: hidden;';
      container.setAttribute('aria-hidden', 'true');
      container.setAttribute('data-nuxt-svg-sprite', 'true');
      container.setAttribute('data-nuxt-svg-sprite-compat', compatMode ? 'paint-server' : 'default');
      return container;
    };

    
    const reloadSprites = async (): Promise<void> => {
      state.isSpriteContainerAdded = false;
      state.isInitialized = false;
      state.retryCount = 0;
      await initializeSvgSprite();
    };

    
    const getSpriteStats = () => {
      return {
        spriteCount: Object.keys(spriteContent).length,
        isInitialized: state.isInitialized,
        isContainerAdded: state.isSpriteContainerAdded,
        options: { ...options }
      };
    };

    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeSvgSprite, { once: true });
    } else {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(initializeSvgSprite);
      } else {
        setTimeout(initializeSvgSprite, 0);
      }
    }

    
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