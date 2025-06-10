const SVG_TAG_REGEX = /<svg[^>]*>|<\/svg>/g;
const VIEWBOX_REGEX = /viewBox="([^"]*)"/;
const WIDTH_REGEX = /width="([^"]*)"/;
const HEIGHT_REGEX = /height="([^"]*)"/;
const STYLE_REGEX = /\s*style="[^"]*"/g;
const SIZE_ATTRS_REGEX = /\s*(width|height)="[^"]*"/g;

// 新增的正則表達式來處理問題 SVG
const DEFS_REGEX = /<defs[^>]*>[\s\S]*?<\/defs>/gi;
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;

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
 * 增強的 SVG 處理，解決樣式和 ID 衝突問題
 */
export function processCompatibleSvg(svgContent: string, symbolId: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('Invalid SVG content provided');
  }

  let processedContent = svgContent;

  // 1. 移除固定尺寸屬性
  processedContent = processedContent
    .replace(SIZE_ATTRS_REGEX, '')
    .replace(STYLE_REGEX, '');

  // 2. 處理 <defs> 內的 <style> 標籤，提取樣式並轉換為行內樣式
  processedContent = processDefsAndStyles(processedContent, symbolId);

  // 3. 移除可能造成衝突的 ID 屬性（除了重要的功能性 ID）
  processedContent = processIdAttributes(processedContent, symbolId);

  return processedContent.trim();
}

/**
 * 處理 <defs> 和 <style> 標籤
 */
function processDefsAndStyles(svgContent: string, symbolId: string): string {
  let processedContent = svgContent;
  const extractedStyles: Record<string, string> = {};

  // 提取所有樣式定義
  processedContent = processedContent.replace(STYLE_TAG_REGEX, (match) => {
    // 解析 CSS 規則
    const cssText = match.replace(/<\/?style[^>]*>/g, '').trim();
    const rules = parseCssRules(cssText);
    
    // 儲存樣式規則
    Object.assign(extractedStyles, rules);
    
    // 移除 style 標籤
    return '';
  });

  // 處理 <defs> 標籤，保留功能性定義但移除樣式定義
  processedContent = processedContent.replace(DEFS_REGEX, (match) => {
    // 如果 defs 只包含 style，則完全移除
    if (/<style[^>]*>[\s\S]*?<\/style>/i.test(match) && 
        !/<(?:clipPath|linearGradient|radialGradient|pattern|marker|filter)/i.test(match)) {
      return '';
    }
    
    // 否則移除 defs 內的 style 標籤
    return match.replace(STYLE_TAG_REGEX, '');
  });

  // 應用提取的樣式到相應元素
  processedContent = applyCssRulesToElements(processedContent, extractedStyles);

  return processedContent;
}

/**
 * 解析 CSS 規則
 */
function parseCssRules(cssText: string): Record<string, string> {
  const rules: Record<string, string> = {};
  
  // 簡單的 CSS 解析器
  const rulePattern = /\.([^{]+)\{([^}]+)\}/g;
  let match;
  
  while ((match = rulePattern.exec(cssText)) !== null) {
    const className = match[1].trim();
    const declarations = match[2].trim();
    rules[className] = declarations;
  }
  
  return rules;
}

/**
 * 將 CSS 規則應用到元素
 */
function applyCssRulesToElements(svgContent: string, cssRules: Record<string, string>): string {
  let processedContent = svgContent;
  
  for (const [className, declarations] of Object.entries(cssRules)) {
         // 查找所有使用此 class 的元素標籤（包括自閉合標籤）
     const elementRegex = new RegExp(`<([^>\\s]+)[^>]*class=["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["'][^>]*/?\\s*>`, 'g');
    
    processedContent = processedContent.replace(elementRegex, (match) => {
      // 檢查是否已經有 style 屬性
      const existingStyleMatch = match.match(/style=["']([^"']*)["']/);
      
      if (existingStyleMatch) {
        // 合併現有樣式
        const currentStyle = existingStyleMatch[1];
        const newStyle = `${currentStyle}; ${declarations}`;
        return match.replace(/style=["'][^"']*["']/, `style="${newStyle}"`);
                    } else {
          // 添加新的 style 屬性（處理自閉合標籤和普通標籤）
          if (match.includes('/>')) {
            // 自閉合標籤
            return match.replace(/\s*\/>/, ` style="${declarations}"/>`);
          } else {
            // 普通標籤
            return match.replace(/\s*>$/, ` style="${declarations}">`);
          }
       }
    });
  }
  
  // 移除所有 class 屬性（因為已經轉換為 style）
  for (const className of Object.keys(cssRules)) {
    const classRegex = new RegExp(`\\s*class=["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["']`, 'g');
    processedContent = processedContent.replace(classRegex, '');
  }
  
  return processedContent;
}

/**
 * 處理 ID 屬性，避免衝突
 */
function processIdAttributes(svgContent: string, symbolId: string): string {
  let processedContent = svgContent;
  
  // 收集所有功能性 ID（被 url() 引用的）
  const functionalIds = new Set<string>();
  const urlReferences = processedContent.match(/url\(#([^)]+)\)/g);
  
  if (urlReferences) {
    urlReferences.forEach(ref => {
      const id = ref.match(/url\(#([^)]+)\)/)?.[1];
      if (id) functionalIds.add(id);
    });
  }
  
  // 處理功能性 ID 的引用更新
  for (const id of functionalIds) {
    const newId = `${symbolId}-${id}`;
    processedContent = processedContent.replace(
      new RegExp(`url\\(#${escapeRegex(id)}\\)`, 'g'),
      `url(#${newId})`
    );
  }
  
  // 為非功能性 ID 添加前綴或移除
  processedContent = processedContent.replace(/\s+id="([^"]+)"/g, (match, id) => {
    // 保留功能性 ID，但添加前綴避免全局衝突
    if (functionalIds.has(id)) {
      const newId = `${symbolId}-${id}`;
      return ` id="${newId}"`;
    }
    
    // 移除非功能性 ID
    return '';
  });
  
  return processedContent;
}

/**
 * 轉義正則表達式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 將 SVG 轉換為 symbol 元素
 */
export function svgToSymbol(svgContent: string, id: string): string {
  if (!svgContent || !id) {
    throw new Error('SVG content and ID are required');
  }

  // 提取或生成 viewBox（在處理前提取）
  const viewBox = extractViewBox(svgContent);
  
  // 使用增強的處理方式
  const processedContent = processCompatibleSvg(svgContent, id);
  
  // 移除 svg 標籤但保留內容
  const content = processedContent.replace(SVG_TAG_REGEX, '').trim();
  
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