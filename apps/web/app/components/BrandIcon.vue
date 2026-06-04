<template>
  <span class="brand-icon proto-icon-tile" :class="[`brand-icon-${name}`, tileClass]" aria-hidden="true">
    <img v-if="src" :src="src" :alt="label">
    <span v-else>{{ fallback }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  name?: string;
  fallback?: string;
  tileClass?: string;
}>();

const brandMap: Record<string, { src: string; label: string }> = {
  google: { src: "/brands/google.svg", label: "Google" },
  openai: { src: "/brands/openai.svg", label: "OpenAI" },
  gpt: { src: "/brands/openai.svg", label: "ChatGPT" },
  gemini: { src: "/brands/gemini.svg", label: "Google Gemini" },
  claude: { src: "/brands/anthropic.svg", label: "Claude" },
  anthropic: { src: "/brands/anthropic.svg", label: "Anthropic" },
  youtube: { src: "/brands/youtube.svg", label: "YouTube" },
  telegram: { src: "/brands/telegram.svg", label: "Telegram" },
  cursor: { src: "/brands/cursor.svg", label: "Cursor" },
  xai: { src: "/brands/xai.svg", label: "xAI" },
  grok: { src: "/brands/grok.svg", label: "Grok" },
  codex: { src: "/brands/openai.svg", label: "OpenAI Codex" },
  antigravity: { src: "/brands/antigravity.svg", label: "Google Antigravity" }
};

const normalizedName = computed(() => props.name ?? "");
const brand = computed(() => brandMap[normalizedName.value]);
const src = computed(() => brand.value?.src ?? "");
const label = computed(() => brand.value?.label ?? props.fallback ?? "icon");
</script>
