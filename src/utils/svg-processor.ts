const SVG_TAG_REGEX = /<svg[^>]*>|<\/svg>/g;
const VIEWBOX_REGEX = /viewBox="([^"]*)"/;
const WIDTH_REGEX = /width="([^"]*)"/;
const HEIGHT_REGEX = /height="([^"]*)"/;
const STYLE_REGEX = /\s*style="[^"]*"/g;
const SIZE_ATTRS_REGEX = /\s*(width|height)="[^"]*"/g;

/**
 * 處理 SVG 內容，移除固定尺寸屬性以便 CSS 控制
 */
export function processSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('Invalid SVG content provided');
  }

  // 使用預編譯的正則表達式提升效能
  return svgContent
    .replace(SIZE_ATTRS_REGEX, '') // 移除 width 和 height 屬性
    .replace(STYLE_REGEX, '') // 移除 style 屬性
    .trim();
}

/**
 * 將 SVG 轉換為 symbol 元素
 */
export function svgToSymbol(svgContent: string, id: string): string {
  if (!svgContent || !id) {
    throw new Error('SVG content and ID are required');
  }

  // 移除 svg 標籤但保留內容
  const content = svgContent.replace(SVG_TAG_REGEX, '').trim();
  
  // 提取或生成 viewBox
  const viewBox = extractViewBox(svgContent);
  
  return `<symbol id="${escapeHtml(id)}" viewBox="${viewBox}">${content}</symbol>`;
}

/**
 * 提取或生成 viewBox 屬性
 */
function extractViewBox(svgContent: string): string {
  // 首先嘗試提取現有的 viewBox
  const viewBoxMatch = svgContent.match(VIEWBOX_REGEX);
  if (viewBoxMatch?.[1]) {
    return viewBoxMatch[1];
  }

  // 如果沒有 viewBox，嘗試從 width/height 推導
  const widthMatch = svgContent.match(WIDTH_REGEX);
  const heightMatch = svgContent.match(HEIGHT_REGEX);
  
  if (widthMatch?.[1] && heightMatch?.[1]) {
    const width = parseFloat(widthMatch[1]);
    const height = parseFloat(heightMatch[1]);
    
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return `0 0 ${width} ${height}`;
    }
  }
  
  // 預設使用標準的 24x24 viewBox
  return '0 0 24 24';
}

/**
 * 簡單的 HTML 轉義函數
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}