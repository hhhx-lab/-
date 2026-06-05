<template>
  <section v-if="page" :key="page.slug" class="shell service-detail-shell" :class="`service-layout-${page.layout}`">
    <NuxtLink class="back-link" to="/services">返回服务列表</NuxtLink>

    <section class="service-detail-hero" :class="`service-tone-${pageTone}`">
      <div class="service-hero-copy">
        <p class="plain-label">{{ page.eyebrow }}</p>
        <h1 class="mega">{{ page.title }}</h1>
        <p class="lead">{{ page.summary }}</p>
        <p class="service-intro">{{ page.intro }}</p>

        <div class="service-chip-row" aria-label="页面关键词">
          <span v-for="item in page.highlights" :key="item">{{ item }}</span>
        </div>

        <div class="hero-actions">
          <NuxtLink class="button" :to="page.primaryActionTo">{{ page.primaryActionLabel }}</NuxtLink>
          <NuxtLink class="button secondary" :to="page.secondaryActionTo">{{ page.secondaryActionLabel }}</NuxtLink>
        </div>
      </div>

      <aside class="service-hero-aside">
        <article class="panel window service-hero-callout">
          <p class="plain-label">{{ page.asideLabel }}</p>
          <blockquote>{{ page.asideQuote }}</blockquote>
          <p>{{ page.asideDescription }}</p>
        </article>

        <div class="service-hero-points">
          <article v-for="point in page.heroPoints" :key="point.title" class="service-hero-point">
            <strong>{{ point.title }}</strong>
            <p>{{ point.description }}</p>
          </article>
        </div>
      </aside>
    </section>

    <section v-if="page.layout === 'dashboard'" class="section service-terminal panel window">
      <div class="window-label">
        <strong>kuly@ai-cluster:~#</strong>
        <span>Terminal Dashboard</span>
      </div>
      <div class="service-terminal-lines">
        <p><span>kuly@ai-cluster:~#</span> inspect --service=ai_ecosystem</p>
        <p>[OK] Deep validation for {{ page.capabilities.length }} dynamic cloud instances finished.</p>
        <p><span>kuly@ai-cluster:~#</span> show --capabilities</p>
        <p>[MATRIX] {{ page.capabilities.length }} core elements configured natively. Telemetry status: ONLINE</p>
      </div>
    </section>

    <section class="section service-section">
      <p class="section-kicker">{{ sectionLabels.capabilities }}</p>
      <div class="section-head">
        <h2>{{ page.capabilitiesTitle }}</h2>
        <p>{{ page.capabilitiesLead }}</p>
      </div>

      <div class="service-detail-card-grid">
        <article
          v-for="item in page.capabilities"
          :key="item.title"
          class="service-detail-card"
          :class="item.tone ? `tone-${item.tone}` : ''"
        >
          <BrandIcon
            v-if="item.brand"
            :name="item.brand"
            :fallback="item.icon ?? item.title.slice(0, 1)"
            :tile-class="item.tileClass"
          />
          <span v-else class="service-detail-symbol">{{ item.icon }}</span>
          <div class="service-detail-card-copy">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <small v-if="item.note">{{ item.note }}</small>
          </div>
        </article>
      </div>
    </section>

    <section v-if="page.specTable" class="section service-section service-spec-section">
      <p class="section-kicker">{{ sectionLabels.spec }}</p>
      <div class="section-head">
        <h2>{{ page.specTable.title }}</h2>
        <p>{{ page.specTable.lead }}</p>
      </div>

      <table class="kuly-table service-spec-table">
        <thead>
          <tr>
            <th>{{ page.specTable.leftTitle }}</th>
            <th>{{ page.specTable.rightTitle }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><div class="service-spec-cell">{{ page.specTable.leftBody }}</div></td>
            <td><div class="service-spec-cell">{{ page.specTable.rightBody }}</div></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="page.layout === 'dashboard' || page.layout === 'ops'" class="section service-section">
      <p class="section-kicker">{{ sectionLabels.panels }}</p>
      <div class="section-head">
        <h2>{{ page.panelsTitle }}</h2>
        <p>{{ page.panelsLead }}</p>
      </div>

      <div class="service-detail-panels">
        <article v-for="panel in page.panels" :key="panel.title" class="service-detail-panel">
          <p class="plain-label">{{ panel.eyebrow }}</p>
          <h3>{{ panel.title }}</h3>
          <ul>
            <li v-for="item in panel.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section v-if="page.layout === 'pipeline'" class="section service-section">
      <p class="section-kicker">{{ sectionLabels.modes }}</p>
      <div class="section-head">
        <h2>{{ page.panelsTitle }}</h2>
        <p>{{ page.panelsLead }}</p>
      </div>

      <div class="bp-tabs service-mode-tabs">
        <button
          v-for="mode in page.modes ?? []"
          :key="mode.key"
          type="button"
          class="bp-tab-btn"
          :class="{ active: activeModeKey === mode.key }"
          @click="activeModeKey = mode.key"
        >
          {{ mode.title }}
        </button>
      </div>
      <div class="bp-tab-content service-mode-content">
        <strong v-if="activeMode">[ {{ activeMode.title }} ]</strong>
        <br v-if="activeMode" />
        <br v-if="activeMode" />
        <span v-if="activeMode">{{ activeMode.description }}</span>
      </div>
    </section>

    <section class="section service-section">
      <p class="section-kicker">{{ sectionLabels.process }}</p>
      <div class="section-head">
        <h2>{{ page.processTitle }}</h2>
        <p>{{ page.processLead }}</p>
      </div>

      <div class="service-detail-process">
        <article v-for="(step, index) in page.process" :key="step.title" class="service-detail-step">
          <span class="step-num">{{ index + 1 }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="page.layout === 'ops' && page.alerts?.length" class="section service-section">
      <p class="section-kicker">{{ sectionLabels.alerts }}</p>
      <div class="section-head">
        <h2>常见故障卡片</h2>
        <p>把常见报错摊开，排查时更快定位。</p>
      </div>

      <div class="incident-grid">
        <article v-for="item in page.alerts" :key="item.code" class="incident-card">
          <strong>{{ item.code }}</strong>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section id="detail-faq" class="section service-section">
      <p class="section-kicker">{{ sectionLabels.faq }}</p>
      <div class="section-head">
        <h2>{{ page.faqTitle }}</h2>
        <p>{{ page.faqLead }}</p>
      </div>

      <div class="faq service-detail-faq">
        <details v-for="item in page.faq" :key="item.question" open>
          <summary>{{ item.question }}</summary>
          <p>{{ item.answer }}</p>
        </details>
      </div>
    </section>

    <section class="section service-detail-cta">
      <div>
        <p class="plain-label">准备好了</p>
        <h2>{{ page.ctaTitle }}</h2>
        <p class="lead">{{ page.ctaLead }}</p>
      </div>
      <NuxtLink class="button" :to="page.primaryActionTo">{{ page.ctaActionLabel }}</NuxtLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { serviceDetailPages } from "~/content/service-details";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const page = computed(() => {
  const currentPage = serviceDetailPages[slug.value];
  if (!currentPage) {
    throw createError({ statusCode: 404, statusMessage: "服务不存在" });
  }
  return currentPage;
});

const pageTone = computed(() => {
  if (page.value.slug === "ai-tools") return "blue";
  if (page.value.slug === "document-processing") return "lime";
  if (page.value.slug === "tool-development") return "purple";
  return "green";
});

type SectionLabels = {
  capabilities: string;
  panels: string;
  spec: string;
  modes: string;
  alerts: string;
  process: string;
  faq: string;
};

const sectionLabels = computed<SectionLabels>(() => {
  switch (page.value.layout) {
    case "atelier":
      return {
        capabilities: "我们可以处理什么 / Capabilities",
        panels: "",
        spec: "规格交接矩阵 / Specs Matrix",
        modes: "",
        alerts: "",
        process: "处理路径 / Workflow",
        faq: "常见问题 / FAQ"
      };
    case "dashboard":
      return {
        capabilities: "核心 AI 工具深度对齐 / Toolchain Dashboard",
        panels: "酷里全包交付中心 / Infrastructure Core Nodes",
        spec: "",
        modes: "",
        alerts: "",
        process: "AI 工具通常这样处理",
        faq: "常见问题 / FAQ"
      };
    case "pipeline":
      return {
        capabilities: "全栈技术总线管线 / Data Bus Pipelines",
        panels: "",
        spec: "",
        modes: "灵活开发合作模式 / Development Delivery Paradigm",
        alerts: "",
        process: "开发推进路径 / Build Flow",
        faq: "常见问题 / FAQ"
      };
    case "ops":
      return {
        capabilities: "模拟基础设施面板 / Infra Metrics Mock",
        panels: "数据中心集群插槽 / Server Rack Operations Unit",
        spec: "",
        modes: "",
        alerts: "故障救火紧急演练 / Incident Resolution",
        process: "部署推进路径 / Build Flow",
        faq: "常见问题 / FAQ"
      };
  }
});

const activeModeKey = ref("");
watch(
  () => page.value.slug,
  () => {
    activeModeKey.value = page.value.modes?.[0]?.key ?? "";
  },
  { immediate: true }
);

const activeMode = computed(() => page.value.modes?.find((item) => item.key === activeModeKey.value) ?? null);

const seoPath = computed(() => `/services/${slug.value}`);

useKuliSeo({
  title: computed(() => `${page.value.title} | 酷里服务详情`),
  description: computed(() => page.value.seoDescription),
  path: seoPath,
  structuredData: computed(() =>
    page.value.faq.length ? [faqPageJsonLd(page.value.faq.map((item) => ({ question: item.question, answer: item.answer })))] : []
  )
});
</script>
