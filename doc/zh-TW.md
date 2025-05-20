# Nuxt SVG Sprite Icon

<p align=center>
    <a target="_blank" href="https://vuejs.org/" title="vue">
    <a target="_blank" href="http://nodejs.org/download/" title="Nuxt version">
        <img src="https://img.shields.io/badge/Nuxt-%3E%3D%203.0.0-brightgreen.svg">
    </a>
        <img src="https://img.shields.io/badge/Vue-%3E%203.0.0-brightgreen.svg">
    </a>
    <a target="_blank" href="http://nodejs.org/download/" title="Node version">
        <img src="https://img.shields.io/badge/Node-%3E%3D%2020.0.0-brightgreen.svg">
    </a>
    <a target="_blank" href="https://github.com/MikeCheng1208/nuxt-svg-sprite-icon/pulls" title="PRs Welcome">
        <img src="https://img.shields.io/badge/PRs-welcome-blue.svg">
    </a>
</p>

<p align=center>
一個強大的 Nuxt 3 SVG 模組，可自動從您的資源檔案生成 SVG sprite，並提供易於使用的組件來顯示圖示。
</p>

<p align="center">
<a target="_blank" href="https://www.npmjs.com/package/nuxt-svg-sprite-icon">
  <img src="https://nodei.co/npm/nuxt-svg-sprite-icon.png?downloads=true&downloadRank=true&stars=true" alt="NPM version">
</a>
</p>



## 功能特色

- 🚀 **自動生成 SVG 精靈圖** - 自動掃描並轉換 SVG 檔案為精靈圖格式
- 📁 **支援巢狀資料夾** - 將圖示組織在資料夾中以獲得更好的結構
- 🎨 **純 CSS 樣式控制** - 使用 CSS 類別完全控制外觀
- ⚡ **熱重載** - 開發模式檔案監控，即時更新
- 🎯 **TypeScript 支援** - 開箱即用的完整型別安全
- 🌈 **框架無關** - 與 UnoCSS、Tailwind 或任何 CSS 框架無縫協作
- 📦 **零配置** - 使用合理的預設值開箱即用
- 🪶 **輕量級** - 最小化的 API 表面，最大化的靈活性

## 快速設置

1. 將 `nuxt-svg-sprite` 依賴項添加到您的專案

```bash
# 使用 pnpm
pnpm add -D nuxt-svg-sprite

# 使用 yarn
yarn add --dev nuxt-svg-sprite

# 使用 npm
npm install --save-dev nuxt-svg-sprite
```

2. 將 `nuxt-svg-sprite` 添加到 `nuxt.config.ts` 的 `modules` 部分

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-svg-sprite'
  ]
})
```

3. 建立您的 SVG 資源目錄並添加一些 SVG 檔案

```
assets/
  svg/
    home.svg
    search.svg
    user/
      profile.svg
      settings.svg
```

4. 在您的組件中使用 SVG 圖示

```vue
<template>
  <div>
    <!-- 基本用法 -->
    <SvgIcon name="home" />
    
    <!-- 使用 CSS 類別 -->
    <SvgIcon name="home" class="w-6 h-6 text-blue-500" />
    
    <!-- 巢狀資料夾 -->
    <SvgIcon name="user/profile" class="w-8 h-8 fill-green-500" />
    
    <!-- 容器方式 -->
    <div class="w-100px h-100px">
      <SvgIcon name="search" class="w-full h-full fill-red-500" />
    </div>
  </div>
</template>
```

就是這樣！您現在可以使用完全 CSS 控制的 SVG 圖示了 ✨

## 配置

您可以通過在 `nuxt.config.ts` 中添加 `svgSprite` 部分來配置模組：

```js
export default defineNuxtConfig({
  modules: ['nuxt-svg-sprite'],
  svgSprite: {
    // SVG 檔案的來源目錄
    input: '~/assets/svg',
    
    // 生成精靈圖的輸出目錄
    output: '~/assets/sprite/gen',
    
    // 預設精靈圖名稱（用於輸入目錄根目錄中的檔案）
    defaultSprite: 'icons',
    
    // 所有 svg-icon 實例的全域 CSS 類別
    elementClass: 'icon',
    
    // 是否優化 SVG 檔案（需要 svgo）
    optimize: false
  }
})
```

### 配置選項

| 選項 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `input` | `string` | `'~/assets/svg'` | 包含原始 SVG 檔案的目錄 |
| `output` | `string` | `'~/assets/sprite/gen'` | 生成精靈圖檔案的目錄 |
| `defaultSprite` | `string` | `'icons'` | 預設精靈圖名稱（用於根輸入目錄中的 SVG） |
| `elementClass` | `string` | `'icon'` | 應用於所有 `<SvgIcon>` 元素的全域 CSS 類別 |
| `optimize` | `boolean` | `false` | 啟用使用 SVGO 的 SVG 優化 |

## 組件 API

### SvgIcon 組件

`<SvgIcon>` 組件會自動註冊並全域可用。

#### 屬性

| 屬性 | 類型 | 預設值 | 描述 |
|------|------|--------|------|
| `name` | `string` | - | **必需。** 圖示名稱（支援巢狀路徑如 `user/profile`） |

#### 使用範例

```vue
<template>
  <!-- 基本用法，預設 1em 大小 -->
  <SvgIcon name="home" />
  
  <!-- 使用 CSS 類別控制大小 -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- 使用 font-size 控制大小 -->
  <SvgIcon name="home" class="text-2xl" />
  <SvgIcon name="home" style="font-size: 3rem;" />
  
  <!-- 控制顏色 -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- 巢狀資料夾圖示 -->
  <SvgIcon name="user/profile" class="w-10 h-10 text-green-500" />
  
  <!-- 基於容器的尺寸控制 -->
  <div class="w-20 h-20">
    <SvgIcon name="search" class="w-full h-full fill-purple-500" />
  </div>
  
  <!-- 自訂樣式 -->
  <SvgIcon name="home" class="custom-icon" />
  
  <!-- 互動狀態 -->
  <SvgIcon 
    name="home" 
    class="w-8 h-8 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer" 
  />
  
  <!-- 響應式尺寸 -->
  <SvgIcon name="home" class="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8" />
