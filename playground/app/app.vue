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
        <h2 class="text-lg mb-2">複雜的圖標（變成正方形的問題）：</h2>
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
