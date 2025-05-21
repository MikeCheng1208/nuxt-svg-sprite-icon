export interface ModuleOptions {
  /**
   * 讀取的 SVG 圖標目錄
   * @default '~/assets/svg'
   */
  input?: string;
  
  /**
   * 輸出 SVG sprite 的目錄
   * @default '~/assets/sprite/gen'
   */
  output?: string;
  
  /**
   * 預設的 sprite 名稱
   * @default 'icons'
   */
  defaultSprite?: string;
  
  /**
   * SVG 元素的 class 名稱
   * @default 'svg-icon'
   */
  elementClass?: string;
  
  /**
   * 是否優化 SVG 圖標
   * @default false
   */
  optimize?: boolean;
  
  /**
   * SVG 優化選項
   */
  svgoOptions?: any;
  
  /**
   * 是否監控 SVG 檔案變化
   * @default false
   */
  watchFiles?: boolean;
}

export type SpriteMap = {
  [spriteName: string]: {
    path: string
    symbols: string[]
  }
}

