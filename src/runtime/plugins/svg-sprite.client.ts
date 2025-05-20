import { defineNuxtPlugin } from '#app'

// 用於追踪插件是否已經執行過
let isInitialized = false

export default defineNuxtPlugin(async (nuxtApp) => {
  
  // 在 client 注入所有 sprite 內容到 DOM
  if (import.meta.client && !isInitialized) {
    try {
      // 使用動態導入避免linter錯誤
      const svgSpriteMap = await import('#svg-sprite-map')
      const { spriteContent } = svgSpriteMap
      
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
    } catch (error) {
      console.warn('Failed to load sprite content:', error)
    }
  }
  
  // 修復app:data:refresh Timer已存在問題
  try {
    // 檢查是否已有計時器註冊，如果有則移除
    const existingTimer = (window as any).__VUE_DEVTOOLS_TIMELINE__?.timers?.get('[nuxt-app] app:data:refresh')
    if (existingTimer) {
      console.log('清除已存在的app:data:refresh計時器')
      ;(window as any).__VUE_DEVTOOLS_TIMELINE__?.timers?.delete('[nuxt-app] app:data:refresh')
    }
  } catch (error) {
    // 忽略任何錯誤
  }
  
  // 提供刷新 SVG sprite 的方法
  return {
    provide: {
      refreshSvgSprite: async () => {
        if (import.meta.client) {
          try {
            // 使用動態導入避免linter錯誤
            const svgSpriteMap = await import('#svg-sprite-map')
            const { spriteContent } = svgSpriteMap
            
            const container = document.getElementById('nuxt-svg-sprite-container')
            
            if (container) {
              let newContent = ''
              for (const content of Object.values(spriteContent || {})) {
                newContent += content
              }
              container.innerHTML = newContent
            }
          } catch (error) {
            console.warn('Failed to refresh sprite content:', error)
          }
        }
      }
    }
  }
})