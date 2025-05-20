<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from "vue";
type Props = {
  name: string;
  sprite?: string;
};

const props = withDefaults(defineProps<Props>(), {
  sprite: undefined,
});

// 添加此行，幫助 Nuxt DevTools 找到元件源代碼位置
const __file = "src/runtime/components/SvgIcon.vue";

const spriteData = ref<any>(null);

// 解析 sprite 和 symbol 名稱
const spriteName = computed(() => {
  if (!spriteData.value) return "icons";

  if (props.sprite) return props.sprite;

  // 如果 name 包含 '/'，使用第一部分作為 sprite 名稱
  if (props.name.includes("/")) {
    return props.name.split("/")[0];
  }

  return spriteData.value.options.defaultSprite;
});

const symbolName = computed(() => {
  if (props.name.includes("/")) {
    return props.name.replace("/", "-");
  }
  return props.name;
});

//
const svgClass = computed(() => {
  if (!spriteData.value) return "svg-icon";
  return spriteData.value.options.elementClass;
});

//  href
const href = computed(() => `#${symbolName.value}`);

onMounted(async () => {
  try {
    spriteData.value = await import("#svg-sprite-map");
  } catch (error) {
    console.warn("Failed to load sprite map:", error);
    spriteData.value = {
      spriteMap: {},
      spriteContent: {},
      options: { defaultSprite: "icons", elementClass: "svg-icon" },
    };
  }
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
