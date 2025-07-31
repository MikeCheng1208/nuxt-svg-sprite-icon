import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises'
import { join, relative, dirname, basename } from 'path'
import { existsSync } from 'fs'
import type { ModuleOptions, SpriteGenerationResult } from '../types'
import { processSvg, svgToSymbol } from './svg-processor'

// 批次處理大小，避免記憶體問題
const BATCH_SIZE = 50;

type SvgFileInfo = {
  readonly filePath: string;
  readonly relativePath: string;
  readonly spriteName: string;
  readonly symbolName: string;
}

/**
 * 生成 SVG sprites
 */
export async function generateSprites(
  inputPath: string, 
  outputPath: string, 
  options: ModuleOptions
): Promise<SpriteGenerationResult> {
  try {
    
    if (!inputPath || !outputPath) {
      throw new Error('Input and output paths are required');
    }

    
    await ensureDirectory(outputPath);
    
    
    const svgFiles = await getSvgFiles(inputPath);
    
    if (svgFiles.length === 0) {
      console.warn(`No SVG files found in ${inputPath}`);
      return { spriteMap: {}, spriteContent: {} };
    }

    // 將文件按 sprite
    const fileGroups = groupFilesBySprite(svgFiles, inputPath, options);
    
    // 批次處理生成 sprites
    const results = await processSpriteGroups(fileGroups, outputPath, options);
    
    return results;
  } catch (error) {
    console.error('Error generating sprites:', error);
    throw error;
  }
}

/**
 * 確保目錄存在
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * 遞迴獲取所有 SVG 文件（優化版本）
 */
async function getSvgFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  if (!existsSync(dir)) {
    return files;
  }

  try {
    const dirStat = await stat(dir);
    if (!dirStat.isDirectory()) {
      return files;
    }

    await collectSvgFilesRecursive(dir, files);
    return files;
  } catch (error) {
    console.warn(`Error reading directory ${dir}:`, error);
    return files;
  }
}

/**
 * 遞迴收集 SVG 文件
 */
async function collectSvgFilesRecursive(dir: string, files: string[]): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    
    const directories: string[] = [];
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        directories.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        files.push(fullPath);
      }
    }
    
    
    await Promise.all(
      directories.map(subDir => collectSvgFilesRecursive(subDir, files))
    );
  } catch (error) {
    console.warn(`Error reading directory ${dir}:`, error);
  }
}

/**
 * 將文件按 sprite 分組
 */
function groupFilesBySprite(
  svgFiles: string[], 
  inputPath: string, 
  options: ModuleOptions
): Map<string, SvgFileInfo[]> {
  const groups = new Map<string, SvgFileInfo[]>();
  
  for (const filePath of svgFiles) {
    const relativePath = relative(inputPath, filePath);
    const dir = dirname(relativePath);
    const name = basename(relativePath, '.svg');
    
    // 生成 sprite 名稱和 symbol 名稱
    const spriteName = dir === '.' ? options.defaultSprite! : dir.replace(/[/\\]/g, '-');
    const symbolName = dir === '.' ? name : `${dir.replace(/[/\\]/g, '-')}-${name}`;
    
    const fileInfo: SvgFileInfo = {
      filePath,
      relativePath,
      spriteName,
      symbolName
    };
    
    if (!groups.has(spriteName)) {
      groups.set(spriteName, []);
    }
    groups.get(spriteName)!.push(fileInfo);
  }
  
  return groups;
}

/**
 * 處理 sprite 群組
 */
async function processSpriteGroups(
  fileGroups: Map<string, SvgFileInfo[]>, 
  outputPath: string, 
  options: ModuleOptions
): Promise<SpriteGenerationResult> {
  const spriteMap: Record<string, { path: string; symbols: string[] }> = {};
  const spriteContent: Record<string, string> = {};
  
  // 並行處理所有 sprite 群組
  const spritePromises = Array.from(fileGroups.entries()).map(
    ([spriteName, files]) => processSingleSprite(spriteName, files, outputPath, options)
  );
  
  const results = await Promise.all(spritePromises);
  
  // 合併結果
  for (const result of results) {
    if (result) {
      spriteMap[result.spriteName] = {
        path: result.spritePath,
        symbols: result.symbols
      };
      spriteContent[result.spriteName] = result.content;
    }
  }
  
  return { spriteMap, spriteContent };
}

/**
 * 處理單個 sprite
 */
async function processSingleSprite(
  spriteName: string, 
  files: SvgFileInfo[], 
  outputPath: string, 
  options: ModuleOptions
): Promise<{ spriteName: string; spritePath: string; symbols: string[]; content: string } | null> {
  try {
    const symbols: string[] = [];
    const symbolElements: string[] = [];
    
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (fileInfo) => {
        try {
          const svgContent = await readFile(fileInfo.filePath, 'utf-8');
          
          const processedSvg = options.optimize ? processSvg(svgContent) : svgContent;
          const symbolElement = svgToSymbol(processedSvg, fileInfo.symbolName);
          
          return {
            symbolName: fileInfo.symbolName,
            symbolElement
          };
        } catch (error) {
          console.warn(`Error processing SVG file ${fileInfo.filePath}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result) {
          symbols.push(result.symbolName);
          symbolElements.push(result.symbolElement);
        }
      }
    }
    
    if (symbolElements.length === 0) {
      console.warn(`No valid SVG files found for sprite: ${spriteName}`);
      return null;
    }
    
    // 生成 sprite 內容
    const spriteContent = generateSpriteContent(symbolElements);
    const spritePath = join(outputPath, `${spriteName}.svg`);
    
    // 寫入文件
    await writeFile(spritePath, spriteContent, 'utf-8');
    
    return {
      spriteName,
      spritePath,
      symbols,
      content: spriteContent
    };
  } catch (error) {
    console.error(`Error processing sprite ${spriteName}:`, error);
    return null;
  }
}

/**
 * 生成 sprite 內容
 */
function generateSpriteContent(symbolElements: string[]): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbolElements.join('\n')}
</svg>`;
}