import { defineNuxtPlugin } from '#app'

// 保存已加載的sprite內容
let cachedSpriteContent: Record<string, string> | null = null;
// 追踪容器是否已添加到DOM
let isSpriteContainerAdded = false;

export default defineNuxtPlugin({
  name: 'svg-sprite-client',
  setup() {
    // 防止在服務器端運行
    if (import.meta.server) {
      return;
    }

    // 載入並初始化SVG sprites的函數
    const loadSpriteContent = async () => {
      if (cachedSpriteContent) return cachedSpriteContent;
      
      try {
        // @ts-ignore
        const svgSpriteMap = await import('#svg-sprite-map');
        const spriteContent = svgSpriteMap.spriteContent || {};
        
        // 緩存sprite內容
        cachedSpriteContent = spriteContent;
        return cachedSpriteContent;
      } catch (error) {
        console.warn('Failed to load SVG sprite content:', error);
        return {};
      }
    };

    // 添加SVG sprite容器到DOM
    const addSpriteContainer = async () => {
      if (isSpriteContainerAdded || !document.body) return;
      
      const spriteContent = await loadSpriteContent();
      if (!spriteContent || Object.keys(spriteContent).length === 0) {
        return;
      }
      
      // 檢查是否已經存在此容器，避免重複注入
      const existingContainer = document.getElementById('nuxt-svg-sprite-container');
      if (existingContainer) {
        existingContainer.remove();
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
      
      // 將容器加入到 body 的開頭
      if (spriteContainer.innerHTML) {
        document.body.insertBefore(spriteContainer, document.body.firstChild);
        isSpriteContainerAdded = true;
      }
    };

    // 使用MutationObserver確保在DOM可用時加載SVG sprite
    const setupSvgSprite = () => {
      // 如果body已存在，直接添加sprite容器
      if (document.body) {
        addSpriteContainer();
        return;
      }

      // 否則使用MutationObserver監聽DOM變化
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && document.body) {
            addSpriteContainer();
            observer.disconnect(); // 一旦添加了容器，就停止觀察
            break;
          }
        }
      });
      
      // 觀察document的變化
      observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true 
      });
      
      // 安全起見，設置一個超時，確保即使MutationObserver沒有觸發也能嘗試添加sprite
      setTimeout(() => {
        if (!isSpriteContainerAdded && document.body) {
          addSpriteContainer();
          observer.disconnect();
        }
      }, 2000);
    };

    // 初始化SVG sprite
    setupSvgSprite();

    return {};
  }
})