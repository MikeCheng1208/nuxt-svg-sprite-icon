# Nuxt SVG Sprite Icon
<p align="center">
  <img width="200px" src="./assets/nuxt-svg-sprite-icon.png" />
</p>


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

<p align=center>Nuxt 3 用の強力な SVG スプライトモジュール。アセットから SVG スプライトを自動生成し、アイコンを表示するための使いやすいコンポーネントを提供します。</p>

<p align="center">
<a target="_blank" href="https://www.npmjs.com/package/nuxt-svg-sprite-icon">
  <img src="https://nodei.co/npm/nuxt-svg-sprite-icon.png?downloads=true&downloadRank=true&stars=true" alt="NPM version">
</a>
</p>

## 機能

- 🚀 **SVG スプライトの自動生成** - SVG ファイルを自動でスキャンしてスプライト形式に変換
- 📁 **ネストしたフォルダ対応** - アイコンをフォルダで整理してより良い構造化が可能
- 🎨 **CSS のみのスタイリング** - CSS クラスを使用して外観を完全制御
- ⚡ **ホットリロード** - 開発モードでファイル監視による即座の更新
- 🎯 **TypeScript サポート** - 箱から出してすぐに使える完全な型安全性
- 🌈 **フレームワーク非依存** - UnoCSS、Tailwind、その他の CSS フレームワークとシームレスに連携
- 📦 **ゼロ設定** - 適切なデフォルト値で箱から出してすぐに動作
- 🪶 **軽量** - 最小限の API 表面で最大の柔軟性

## クイックセットアップ

1. プロジェクトに `nuxt-svg-sprite-icon` 依存関係を追加

```bash
# pnpm を使用
pnpm add -D nuxt-svg-sprite-icon

# yarn を使用
yarn add --dev nuxt-svg-sprite-icon

# npm を使用
npm install --save-dev nuxt-svg-sprite-icon
```

2. `nuxt.config.ts` の `modules` セクションに `nuxt-svg-sprite-icon` を追加

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-svg-sprite-icon'
  ]
})
```

3. SVG アセットディレクトリを作成し、SVG ファイルを追加

```
assets/
  svg/
    home.svg
    search.svg
    user/
      profile.svg
      settings.svg
```

4. コンポーネントで SVG アイコンを使用

```vue
<template>
  <div>
    <!-- 基本的な使用法 -->
    <SvgIcon name="home" />
    
    <!-- CSS クラスと一緒に -->
    <SvgIcon name="home" class="w-6 h-6 text-blue-500" />
    
    <!-- ネストしたフォルダ -->
    <SvgIcon name="user/profile" class="w-8 h-8 fill-green-500" />
    
    <!-- コンテナアプローチ -->
    <div class="w-100px h-100px">
      <SvgIcon name="search" class="w-full h-full fill-red-500" />
    </div>
  </div>
