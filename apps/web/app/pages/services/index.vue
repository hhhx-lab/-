<template>
  <section class="shell proto-needs-page">
    <header class="proto-needs-hero">
      <div>
        <h1>最近大家最常问的，都在这了</h1>
        <p>如果你也在折腾 GPT、Google、Claude、API、中转配置这些，可以直接从这里进。</p>
        <form class="proto-need-search" @submit.prevent="goSearch">
          <span aria-hidden="true">⌕</span>
          <input v-model="query" type="search" placeholder="你也可以直接说你想干嘛......">
          <button type="submit" aria-label="提交需求搜索">→</button>
        </form>
      </div>
      <article class="proto-sticky-note proto-note-lime proto-needs-note">
        <span class="proto-tape" aria-hidden="true"></span>
        <p>不确定自己属于哪一类？<br>直接说问题，我们来帮你分。 :)</p>
      </article>
    </header>

    <div class="proto-featured-needs">
      <NuxtLink v-for="need in filteredFeaturedNeeds" :key="need.title" class="proto-featured-card" :class="`tone-${need.tone}`" :to="noteLink(need.serviceSlug, need.title)">
        <BrandIcon :name="need.brand" :fallback="need.icon" />
        <h2>{{ need.title }}</h2>
        <p>{{ need.description }}</p>
        <strong>去咨询 →</strong>
      </NuxtLink>
    </div>

    <div class="proto-need-board">
      <article v-for="group in filteredNeedGroups" :key="group.title" class="proto-need-group" :class="`tone-${group.tone}`">
        <header>
          <span class="proto-group-number">{{ group.number }}</span>
          <h2>{{ group.title }}</h2>
          <NuxtLink :to="group.to">查看全部 →</NuxtLink>
        </header>
        <div class="proto-need-list">
          <NuxtLink v-for="item in group.items" :key="item.title" class="proto-need-row" :to="noteLink(item.serviceSlug, item.title)">
            <BrandIcon class="proto-mini-icon" :name="item.brand" :fallback="item.icon" />
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <em>{{ item.actionLabel }}</em>
          </NuxtLink>
        </div>
      </article>

      <article class="proto-need-group proto-question-panel tone-orange">
        <header>
          <span class="proto-group-number">🔥</span>
          <h2>大家也常问</h2>
          <NuxtLink to="/help?doc=faq">更多问题 →</NuxtLink>
        </header>
        <NuxtLink v-for="item in commonQuestions" :key="item.title" class="proto-question-row" :to="item.to">
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.description }}</small>
          </span>
          <b aria-hidden="true">›</b>
        </NuxtLink>
      </article>
    </div>

    <article class="proto-bottom-cta">
      <p><span aria-hidden="true">✧</span>没找到你需要的服务？告诉我们你的问题，定制专属解决方案</p>
      <NuxtLink class="button proto-primary-action" to="/note?service=not-sure">我也有类似需求 →</NuxtLink>
    </article>
  </section>
</template>

<script setup lang="ts">
const router = useRouter();
const query = ref("");

const featuredNeeds = [
  { title: "注册 Google 账号", description: "注册 Google 邮箱，解决验证与风控问题", brand: "google", icon: "G", serviceSlug: "ai-tools", tone: "lime" },
  { title: "Google Pro / Gemini", description: "开通 Google Pro、Gemini 会员订阅", brand: "gemini", icon: "✦", serviceSlug: "ai-tools", tone: "blue" },
  { title: "GPT Pro / API", description: "ChatGPT Plus 升级、API 开通与使用", brand: "openai", icon: "AI", serviceSlug: "ai-tools", tone: "green" },
  { title: "Claude / Claude Code", description: "Claude 订阅、Claude Code 授权", brand: "claude", icon: "CL", serviceSlug: "ai-tools", tone: "orange" },
  { title: "API Key / 中转站 / token", description: "获取 API Key，中转配置与 token", brand: "openai", icon: "⚿", serviceSlug: "api-token", tone: "blue" },
  { title: "工具安装 / 网络环境", description: "软件安装配置，网络与代理问题", brand: "", icon: "⚙", serviceSlug: "deployment-config", tone: "purple" }
];

