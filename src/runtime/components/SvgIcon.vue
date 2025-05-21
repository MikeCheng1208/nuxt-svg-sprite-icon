<script setup lang="ts">
import { computed, defineComponent } from "vue";
// 直接從模板導入選項
import { options as svgOptions } from "#svg-sprite-data";

// 明確定義組件名稱以幫助 DevTools 識別
defineComponent({
  name: "SvgIcon",
});

type Props = {
  name: string;
};

const props = defineProps<Props>();

// 幫助 Nuxt DevTools 找到元件位置
const __file = "src/runtime/components/SvgIcon.vue";

const defaultOptions = {
  defaultSprite: "icons",
  elementClass: "svg-icon",
};

const options = {
  ...defaultOptions,
  ...svgOptions,
};

// 檢查是否啟用了 DevTools 兼容模式
const isDevToolsCompat =
  svgOptions.devtoolsCompat !== false &&
  svgOptions._internal &&
  svgOptions._internal.hasDevTools;

const symbolName = computed(() => {
  if (props.name.includes("/")) {
    return props.name.replace("/", "-");
  }
  return props.name;
});

const svgClass = computed(() => {
  return options.elementClass;
});

const href = computed(() => {
  // 使用完整 URL 形式可以提高與某些工具的兼容性
  return isDevToolsCompat ? `#${symbolName.value}` : `#${symbolName.value}`;
});

// 暴露組件屬性，以幫助 DevTools 檢測
defineExpose({
  symbolName,
  svgClass,
  href,
  props,
});
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
