<script setup lang="ts">
import { computed } from "vue";
// 直接從模板導入選項
import { options as svgOptions } from "#svg-sprite-data";

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

const symbolName = computed(() => {
  if (props.name.includes("/")) {
    return props.name.replace("/", "-");
  }
  return props.name;
});

const svgClass = computed(() => {
  return options.elementClass;
});

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
