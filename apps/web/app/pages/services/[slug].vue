<template>
  <section v-if="page" :key="page.slug" class="shell service-detail-shell">
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

    <section class="section service-section">
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

    <section class="section service-section">
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

    <section class="section service-section">
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

    <section id="detail-faq" class="section service-section">
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
