import { defineConfig, 
  presetWind3,
  presetAttributify, } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
  ],
  shortcuts: [
    ['btn', 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors'],
    ['icon-container', 'flex items-center gap-4 p-4 border border-gray-200 rounded-lg'],
    ['demo-section', 'mb-8 p-6 bg-gray-50 rounded-lg'],
  ],
  rules: [
    [/^border-(\d+)$/, ([, d]) => ({ border: `${d}px solid` })],
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
    }
  }
})