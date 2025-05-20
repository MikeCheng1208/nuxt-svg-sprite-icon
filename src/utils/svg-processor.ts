export function processSvg(svgContent: string, options: any = {}) {
  // 移除固定的 width 和 height 屬性，讓 CSS 控制尺寸
  let processed = svgContent
    .replace(/\s*width="[^"]*"/g, '') 
    .replace(/\s*height="[^"]*"/g, '')
    .replace(/\s*style="[^"]*"/g, '') // 也移除 style 屬性

  return processed
}

export function svgToSymbol(svgContent: string, id: string): string {
  // 移除 svg 標籤但保留內容
  const content = svgContent.replace(/<svg[^>]*>|<\/svg>/g, '')
  
  // 提取 viewBox，如果沒有就嘗試從 width/height 推導
  let viewBox = ''
  
  const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/)
  if (viewBoxMatch) {
    viewBox = viewBoxMatch[1]
  } else {
    // 如果沒有 viewBox，嘗試從 width/height 推導
    const widthMatch = svgContent.match(/width="([^"]*)"/)
    const heightMatch = svgContent.match(/height="([^"]*)"/)
    
    if (widthMatch && heightMatch) {
      const width = parseFloat(widthMatch[1])
      const height = parseFloat(heightMatch[1])
      viewBox = `0 0 ${width} ${height}`
    } else {
      // 預設使用正方形 viewBox
      viewBox = '0 0 24 24'
    }
  }
  
  return `<symbol id="${id}" viewBox="${viewBox}">${content}</symbol>`
}