</template>

<style scoped>
.custom-icon {
  width: 3rem;
  height: 3rem;
  color: #3b82f6;
  transition: all 0.2s ease;
}

.custom-icon:hover {
  color: #1d4ed8;
  transform: scale(1.1);
}
</style>
```

## 檔案組織

模組支援巢狀資料夾結構：

```
assets/svg/
├── home.svg              → <SvgIcon name="home" />
├── search.svg            → <SvgIcon name="search" />
├── user/
│   ├── profile.svg       → <SvgIcon name="user/profile" />
│   └── settings.svg      → <SvgIcon name="user/settings" />
└── admin/
    ├── dashboard.svg     → <SvgIcon name="admin/dashboard" />
    └── users.svg         → <SvgIcon name="admin/users" />
```

## 開發

```bash
# 安裝依賴項
npm install

# 生成型別存根
npm run dev:prepare

# 使用 playground 開發
npm run dev

# 建構模組
npm run build

# 執行 ESLint
npm run lint

# 執行 Vitest
npm run test
npm run test:watch

# 發布新版本
npm run release
```

## CSS 框架整合

### 使用 UnoCSS/Tailwind CSS

```vue
<template>
  <!-- 大小控制 -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- 顏色控制 -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- 組合樣式 -->
  <SvgIcon 
    name="user/profile" 
    class="w-10 h-10 text-green-500 hover:text-green-700 transition-all duration-200" 
  />
  
  <!-- 響應式設計 -->
  <SvgIcon name="home" class="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
  
  <!-- 基於容器的方法 -->
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
    <SvgIcon name="home" class="w-8 h-8 text-gray-600" />
  </div>
</template>
```

### 使用自訂 CSS

```vue
<template>
  <SvgIcon name="home" class="icon-large" />
  <SvgIcon name="user/profile" class="icon-animated" />
</template>

<style scoped>
.icon-large {
  width: 4rem;
  height: 4rem;
  color: #3b82f6;
}

.icon-animated {
  width: 2rem;
  height: 2rem;
  transition: transform 0.3s ease;
}

.icon-animated:hover {
  transform: rotate(180deg) scale(1.2);
}
</style>
```


## 疑難排解

### 圖示不顯示

1. **檢查檔案路徑**：確保您的 SVG 檔案在正確的目錄中
2. **驗證建構**：確保模組在您的輸出目錄中生成了精靈圖檔案
3. **檢查控制台**：在瀏覽器控制台中尋找任何錯誤訊息
4. **重啟開發伺服器**：嘗試重啟您的開發伺服器

### 圖示顯示為方塊

這通常表示 SVG 檔案有不正確或缺少的 `viewBox` 屬性。模組會嘗試提取或生成適當的 viewBox 值，但您可能需要手動修復您的 SVG 檔案。

### 尺寸控制問題

- 使用 `width` 和 `height` CSS 屬性或實用類別如 `w-6 h-6`
- 預設大小是 `1em`，所以您也可以通過 `font-size` 控制大小
- 對於基於容器的尺寸，在圖示上使用 `w-full h-full`

## 性能考量

- 所有精靈圖會在頁面載入時注入到 DOM 中
- 對於大型圖示集，考慮將圖示組織到不同的資料夾/精靈圖中
- SVG 優化可以幫助減少檔案大小（使用 `optimize: true` 啟用）
- 純 CSS 方法意味著樣式不需要 JavaScript


## License

MIT.

<!-- 徽章 -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-svg-sprite/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-svg-sprite

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-svg-sprite.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-svg-sprite

[license-src]: https://img.shields.io/npm/l/nuxt-svg-sprite.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-svg-sprite

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com