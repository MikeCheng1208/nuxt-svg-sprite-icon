<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// 直接從模板導入選項
import { options as svgOptions } from "#svg-sprite-data";

type Props = {
  name: string;
  sprite?: string;
};

const props = withDefaults(defineProps<Props>(), {
  sprite: undefined,
});

// 添加此行，幫助 Nuxt DevTools 找到元件源代碼位置
const __file = "src/runtime/components/SvgIcon.vue";

// 默認選項
const defaultOptions = {
  defaultSprite: "icons",
  elementClass: "svg-icon",
};

// 合併選項
const options = {
  ...defaultOptions,
  ...svgOptions,
};

// 解析 sprite 和 symbol 名稱
const spriteName = computed(() => {
  if (props.sprite) return props.sprite;

  // 如果 name 包含 '/'，使用第一部分作為 sprite 名稱
  if (props.name.includes("/")) {
    return props.name.split("/")[0];
  }

  return options.defaultSprite;
});

const symbolName = computed(() => {
  if (props.name.includes("/")) {
    return props.name.replace("/", "-");
  }
  return props.name;
});

// SVG 類別
const svgClass = computed(() => {
  return options.elementClass;
});

// href 屬性
const href = computed(() => `#${symbolName.value}`);
</script>

<template>
  <svg :class="svgClass" aria-hidden="true">
    <use class="pointer-events-none" :xlink:href="href" />
  </svg>
</template>

<style scoped>
svg.svg-icon {
  display: block;
  vertical-align: middle;
}
</style>
