import { defineNuxtPlugin } from '#app'

// 用於追踪插件是否已經執行過
let isInitialized = false

export default defineNuxtPlugin({
  name: 'svg-sprite-client',
  enforce: 'post', // 確保在其他插件之後執行
  async setup(nuxtApp) {
    // 防止在服務器端運行
    if (process.server) return;
  
    // 在 client 注入所有 sprite 內容到 DOM
    if (!isInitialized) {
      try {
        // 使用動態導入，不使用await減少與nuxt事件系統的交互
        import('#svg-sprite-map')
          .then(svgSpriteMap => {
            const { spriteContent } = svgSpriteMap;
            
            // 建立一個隱藏的容器來存放所有 sprite
            const spriteContainer = document.createElement('div')
            spriteContainer.id = 'nuxt-svg-sprite-container'
            spriteContainer.style.display = 'none'
            spriteContainer.setAttribute('aria-hidden', 'true')
            
            // 將所有 sprite 內容加入到容器中
            for (const content of Object.values(spriteContent || {})) {
              spriteContainer.innerHTML += content
            }
            
            // 檢查是否已經存在此容器，避免重複注入
            const existingContainer = document.getElementById('nuxt-svg-sprite-container')
            if (existingContainer) {
              existingContainer.remove()
            }
            
            // 將容器加入到 body 的開頭
            if (spriteContainer.innerHTML) {
              document.body.insertBefore(spriteContainer, document.body.firstChild)
              isInitialized = true
            }
          })
          .catch(error => {
            console.warn('Failed to load sprite content:', error)
          });
      } catch (error) {
        console.warn('Failed to load sprite content:', error)
      }
    }
  
    // 提供刷新 SVG sprite 的方法
    return {
      provide: {
        refreshSvgSprite: () => {
          if (process.server) return;
          
          // 使用動態導入，不使用await減少與nuxt事件系統的交互
          import('#svg-sprite-map')
            .then(svgSpriteMap => {
              const { spriteContent } = svgSpriteMap;
              
              const container = document.getElementById('nuxt-svg-sprite-container')
              
              if (container) {
                let newContent = ''
                for (const content of Object.values(spriteContent || {})) {
                  newContent += content
                }
                container.innerHTML = newContent
              }
            })
            .catch(error => {
              console.warn('Failed to refresh sprite content:', error)
            });
        }
      }
    }
  }
})