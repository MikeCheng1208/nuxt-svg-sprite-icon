import { defineNuxtPlugin } from '#app'

// 用於追踪插件是否已經執行過
let isInitialized = false

export default defineNuxtPlugin(async (nuxtApp) => {
  
  // 在 client 注入所有 sprite 內容到 DOM
  if (import.meta.client && !isInitialized) {
    try {
      const { spriteContent } = await import('#svg-sprite-map')
      
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
  
  // 避免與DevTools衝突的刷新方法
  const refreshSvgSprite = async () => {
    if (import.meta.client) {
      try {
        const { spriteContent } = await import('#svg-sprite-map')
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

  // 處理DevTools與SVG Sprite的協同工作
  nuxtApp.hook('app:suspense:resolve', () => {
    // 在頁面完全載入後延遲一點執行，避免與DevTools的app:data:refresh衝突
    setTimeout(refreshSvgSprite, 0)
  })
  
  // 提供刷新 SVG sprite 的方法
  return {
    provide: {
      refreshSvgSprite
    }
  }
})