<template>
  <section class="shell docs-layout">
    <aside class="docs-sidebar">
      <NuxtLink class="back-link" to="/help">← 文档中心</NuxtLink>
      <strong>文档目录</strong>
      <NuxtLink v-for="item in docs" :key="item.slug" :class="{ active: item.slug === doc?.slug }" :to="`/help?doc=${item.slug}`">
        <span>{{ item.title }}</span>
        <small>{{ item.description }}</small>
      </NuxtLink>
    </aside>

    <article v-if="doc" class="doc-reader">
      <p class="plain-label">{{ doc.category === "docs" ? "文档中心" : doc.category }}</p>
      <h1>{{ doc.title }}</h1>
      <p class="lead">{{ doc.description }}</p>
      <p class="doc-meta-line">{{ [...doc.tags, `更新 ${display.date(doc.updatedAt)}`].join(" / ") }}</p>
      <div class="doc-body" v-html="htmlContent" />
      <footer class="doc-related">
        <strong>继续阅读</strong>
        <NuxtLink v-for="item in doc.relatedDocs" :key="item.slug" class="chip" :to="`/help?doc=${item.slug}`">{{ item.title }}</NuxtLink>
      </footer>
    </article>

    <aside v-if="doc" class="doc-toc">
      <strong>本页目录</strong>
      <a v-for="anchor in doc.anchors" :key="anchor.id" :href="`#${anchor.id}`">{{ anchor.title }}</a>
    </aside>
  </section>
</template>

<script setup lang="ts">
import type { DocDetail, DocSummary } from "~/composables/useApi";

const route = useRoute();
const api = useApi();
const markdown = useMarkdown();
const display = useDisplayText();
const slug = computed(() => String(route.params.slug));
const { data: docsData } = await useAsyncData("docs-nav", () => api.listDocs());
const { data: docData, error } = await useAsyncData(`doc-${slug.value}`, () => api.getDoc(slug.value));

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: "文档不存在" });
}

const docs = computed<DocSummary[]>(() => docsData.value?.docs ?? []);
const doc = computed<DocDetail | null>(() => docData.value?.doc ?? null);
const htmlContent = computed(() => markdown.render(doc.value?.content ?? ""));
const faqStructuredData = computed(() => {
  if (doc.value?.slug !== "faq") return [];
  const entries = markdownFaqItems(doc.value.content);
  return entries.length ? [faqPageJsonLd(entries)] : [];
});

useKuliSeo({
  title: computed(() => (doc.value ? `${doc.value.title} | 酷里文档中心` : "酷里文档中心")),
  description: computed(() => (
    doc.value
      ? `${doc.value.description} 阅读酷里文档中心，了解服务范围、订单规则、材料准备、付款验收和安全边界。`
      : "阅读酷里文档中心，了解服务范围、订单规则、材料准备、付款验收和安全边界。"
  )),
  path: computed(() => `/help/${slug.value}`),
  structuredData: faqStructuredData
});

function markdownFaqItems(markdownText: string) {
  const lines = markdownText.split("\n");
  const entries: Array<{ question: string; answer: string }> = [];
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  function flush() {
    if (currentQuestion && currentAnswer.length) entries.push({ question: currentQuestion, answer: currentAnswer.join(" ").trim() });
    currentQuestion = "";
    currentAnswer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === "---" || line.includes(":")) continue;
    const heading = line.match(/^##\s+(.+?)(?:\s+\{#[a-z0-9-]+\})?$/);
    if (heading) {
      flush();
      currentQuestion = heading[1] ?? "";
      continue;
    }
    if (currentQuestion && !line.startsWith("#")) currentAnswer.push(line.replace(/^- /, ""));
  }
  flush();
  return entries;
}
</script>
