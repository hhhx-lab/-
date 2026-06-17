<template>
  <section class="shell products-hero">
    <div>
      <p class="plain-label">产品工具</p>
      <h1 class="mega">工具会慢慢上线</h1>
      <p class="lead">这里集中展示可用入口和上线计划，帮助你更快找到当前能用的服务路径</p>
    </div>
    <div class="product-console">
      <span class="plain-label">已接入工具</span>
      <strong>Handwriting</strong>
      <p>文档转手写字体工作台已作为子产品接入，适合先预览、再生成可交付稿</p>
    </div>
  </section>

  <section class="shell section product-board">
    <article v-for="item in products" :key="item.title" class="product-tile" :class="item.status">
      <p class="plain-label">{{ statusLabel[item.status] }} / {{ item.kind }}</p>
      <h2>{{ item.title }}</h2>
      <p>{{ item.description }}</p>
      <div class="product-actions">
        <NuxtLink class="button" :to="item.to">{{ item.cta }}</NuxtLink>
        <NuxtLink class="button secondary" :to="item.docs">查看说明</NuxtLink>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
type ProductStatus = "available" | "beta" | "planned";

const statusLabel: Record<ProductStatus, string> = {
  available: "可用",
  beta: "内测",
  planned: "即将上线"
};

const products: Array<{ title: string; description: string; kind: string; status: ProductStatus; to: string; docs: string; cta: string }> = [
  {
    title: "酷里小纸条",
    description: "把一句模糊需求整理成订单线索，适合先判断能不能做、材料够不够。",
    kind: "订单入口",
    status: "available",
    to: "/note",
    docs: "/help?doc=quick-start",
    cta: "写小纸条"
  },
  {
    title: "小酷 Agent",
    description: "3D 小猫服务助手，帮助用户理解服务、整理需求、解释订单状态。",
    kind: "服务助手",
    status: "beta",
    to: "/help/concepts",
    docs: "/help?doc=guides",
    cta: "了解小酷"
  },
  {
    title: "文档转手写字体",
    description: "把 PDF、Word、Markdown 或文本整理成手写风格稿件，支持字体、纸张、行距和整页预览。",
    kind: "文档工具",
    status: "beta",
    to: "/products/handwriting",
    docs: "/services/document-processing",
    cta: "进入子产品"
  },
  {
    title: "部署检查清单",
    description: "给服务器、域名、环境变量、对象存储和上线前 smoke 的辅助检查入口。",
    kind: "上线辅助",
    status: "planned",
    to: "/services/deployment-config",
    docs: "/help?doc=guides",
    cta: "查看部署服务"
  }
];

useKuliSeo({
  title: "酷里产品与工具箱 | 小纸条、小酷 Agent 和效率工具",
  description: "酷里产品页展示小纸条、小酷 Agent、文档处理工具箱和部署检查清单等公开工具入口，方便用户找到适合当前需求的服务路径。",
  path: "/products"
});
</script>
