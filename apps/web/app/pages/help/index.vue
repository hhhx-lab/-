<template>
  <section class="shell docs-home docs-search-band">
    <div class="docs-command">
      <div class="field">
        <label for="doc-search">搜索文档说明</label>
        <input
          id="doc-search"
          v-model="searchQuery"
          type="search"
          placeholder="搜索服务范围、付款、上传、隐私、联系我们"
          @keyup.enter="runSearch"
        >
      </div>
      <button class="button" type="button" :disabled="searchBusy || !searchQuery.trim()" @click="runSearch">
        {{ searchBusy ? "搜索中" : "搜索" }}
      </button>
    </div>

    <div class="docs-search-shortcuts" aria-label="常用文档">
      <button v-for="item in hotDocs" :key="item.slug" type="button" @click="selectDoc(item.slug)">
        {{ item.title }}
      </button>
    </div>

    <div v-if="searched" class="knowledge-results docs-search-results">
      <article v-for="item in searchResults" :key="`${item.slug}-${item.anchor ?? 'top'}`" class="knowledge-card card dense">
        <div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.excerpt }}</p>
        </div>
        <button class="button secondary" type="button" @click="openSearchResult(item)">打开</button>
      </article>
      <div v-if="!searchResults.length" class="empty-state">
        <strong>没有找到匹配文档</strong>
        <p>换一个关键词试试，例如“上传”“定金”“隐私”“联系”</p>
      </div>
    </div>
  </section>

  <section class="shell docs-layout docs-home-reader">
    <aside class="docs-sidebar">
      <strong>文档目录</strong>
      <button
        v-for="item in docs"
        :key="item.slug"
        class="doc-nav-button"
        :class="{ active: item.slug === activeSlug }"
        type="button"
        @click="selectDoc(item.slug)"
      >
        <span>{{ item.title }}</span>
        <small>{{ item.description }}</small>
      </button>
    </aside>

    <article v-if="activeDoc" class="doc-reader">
      <p class="plain-label">{{ categoryLabel(activeDoc.category) }}</p>
      <h1>{{ activeDoc.title }}</h1>
      <p class="lead">{{ activeDoc.description }}</p>
      <p class="doc-meta-line">{{ [...activeDoc.tags, `更新 ${display.date(activeDoc.updatedAt)}`].join(" / ") }}</p>

      <div id="doc-content" class="doc-body" v-html="htmlContent" />
    </article>

    <aside v-if="activeDoc" class="doc-toc doc-home-aside">
      <section>
        <strong>本页目录</strong>
        <button
          v-for="anchor in activeDoc.anchors"
          :key="anchor.id"
          type="button"
          @click="scrollToAnchor(anchor.id)"
        >
          {{ anchor.title }}
        </button>
      </section>
      <section class="doc-hot-list">
        <strong>高频文档</strong>
        <button v-for="item in hotDocs" :key="item.slug" type="button" @click="selectDoc(item.slug)">
          {{ item.title }}
        </button>
      </section>
    </aside>
  </section>
</template>

<script setup lang="ts">
import type { DocDetail, DocSummary } from "~/composables/useApi";
import type { DocSearchResult } from "~/composables/useApi";
import { useDisplayText } from "~/composables/useDisplayText";
import { useMarkdown } from "~/composables/useMarkdown";

const api = useApi();
const route = useRoute();
const router = useRouter();
const markdown = useMarkdown();
const display = useDisplayText();
const searchQuery = ref("");
const searchResults = ref<DocSearchResult[]>([]);
const searchBusy = ref(false);
const searched = ref(false);
const { data: docsData } = await useAsyncData("docs-home", () => api.listDocs());
const docs = computed(() => docsData.value?.docs ?? []);
const activeSlug = ref(String(route.query.doc ?? "quick-start"));
const docCache = reactive<Record<string, DocDetail>>({});
const { data: initialDocData } = await useAsyncData(
  () => `docs-home-active-${activeSlug.value}`,
  () => api.getDoc(activeSlug.value),
  { watch: [activeSlug] }
);

const activeDoc = computed(() => docCache[activeSlug.value] ?? initialDocData.value?.doc ?? null);
const htmlContent = computed(() => markdown.render(activeDoc.value?.content ?? ""));

const hotDocs = computed<DocSummary[]>(() => {
  const wanted = ["quick-start", "concepts", "faq", "upload-policy", "contact"];
  return wanted.map((slug) => docs.value.find((item) => item.slug === slug)).filter(Boolean) as DocSummary[];
});

watch(
  initialDocData,
  (payload) => {
    if (payload?.doc) docCache[payload.doc.slug] = payload.doc;
  },
  { immediate: true }
);

watch(
  () => route.query.doc,
  (slug) => {
    if (slug && String(slug) !== activeSlug.value) activeSlug.value = String(slug);
  }
);

watch(
  docs,
  (items) => {
    if (items.length && !items.some((item) => item.slug === activeSlug.value)) activeSlug.value = "quick-start";
  },
  { immediate: true }
);

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    docs: "文档说明",
    rules: "规则与条款"
  };
  return labels[category] ?? category;
}

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function selectDoc(slug: string) {
  activeSlug.value = slug;
  await router.replace({ path: "/help", query: { doc: slug } });
}

async function runSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;
  searchBusy.value = true;
  searched.value = true;
  try {
    searchResults.value = (await api.searchDocs(query)).results;
  } finally {
    searchBusy.value = false;
  }
}

async function openSearchResult(item: DocSearchResult) {
  await selectDoc(item.slug);
  if (!item.anchor) return;
  await nextTick();
  scrollToAnchor(item.anchor);
}

useKuliSeo({
  title: "酷里文档说明 | 快速开始、核心概念、FAQ 和规则",
  description: "酷里文档说明收录快速开始、核心概念、常见问题、指南、隐私政策、服务条款、上传说明和联系我们，并作为小酷 Agent 的公开业务知识来源。",
  path: "/help"
});
</script>
