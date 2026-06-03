<template>
  <section class="shell proto-home-hero">
    <div class="proto-hero-copy">
      <h1>搞不动？<br>先丢给<em>酷里</em>看看。</h1>
      <p>我们是一个 AI 创客小队。文档、AI 工具、账号/订阅咨询、API 配置、小程序、网页、数据库、部署这些，都可以先聊聊。</p>
      <div class="hero-actions">
        <NuxtLink class="button proto-primary-action" to="/note"><span aria-hidden="true">✎</span>写张小纸条</NuxtLink>
        <NuxtLink class="button secondary proto-secondary-action" to="/services"><span aria-hidden="true">☵</span>看看大家都在问什么</NuxtLink>
      </div>
    </div>

    <div class="proto-hero-visual" aria-label="需求沟通示意">
      <div class="proto-chat-window">
        <div class="proto-window-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="proto-chat-prompt"><span>$</span>你想搞定什么？</p>
        <div class="proto-chat-bubble is-light">注册国外谷歌账号</div>
        <div class="proto-chat-bubble is-right">购买谷歌 Pro</div>
        <div class="proto-chat-bubble">购买 gptPro</div>
        <div class="proto-typing" aria-hidden="true"><span></span><span></span><span></span></div>
      </div>
      <article class="proto-sticky-note proto-note-blue">
        <span class="proto-tape" aria-hidden="true"></span>
        <p>先聊聊需求<br>能搞定再开工</p>
        <small>- 酷里小队</small>
      </article>
      <article class="proto-sticky-note proto-note-lime">
        <p>小需求当天搞定<br>大需求按里程碑来</p>
        <small>- Kuli :)</small>
      </article>
      <span class="proto-star proto-star-one" aria-hidden="true">✧</span>
      <span class="proto-squiggle" aria-hidden="true">↝</span>
    </div>
  </section>

  <section class="shell proto-section">
    <div class="proto-section-title">
      <span aria-hidden="true">🔥</span>
      <h2>最近大家问得最多</h2>
    </div>
    <div class="proto-need-strip">
      <NuxtLink v-for="need in hotNeeds" :key="need.title" class="proto-need-card" :class="`tone-${need.tone}`" :to="need.to">
        <BrandIcon :name="need.brand" :fallback="need.icon" />
        <h3>{{ need.title }}</h3>
        <p>{{ need.description }}</p>
        <strong>去看看 →</strong>
      </NuxtLink>
    </div>
  </section>

  <section class="shell proto-section">
    <div class="proto-section-title">
      <span aria-hidden="true">🛠</span>
      <h2>酷里大概能搞</h2>
    </div>
    <div class="proto-capability-grid">
      <NuxtLink v-for="item in capabilities" :key="item.title" class="proto-capability-card" :to="item.to">
        <BrandIcon :name="item.brand" :fallback="item.icon" :tile-class="`tone-${item.tone}`" />
        <div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <strong>去看看 →</strong>
        </div>
      </NuxtLink>
    </div>
  </section>

  <section class="shell proto-section">
    <div class="proto-section-title">
      <span aria-hidden="true">✧</span>
      <h2>我们怎么做</h2>
    </div>
    <div class="proto-process-rail">
      <article v-for="step in processSteps" :key="step.title" class="proto-process-card" :class="`tone-${step.tone}`">
        <span class="proto-step-badge">{{ step.number }}</span>
        <span class="proto-process-icon">{{ step.icon }}</span>
        <div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
      </article>
    </div>
    <article class="proto-notice-bar">
      <span aria-hidden="true">♢</span>
      <p>小活可以先做完再结；大一点的活可能要先付点定金。默认不包长期售后，部署 / 维护 / 修改另算。</p>
    </article>
  </section>
</template>

<script setup lang="ts">
const hotNeeds = [
  { title: "GPT / Pro / API", description: "GPT Pro 订阅、API 开通与使用问题", brand: "openai", icon: "AI", tone: "green", to: "/services/ai-tools" },
  { title: "Google / Gemini", description: "注册谷歌账号、Gemini、Google One 等订阅", brand: "google", icon: "G", tone: "blue", to: "/note?service=ai-tools&topic=Google%20%2F%20Gemini" },
  { title: "Claude / Claude Code", description: "Claude 订阅、Claude Code 授权与使用", brand: "claude", icon: "CL", tone: "orange", to: "/note?service=ai-tools&topic=Claude%20Code" },
  { title: "API Key / 中转站", description: "OpenAI / Claude / 各类 API Key 与中转服务", brand: "openai", icon: "⚿", tone: "blue", to: "/note?service=api-token" },
  { title: "工具安装 / 网络环境", description: "软件安装、环境配置、网络与代理问题", icon: "⚙", tone: "purple", to: "/note?service=deployment-config" },
  { title: "不知道选啥，直接问", description: "不确定从哪里开始？先说说你的情况", icon: "…", tone: "lime", to: "/note?service=not-sure" }
];

const capabilities = [
  { title: "文档急救", description: "论文/报告/方案/简历等修改、润色、排版，AI 翻译写作与内容整理。", icon: "▤", tone: "lime", to: "/services/document-processing" },
  { title: "AI 工具配置", description: "各类 AI 工具订阅、账号注册、API 配置与使用问题，一站式搞定。", brand: "openai", icon: "⬡", tone: "blue", to: "/services/ai-tools" },
  { title: "小工具开发", description: "脚本、自动化、小程序、网页等小需求的工具便利开发。", icon: "</>", tone: "purple", to: "/services/tool-development" },
  { title: "部署上线", description: "网站/小程序/项目部署、数据库、域名、服务器等环境配置。", icon: "▦", tone: "green", to: "/services/deployment-config" }
];

const processSteps = [
  { number: 1, title: "你先说需求", description: "写张小纸条，告诉我们你想要做什么。", icon: "☷", tone: "lime" },
  { number: 2, title: "我们判断能不能做", description: "评估可行性，给出思路、方案和大致报价。", icon: "☑", tone: "blue" },
  { number: 3, title: "先跑一个初版", description: "先交付一个可用版本，你先看看效果。", icon: ">_", tone: "purple" },
  { number: 4, title: "满意后继续", description: "有问题继续调整优化，直到你满意。", icon: "↻", tone: "neutral" },
  { number: 5, title: "验收后付款", description: "确认 ok 后再付款，简单透明。", icon: "✓", tone: "green" }
];

useKuliSeo({
  title: "酷里 Kuly | 先聊需求，再判断能不能搞定",
  description: "酷里是一个 AI 创客小窗口，支持 AI 工具、账号订阅、API 配置、文档处理、小工具开发和部署配置需求咨询。",
  path: "/"
});
</script>