const needGroups = [
  {
    number: 1,
    title: "GPT / OpenAI 相关",
    tone: "lime",
    to: "/services/ai-tools",
    items: [
      { title: "ChatGPT Plus 升级", description: "注册 GPT Plus 会员", brand: "openai", icon: "AI", serviceSlug: "ai-tools", actionLabel: "我要咨询" },
      { title: "OpenAI API 开通", description: "开通 API，获取 Key", brand: "openai", icon: "⌘", serviceSlug: "api-token", actionLabel: "我要咨询" },
      { title: "API 使用问题排查", description: "报错 / 配置 / 额度等问题", brand: "openai", icon: "⚿", serviceSlug: "api-token", actionLabel: "先聊聊" },
      { title: "GPTs / 插件配置", description: "插件安装与使用指导", brand: "openai", icon: "◌", serviceSlug: "ai-tools", actionLabel: "先聊聊" }
    ]
  },
  {
    number: 2,
    title: "Google / Gemini / 海外工具",
    tone: "blue",
    to: "/services/ai-tools",
    items: [
      { title: "注册 Google 账号", description: "解决注册与验证问题", brand: "google", icon: "G", serviceSlug: "ai-tools", actionLabel: "我要咨询" },
      { title: "Google Pro 订阅", description: "开通 Google One / Pro", brand: "google", icon: "G+", serviceSlug: "ai-tools", actionLabel: "我要咨询" },
      { title: "Gemini 订阅与使用", description: "Gemini Pro 开通与配置", brand: "gemini", icon: "✦", serviceSlug: "ai-tools", actionLabel: "先聊聊" },
      { title: "YouTube Premium", description: "开通 YouTube Premium", brand: "youtube", icon: "▶", serviceSlug: "ai-tools", actionLabel: "先聊聊" }
    ]
  },
  {
    number: 3,
    title: "Claude / Claude Code",
    tone: "purple",
    to: "/services/ai-tools",
    items: [
      { title: "Claude Pro 订阅", description: "订阅 Claude Pro 账号", brand: "claude", icon: "CL", serviceSlug: "ai-tools", actionLabel: "我要咨询" },
      { title: "Claude Code 授权", description: "授权 Claude Code", brand: "claude", icon: "CC", serviceSlug: "ai-tools", actionLabel: "我要咨询" },
      { title: "使用问题排查", description: "报错 / 限制 / 配置等", brand: "claude", icon: "◎", serviceSlug: "ai-tools", actionLabel: "先聊聊" },
      { title: "多账号与团队方案", description: "团队 / 多账号配置支持", brand: "claude", icon: "∞", serviceSlug: "ai-tools", actionLabel: "先聊聊" }
    ]
  },
  {
    number: 4,
    title: "API / 中转 / 模型配置",
    tone: "blue",
    to: "/services/api-token",
    items: [
      { title: "API Key 获取", description: "各大平台 API Key", brand: "openai", icon: "⚿", serviceSlug: "api-token", actionLabel: "我要咨询" },
      { title: "中转站搭建", description: "搭建中转服务 / 代理", brand: "openai", icon: "▧", serviceSlug: "api-token", actionLabel: "我要咨询" },
      { title: "Token 配置", description: "Token 获取与配置", brand: "openai", icon: "▣", serviceSlug: "api-token", actionLabel: "先聊聊" },
      { title: "模型接入与调用", description: "接入第三方模型服务", brand: "gemini", icon: "◇", serviceSlug: "api-token", actionLabel: "先聊聊" }
    ]
  },
  {
    number: 5,
    title: "网络环境 / 安装 / 远程协助",
    tone: "green",
    to: "/services/deployment-config",
    items: [
      { title: "代理 / 科学上网", description: "代理配置 / 节点推荐", brand: "", icon: "◎", serviceSlug: "deployment-config", actionLabel: "我要咨询" },
      { title: "环境安装配置", description: "软件 / 环境安装配置", brand: "", icon: "▦", serviceSlug: "deployment-config", actionLabel: "我要咨询" },
      { title: "远程协助", description: "一对一远程协助解决", brand: "", icon: "◉", serviceSlug: "deployment-config", actionLabel: "先聊聊" },
      { title: "系统与软件问题", description: "系统 / 软件问题处理", brand: "", icon: "⌂", serviceSlug: "deployment-config", actionLabel: "先聊聊" }
    ]
  }
];

const commonQuestions = [
  { title: "能不能远程？", description: "可以，大部分问题支持远程协助解决。", to: "/help?doc=faq" },
  { title: "要不要先付款？", description: "先沟通需求和方案，确认后再付款。", to: "/help?doc=terms" },
  { title: "会不会包售后？", description: "我们提供一定时间的售后支持，放心使用。", to: "/help?doc=terms" }
];

const normalizedQuery = computed(() => query.value.trim().toLowerCase());
const filteredFeaturedNeeds = computed(() => {
  if (!normalizedQuery.value) return featuredNeeds;
  return featuredNeeds.filter((need) => `${need.title} ${need.description}`.toLowerCase().includes(normalizedQuery.value));
});
const filteredNeedGroups = computed(() => {
  if (!normalizedQuery.value) return needGroups;
  return needGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery.value)) }))
    .filter((group) => group.items.length);
});

function noteLink(serviceSlug: string, topic: string) {
  return `/note?service=${encodeURIComponent(serviceSlug)}&topic=${encodeURIComponent(topic)}`;
}

async function goSearch() {
  const topic = query.value.trim();
  if (!topic) return;
  await router.push(noteLink("not-sure", topic));
}

useKuliSeo({
  title: "服务总览 | 酷里 Kuly",
  description: "查看酷里用户最常咨询的 GPT、Google、Claude、API、中转、安装和网络环境问题，快速发起咨询。",
  path: "/services"
});
</script>
