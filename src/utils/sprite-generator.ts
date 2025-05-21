import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, relative, dirname, basename } from 'path'
import { existsSync } from 'fs'
import type { ModuleOptions, SpriteMap } from '../types'
import { processSvg, svgToSymbol } from './svg-processor'

export async function generateSprites(inputPath: string, outputPath: string, options: ModuleOptions) {
  const spriteMap: SpriteMap = {}
  const spriteContent: Record<string, string> = {}
  
  // 確保輸出目錄存在
  if (!existsSync(outputPath)) {
    await mkdir(outputPath, { recursive: true })
  }
  
  // 遞歸讀取所有 SVG 檔案
  const svgFiles = await getSvgFiles(inputPath)
  
  // 按資料夾分組
  const groups: Record<string, Array<{ path: string, name: string, content: string }>> = {}
  
  for (const filePath of svgFiles) {
    const relativePath = relative(inputPath, filePath)
    const dir = dirname(relativePath)
    const name = basename(relativePath, '.svg')
    
    const spriteName = dir === '.' ? options.defaultSprite! : dir.replace(/\//g, '-')
    const symbolName = dir === '.' ? name : `${dir.replace(/\//g, '-')}-${name}`
    
    if (!groups[spriteName]) {
      groups[spriteName] = []
    }
    
    const svgContent = await readFile(filePath, 'utf-8')
    const processedSvg = options.optimize ? processSvg(svgContent) : svgContent
    
    groups[spriteName].push({
      path: relativePath.replace(/\//g, '/'),
      name: symbolName,
      content: processedSvg
    })
  }
  
  // 生成 sprite 檔案
  for (const [spriteName, svgs] of Object.entries(groups)) {
    const symbols = svgs.map(svg => svgToSymbol(svg.content, svg.name)).join('\n')
    const spriteFile = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${symbols}
</svg>`
    
    const spritePath = join(outputPath, `${spriteName}.svg`)
    await writeFile(spritePath, spriteFile, 'utf-8')
    
    spriteMap[spriteName] = {
      path: spritePath,
      symbols: svgs.map(svg => svg.name)
    }
    
    spriteContent[spriteName] = spriteFile
  }
  
  return { spriteMap, spriteContent }
}

async function getSvgFiles(dir: string, files: string[] = []): Promise<string[]> {
  if (!existsSync(dir)) {
    return files
  }
  
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      await getSvgFiles(fullPath, files)
    } else if (entry.isFile() && entry.name.endsWith('.svg')) {
      files.push(fullPath)
    }
  }
  
  return files
}