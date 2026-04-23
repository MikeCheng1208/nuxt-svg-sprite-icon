<template>
  <div class="w-full h-full p-4">
    <h1 class="text-2xl mb-4">SVG Icon 測試</h1>

    <div class="border p-4">
      <h2 class="text-lg mb-2">BUY 圖標：</h2>
      <div class="w-100px h-100px bg-red-500">
        <SvgIcon
          name="icon-bought"
          class="w-24px h-20px text-white mr-8px"
          style="fill: #b2b2b2"
        />
      </div>
    </div>

    <div class="space-y-4">
      <!-- 原本可以顯示的圖標 -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">原本可以顯示的圖標：</h2>
        <div class="w-100px h-100px bg-black">
          <SvgIcon name="btn-go" class="fill-red-500 w-full h-full" />
        </div>
        <div class="w-100px h-100px bg-black mt-2">
          <SvgIcon name="working_icon" class="fill-green-500 w-full h-full" />
        </div>
      </div>

      <!-- 無法顯示的圖標 -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">無法顯示的圖標（btn_message）：</h2>
        <div class="w-100px h-100px bg-black">
          <SvgIcon name="btn_message" class="fill-yellow-500 w-full h-full" />
        </div>
      </div>

      <!-- 複雜的圖標測試 -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">複雜的圖標：</h2>
        <div class="w-100px h-100px bg-gray-100">
          <SvgIcon name="test_complex" class="w-full h-full" />
        </div>
      </div>

      <!-- 子目錄的圖標 -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">子目錄圖標：</h2>
        <div class="w-100px h-100px bg-black">
          <SvgIcon name="user/icon-fly" class="fill-blue-500 w-full h-full" />
        </div>
      </div>

      <!-- Gradient/Defs 相容性測試 -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">Gradient/Defs 相容性測試：</h2>
        <div class="w-100px h-100px bg-gray-100">
          <!-- 注意：不要加任何 fill/text 類別，避免覆蓋 path 內的 fill="url(#...)" -->
          <SvgIcon name="gradient-star" class="w-full h-full" />
        </div>
      </div>

      <!-- stroke 圖標測試（fill="none" 修復驗證） -->
      <div class="border p-4">
        <h2 class="text-lg mb-2">Stroke 圖標測試（fill="none" 修復）：</h2>
        <p class="text-sm text-gray-500 mb-2">應顯示為線條描邊風格，不應出現黑色實心色塊</p>
        <div class="flex gap-4 items-center">
          <div>
            <p class="text-xs mb-1">SvgIcon eye</p>
            <SvgIcon name="eye" class="w-8 h-8" />
          </div>
          <div>
            <p class="text-xs mb-1">SvgIcon eye-close</p>
            <SvgIcon name="eye-close" class="w-8 h-8" />
          </div>
          <div>
            <p class="text-xs mb-1">原始 inline SVG（對照組）</p>
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.49951C3 3.49951 1 8 1 8C1 8 3 12.4995 8 12.4995C13 12.4995 15 8 15 8C15 8 13 3.49951 8 3.49951Z" stroke="#060A26" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6.25C8.9665 6.25 9.75 7.0335 9.75 8C9.75 8.9665 8.9665 9.75 8 9.75C7.0335 9.75 6.25 8.9665 6.25 8C6.25 7.0335 7.0335 6.25 8 6.25Z" stroke="#060A26" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
#__nuxt {
  width: 100vw;
  height: 100vh;
}
</style>
