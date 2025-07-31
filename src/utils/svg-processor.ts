const SVG_TAG_REGEX = /<svg[^>]*>|<\/svg>/g;
const VIEWBOX_REGEX = /viewBox="([^"]*)"/;
const WIDTH_REGEX = /width="([^"]*)"/;
const HEIGHT_REGEX = /height="([^"]*)"/;
const STYLE_REGEX = /\s*style="[^"]*"/g;
const SIZE_ATTRS_REGEX = /\s*(width|height)="[^"]*"/g;

const DEFS_REGEX = /<defs[^>]*>[\s\S]*?<\/defs>/gi;
const STYLE_TAG_REGEX = /<style[^>]*>[\s\S]*?<\/style>/gi;


/**
 * 增強的 SVG 處理，解決樣式和 ID 衝突問題
 */
export function processCompatibleSvg(svgContent: string, symbolId: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('Invalid SVG content provided');
  }
  let processedContent = svgContent;
  processedContent = removeSvgRootSizeAttributes(processedContent);
  const hasStyleTags = STYLE_TAG_REGEX.test(processedContent);
  if (hasStyleTags) { 
    processedContent = processDefsAndStyles(processedContent, symbolId);
  }
  processedContent = processIdAttributes(processedContent, symbolId);
  return processedContent.trim();
}

/**
 * 處理 <defs> 和 <style> 標籤
 */
function processDefsAndStyles(svgContent: string, symbolId: string): string {
  let processedContent = svgContent;
  const extractedStyles: Record<string, string> = {};

  
  processedContent = processedContent.replace(STYLE_TAG_REGEX, (match) => {
    const cssText = match.replace(/<\/?style[^>]*>/g, '').trim();
    const rules = parseCssRules(cssText);
    Object.assign(extractedStyles, rules);
    return '';
  });

  // 處理 <defs> 標籤，保留功能性定義但移除樣式定義
  processedContent = processedContent.replace(DEFS_REGEX, (match) => {
    if (/<style[^>]*>[\s\S]*?<\/style>/i.test(match) && 
        !/<(?:clipPath|linearGradient|radialGradient|pattern|marker|filter)/i.test(match)) {
      return '';
    }
    return match.replace(STYLE_TAG_REGEX, '');
  });

  // 應用提取的樣式到相應元素
  if (Object.keys(extractedStyles).length > 0) {
    processedContent = applyCssRulesToElements(processedContent, extractedStyles);
  }

  return processedContent;
}

/**
 * 解析 CSS 規則
 */
function parseCssRules(cssText: string): Record<string, string> {
  const rules: Record<string, string> = {};

  const rulePattern = /\.([^{]+)\{([^}]+)\}/g;
  let match;
  
  while ((match = rulePattern.exec(cssText)) !== null) {
    // @ts-ignore
    const className = match[1].trim();
    // @ts-ignore
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
    
     const elementRegex = new RegExp(`<([^>\\s]+)[^>]*class=["'][^"']*\\b${escapeRegex(className)}\\b[^"']*["'][^>]*/?\\s*>`, 'g');
    
    processedContent = processedContent.replace(elementRegex, (match) => {
      
      const existingStyleMatch = match.match(/style=["']([^"']*)["']/);
      
      if (existingStyleMatch) {
        const currentStyle = existingStyleMatch[1];
        const newStyle = `${currentStyle}; ${declarations}`;
        return match.replace(/style=["'][^"']*["']/, `style="${newStyle}"`);
      } else {
          if (match.includes('/>')) {
            return match.replace(/\s*\/>/, ` style="${declarations}"/>`);
          } else {
            return match.replace(/\s*>$/, ` style="${declarations}">`);
          }
      }
    });
  }
  
  // 移除已處理的 class 屬性（只移除已轉換的 class，保留其他）
  for (const className of Object.keys(cssRules)) {
    processedContent = processedContent.replace(
      new RegExp(`\\s*class=["']\\s*${escapeRegex(className)}\\s*["']`, 'g'),
      ''
    );
    
    // 處理包含多個 class，只移除特定的 class
    processedContent = processedContent.replace(
      new RegExp(`(class=["'][^"']*)\\b${escapeRegex(className)}\\b\\s*([^"']*["'])`, 'g'),
      '$1$2'
    );
    
    processedContent = processedContent.replace(/\s*class=["']\s*["']/g, '');
  }
  
  return processedContent;
}

/**
 * 處理 ID 屬性，避免衝突
 */
function processIdAttributes(svgContent: string, symbolId: string): string {
  let processedContent = svgContent;
  
  
  const functionalIds = new Set<string>();
  const urlReferences = processedContent.match(/url\(#([^)]+)\)/g);
  
  if (urlReferences) {
    urlReferences.forEach(ref => {
      const id = ref.match(/url\(#([^)]+)\)/)?.[1];
      if (id) functionalIds.add(id);
    });
  }
  
  
  for (const id of functionalIds) {
    const newId = `${symbolId}-${id}`;
    processedContent = processedContent.replace(
      new RegExp(`url\\(#${escapeRegex(id)}\\)`, 'g'),
      `url(#${newId})`
    );
  }
  
  
  processedContent = processedContent.replace(/\s+id="([^"]+)"/g, (match, id) => {
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
 * 移除 <svg> 標籤中的 width 和 height，以及 style 屬性
 */
export function processSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') {
    throw new Error('Invalid SVG content provided');
  }
  return svgContent
    .replace(SIZE_ATTRS_REGEX, '')
    .replace(STYLE_REGEX, '')
    .trim();
}

/**
 * 移除 <svg> 標籤中的 width 和 height 屬性
 */
function removeSvgRootSizeAttributes(svgContent: string): string {
  let result = svgContent;
  result = result.replace(/(<svg[^>]*)\s+width="[^"]*"/g, '$1');
  result = result.replace(/(<svg[^>]*)\s+height="[^"]*"/g, '$1');
  return result;
}

/**
 * 將 SVG 轉換為 symbol 元素
 */
export function svgToSymbol(svgContent: string, id: string): string {
  if (!svgContent || !id) {
    throw new Error('SVG content and ID are required');
  }
  const viewBox = extractViewBox(svgContent);
  const processedContent = processCompatibleSvg(svgContent, id);
  const content = processedContent.replace(SVG_TAG_REGEX, '').trim();
  return `<symbol id="${escapeHtml(id)}" viewBox="${viewBox}">${content}</symbol>`;
}

/**
 * 提取或生成 viewBox 屬性
 */
function extractViewBox(svgContent: string): string {
  const viewBoxMatch = svgContent.match(VIEWBOX_REGEX);
  if (viewBoxMatch?.[1]) {
    return viewBoxMatch[1];
  }
  const widthMatch = svgContent.match(WIDTH_REGEX);
  const heightMatch = svgContent.match(HEIGHT_REGEX);
  
  if (widthMatch?.[1] && heightMatch?.[1]) {
    const width = parseFloat(widthMatch[1]);
    const height = parseFloat(heightMatch[1]);
    
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return `0 0 ${width} ${height}`;
    }
  }
  
  // default 24x24 viewBox
  return '0 0 24 24';
}

/**
 * 轉換
*/
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}