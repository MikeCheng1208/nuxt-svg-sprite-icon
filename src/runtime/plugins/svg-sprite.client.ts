import { defineNuxtPlugin } from '#app'

// 用於追踪插件是否已經執行過
let isInitialized = false

export default defineNuxtPlugin(async (nuxtApp) => {
  
  // 首先，在插件初始化時劫持console.error，阻止timer已存在的錯誤
  if (import.meta.client && typeof window !== 'undefined') {
    // 保存原始的console.error方法
    const originalConsoleError = console.error
    
    // 重寫console.error方法，過濾掉特定錯誤
    console.error = function(...args) {
      // 檢查是否是timer already exists錯誤
      const errorStr = args.join(' ')
      if (errorStr.includes('Timer') && errorStr.includes('app:data:refresh') && errorStr.includes('already exists')) {
        // 忽略這個特定錯誤
        return
      }
      
      // 其他錯誤正常顯示
      return originalConsoleError.apply(this, args)
    }
    
    // 嘗試清除可能存在的所有app:data:refresh計時器
    try {
      if ((window as any).__VUE_DEVTOOLS_TIMELINE__?.timers) {
        const timerKeys = Array.from((window as any).__VUE_DEVTOOLS_TIMELINE__.timers.keys())
        for (const key of timerKeys) {
          // 修正類型問題
          const timerKey = key as string
          if (typeof timerKey === 'string' && timerKey.includes('app:data:refresh')) {
            console.log(`移除計時器: ${timerKey}`)
            ;(window as any).__VUE_DEVTOOLS_TIMELINE__.timers.delete(timerKey)
          }
        }
      }
    } catch (e) {
      // 忽略錯誤
    }
  }
  
  // 在 client 注入所有 sprite 內容到 DOM
  if (import.meta.client && !isInitialized) {
    try {
      // 使用動態導入避免linter錯誤
      const svgSpriteMap = await import('/#svg-sprite-map')
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
  
  // 提供刷新 SVG sprite 的方法
  return {
    provide: {
      refreshSvgSprite: async () => {
        if (import.meta.client) {
          try {
            // 使用動態導入避免linter錯誤
            const svgSpriteMap = await import('/#svg-sprite-map')
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