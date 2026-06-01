<template>
  <NuxtLayout>
    <NuxtPage />
    <XiaokuAvatar v-if="config.public.enableXiaoku" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();

useHead({
  htmlAttrs: { lang: "zh-CN" },
  link: [
    { rel: "icon", type: "image/png", href: "/kuly-favicon.png?v=4" },
    { rel: "shortcut icon", type: "image/png", href: "/kuly-favicon.png?v=4" },
    { rel: "apple-touch-icon", href: "/kuly-favicon.png?v=4" }
  ]
});
</script>