</template>
```

これで完了です！完全な CSS 制御で SVG アイコンが使用できます ✨

## 設定

`nuxt.config.ts` に `svgSprite` セクションを追加してモジュールを設定できます：

```js
export default defineNuxtConfig({
  modules: ['nuxt-svg-sprite-icon'],
  svgSprite: {
    // SVG ファイルのソースディレクトリ
    input: '~/assets/svg',
    
    // 生成されたスプライトの出力ディレクトリ
    output: '~/assets/sprite/gen',
    
    // デフォルトスプライト名（入力ディレクトリのルートにあるファイル用）
    defaultSprite: 'icons',
    
    // すべての svg-icon インスタンスのグローバル CSS クラス
    elementClass: 'svg-icon',
    
    // SVG ファイルを最適化するかどうか（svgo が必要）
    optimize: false
  }
})
```

### 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|---|-----------|------|
| `input` | `string` | `'~/assets/svg'` | 元の SVG ファイルが含まれるディレクトリ |
| `output` | `string` | `'~/assets/sprite/gen'` | 生成されたスプライトファイルのディレクトリ |
| `defaultSprite` | `string` | `'icons'` | デフォルトスプライト名（ルート入力ディレクトリの SVG 用） |
| `elementClass` | `string` | `'svg-icon'` | すべての `<SvgIcon>` 要素に適用されるグローバル CSS クラス |
| `optimize` | `boolean` | `false` | SVGO を使用した SVG 最適化を有効にする |

## コンポーネント API

### SvgIcon コンポーネント

`<SvgIcon>` コンポーネントは自動的に登録され、グローバルで利用可能です。

#### Props

| Prop | 型 | デフォルト | 説明 |
|------|---|-----------|------|
| `name` | `string` | - | **必須。** アイコン名（`user/example` のようなネストしたパスをサポート） |

#### 使用例

```vue
<template>
  <!-- デフォルト 1em サイズでの基本的な使用法 -->
  <SvgIcon name="home" />
  
  <!-- CSS クラスでサイズを制御 -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- font-size でサイズを制御 -->
  <SvgIcon name="home" class="text-2xl" />
  <SvgIcon name="home" style="font-size: 3rem;" />
  
  <!-- 色を制御 -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- ネストしたフォルダのアイコン -->
  <SvgIcon name="user/profile" class="w-10 h-10 text-green-500" />
  
  <!-- コンテナベースのサイジング -->
  <div class="w-20 h-20">
    <SvgIcon name="search" class="w-full h-full fill-purple-500" />
  </div>
  
  <!-- カスタムスタイル -->
  <SvgIcon name="home" class="custom-icon" />
  
  <!-- インタラクティブな状態 -->
  <SvgIcon 
    name="home" 
    class="w-8 h-8 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer" 
  />
  
  <!-- レスポンシブサイジング -->
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

## ファイル構成

モジュールはネストしたフォルダ構造をサポートします：

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

## 開発

```bash
# 依存関係をインストール
npm install

# 型定義スタブを生成し、開発環境を準備
npm run dev:prepare

# プレイグラウンドで開発
npm run dev

# プレイグラウンドをビルド
npm run dev:build

# モジュールをビルド
npm run prepack

# 型チェックを実行
npm run test:types

# 新バージョンをリリース
npm run release
```

## CSS フレームワーク統合

### UnoCSS/Tailwind CSS との使用

```vue
<template>
  <!-- サイズ制御 -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- 色制御 -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- 結合されたスタイリング -->
  <SvgIcon 
    name="user/profile" 
    class="w-10 h-10 text-green-500 hover:text-green-700 transition-all duration-200" 
  />
  
  <!-- レスポンシブデザイン -->
  <SvgIcon name="home" class="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
  
  <!-- コンテナベースのアプローチ -->
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
    <SvgIcon name="home" class="w-8 h-8 text-gray-600" />
  </div>
</template>
```

### カスタム CSS との使用

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

## トラブルシューティング

### アイコンが表示されない

1. **ファイルパスを確認**：SVG ファイルが正しいディレクトリにあることを確認
2. **ビルドを検証**：モジュールが出力ディレクトリにスプライトファイルを生成したことを確認
3. **コンソールを確認**：ブラウザコンソールでエラーメッセージを確認
4. **開発サーバーを再起動**：開発サーバーの再起動を試す

### アイコンが四角形として表示される

通常、SVG ファイルの `viewBox` 属性が不正または不足していることを示します。モジュールは適切な viewBox 値を抽出または生成しようとしますが、SVG ファイルを手動で修正する必要がある場合があります。

### サイズ制御の問題

- `width` と `height` CSS プロパティまたは `w-6 h-6` のようなユーティリティクラスを使用
- デフォルトサイズは `1em` なので、`font-size` でサイズを制御することも可能
- コンテナベースのサイジングには、アイコンに `w-full h-full` を使用

## パフォーマンスの考慮事項

- すべてのスプライトはページ読み込み時に DOM に注入されます
- 大きなアイコンセットの場合、アイコンを異なるフォルダ/スプライトに整理することを検討
- SVG 最適化はファイルサイズの削減に役立ちます（`optimize: true` で有効化）
- CSS のみのアプローチは、スタイリングに JavaScript が不要であることを意味します

## ライセンス

MIT.

<!-- バッジ -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-svg-sprite-icon/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-svg-sprite-icon

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-svg-sprite-icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-svg-sprite-icon

[license-src]: https://img.shields.io/npm/l/nuxt-svg-sprite-icon.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-svg-sprite-icon

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com