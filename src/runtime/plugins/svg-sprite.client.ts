export default defineNuxtPlugin(async () => {
  // 在客戶端注入所有 sprite 內容到 DOM
  if (import.meta.client) {
    try {
      const { spriteContent } = await import('#svg-sprite-map')
      
      // 建立一個隱藏的容器來存放所有 sprite
      const spriteContainer = document.createElement('div')
      spriteContainer.style.display = 'none'
      spriteContainer.setAttribute('aria-hidden', 'true')
      
      // 將所有 sprite 內容加入到容器中
      for (const content of Object.values(spriteContent || {})) {
        spriteContainer.innerHTML += content
      }
      
      // 將容器加入到 body 的開頭
      if (spriteContainer.innerHTML) {
        document.body.insertBefore(spriteContainer, document.body.firstChild)
      }
    } catch (error) {
      console.warn('Failed to load sprite content:', error)
    }
  }
})