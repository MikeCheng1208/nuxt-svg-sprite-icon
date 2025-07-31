<script setup lang="ts">
import { computed } from "vue";
import { options as svgOptions } from "#svg-sprite-data";

type Props = {
  name: string;
};

const props = defineProps<Props>();

// 支援 Nuxt DevTools 找到元件位置
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
    return props.name.replace(/\//g, "-");
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
    <use :href="href" />
  </svg>
</template>

<style scoped>
.svg-icon {
  vertical-align: middle;
}
</style>
