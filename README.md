# Nuxt SVG Sprite

[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A powerful SVG sprite module for Nuxt 3 that automatically generates SVG sprites from your assets and provides an easy-to-use component for displaying icons.

[📖 &nbsp;Read more](https://github.com/your-username/nuxt-svg-sprite)

## Features

- 🚀 **Auto-generated SVG sprites** - Automatically scans and converts SVG files to sprite format
- 📁 **Nested folder support** - Organize your icons in folders for better structure
- 🎨 **CSS-only styling** - Full control over appearance using CSS classes
- ⚡ **Hot reload** - Development mode file watching for instant updates
- 🎯 **TypeScript support** - Full type safety out of the box
- 🌈 **Framework agnostic** - Works seamlessly with UnoCSS, Tailwind, or any CSS framework
- 📦 **Zero configuration** - Works out of the box with sensible defaults
- 🪶 **Lightweight** - Minimal API surface with maximum flexibility

## Quick Setup

1. Add `nuxt-svg-sprite` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-svg-sprite

# Using yarn
yarn add --dev nuxt-svg-sprite

# Using npm
npm install --save-dev nuxt-svg-sprite
```

2. Add `nuxt-svg-sprite` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-svg-sprite'
  ]
})
```

3. Create your SVG assets directory and add some SVG files

```
assets/
  svg/
    home.svg
    search.svg
    user/
      profile.svg
      settings.svg
```

4. Use the SVG icons in your components

```vue
<template>
  <div>
    <!-- Basic usage -->
    <SvgIcon name="home" />
    
    <!-- With CSS classes -->
    <SvgIcon name="home" class="w-6 h-6 text-blue-500" />
    
    <!-- Nested folder -->
    <SvgIcon name="user/profile" class="w-8 h-8 fill-green-500" />
    
    <!-- Container approach -->
    <div class="w-100px h-100px">
      <SvgIcon name="search" class="w-full h-full fill-red-500" />
    </div>
  </div>
</template>
```

That's it! You can now use SVG icons with complete CSS control ✨

## Configuration

You can configure the module by adding a `svgSprite` section to your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ['nuxt-svg-sprite'],
  svgSprite: {
    // Source directory for SVG files
    input: '~/assets/svg',
    
    // Output directory for generated sprites
    output: '~/assets/sprite/gen',
    
    // Default sprite name (for files in root of input directory)
    defaultSprite: 'icons',
    
    // Global CSS class for all svg-icon instances
    elementClass: 'icon',
    
    // Whether to optimize SVG files (requires svgo)
    optimize: false
  }
})
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `input` | `string` | `'~/assets/svg'` | Directory containing original SVG files |
| `output` | `string` | `'~/assets/sprite/gen'` | Directory for generated sprite files |
| `defaultSprite` | `string` | `'icons'` | Name of default sprite (for SVGs in root input directory) |
| `elementClass` | `string` | `'icon'` | Global CSS class applied to all `<SvgIcon>` elements |
| `optimize` | `boolean` | `false` | Enable SVG optimization using SVGO |

## Component API

### SvgIcon Component

The `<SvgIcon>` component is automatically registered and available globally.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | **Required.** Name of the icon (supports nested paths like `user/profile`) |


#### Usage Examples

```vue
<template>
  <!-- Basic usage with default 1em size -->
  <SvgIcon name="home" />
  
  <!-- Control size with CSS classes -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- Control size with font-size -->
  <SvgIcon name="home" class="text-2xl" />
  <SvgIcon name="home" style="font-size: 3rem;" />
  
  <!-- Control color -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- Nested folder icons -->
  <SvgIcon name="user/profile" class="w-10 h-10 text-green-500" />
  
  <!-- Container-based sizing -->
  <div class="w-20 h-20">
    <SvgIcon name="search" class="w-full h-full fill-purple-500" />
  </div>
  
  <!-- Custom styles -->
  <SvgIcon name="home" class="custom-icon" />
  
  <!-- Interactive states -->
  <SvgIcon 
    name="home" 
    class="w-8 h-8 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer" 
  />
  
  <!-- Responsive sizing -->
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

## File Organization

The module supports nested folder structures:

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


## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the module
npm run build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

## CSS Framework Integration

### With UnoCSS/Tailwind CSS

```vue
<template>
  <!-- Size control -->
  <SvgIcon name="home" class="w-6 h-6" />
  <SvgIcon name="home" class="w-8 h-8" />
  
  <!-- Color control -->
  <SvgIcon name="home" class="text-blue-500" />
  <SvgIcon name="home" class="fill-red-600" />
  
  <!-- Combined styling -->
  <SvgIcon 
    name="user/profile" 
    class="w-10 h-10 text-green-500 hover:text-green-700 transition-all duration-200" 
  />
  
  <!-- Responsive design -->
  <SvgIcon name="home" class="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
  
  <!-- Container-based approach -->
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
    <SvgIcon name="home" class="w-8 h-8 text-gray-600" />
  </div>
</template>
```

### With Custom CSS

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


## Troubleshooting

### Icons not displaying

1. **Check file paths**: Ensure your SVG files are in the correct directory
2. **Verify build**: Make sure the module generated sprite files in your output directory
3. **Check console**: Look for any error messages in the browser console
4. **Restart dev server**: Try restarting your development server

### Icons appear as squares

This usually indicates that the SVG files have incorrect or missing `viewBox` attributes. The module attempts to extract or generate appropriate viewBox values, but you may need to manually fix your SVG files.

### Size control issues

- Use `width` and `height` CSS properties or utility classes like `w-6 h-6`
- The default size is `1em`, so you can also control size via `font-size`
- For container-based sizing, use `w-full h-full` on the icon

## Performance Considerations

- All sprites are injected into the DOM on page load
- For large icon sets, consider organizing icons into different folders/sprites
- SVG optimization can help reduce file sizes (enable with `optimize: true`)
- The CSS-only approach means no JavaScript is needed for styling

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-svg-sprite/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-svg-sprite

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-svg-sprite.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-svg-sprite

[license-src]: https://img.shields.io/npm/l/nuxt-svg-sprite.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-svg-sprite

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com