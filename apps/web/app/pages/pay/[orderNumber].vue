<template>
  <section class="section pay-page">
    <NuxtLink class="back-link" :to="`/orders/${orderNumber}`">返回订单</NuxtLink>
    <div v-if="!auth.user" class="info-card">
      <strong>需要登录</strong>
      <p>登录后才能查看自己的订单付款信息。</p>
      <NuxtLink class="button" to="/login">去登录</NuxtLink>
    </div>

    <div v-else-if="order" class="pay-layout">
      <article class="info-card pay-summary">
        <div class="eyebrow">Manual Payment</div>
        <h1>{{ order.orderNumber }}</h1>
        <p>{{ order.title }}</p>
        <dl class="meta-list">
          <div><dt>最新报价</dt><dd>¥{{ latestQuoteAmount }}</dd></div>
          <div><dt>已确认收款</dt><dd>¥{{ receivedAmount }}</dd></div>
          <div><dt>待确认金额</dt><dd>¥{{ payableAmount }}</dd></div>
        </dl>
      </article>

      <section class="info-card pay-methods">
        <div class="section-head compact">
          <div>
            <h2>选择付款方式</h2>
            <p>第一版为人工收款：扫码付款后请在订单沟通区备注付款方式和金额，管理员确认到账后会更新记录。</p>
          </div>
        </div>
        <div class="pay-switch" role="tablist" aria-label="付款方式">
          <button v-for="method in methods" :key="method.key" type="button" :class="{ secondary: selectedMethod !== method.key }" @click="selectedMethod = method.key">
            {{ method.label }}
          </button>
        </div>
        <div class="qr-panel">
          <img :src="activeMethod.qr" :alt="`${activeMethod.label}付款码`" />
          <div>
            <span>{{ activeMethod.label }}</span>
            <strong>请备注订单号：{{ order.orderNumber }}</strong>
            <small>付款码图片是占位图，正式发布前替换为你的真实微信/支付宝收款码。</small>
          </div>
        </div>
      </section>

      <section class="info-card pay-rules">
        <h2>付款后怎么继续</h2>
        <ol>
          <li>扫码付款时备注订单号，或者付款后在订单沟通区说明付款金额和方式。</li>
          <li>管理员人工核对到账后，会记录定金/尾款、收款方式和收款状态。</li>
          <li>订单状态会继续推进到进行中、待验收或已完成。</li>
        </ol>
        <div class="hero-actions">
          <NuxtLink class="button" :to="`/orders/${order.orderNumber}`">回订单补充说明</NuxtLink>
          <NuxtLink class="button secondary" to="/help/faq#deposit">查看付款规则</NuxtLink>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Order } from "~/composables/useApi";

const route = useRoute();
const auth = useAuthStore();
const api = useApi();
const order = ref<Order | null>(null);
const orderNumber = computed(() => String(route.params.orderNumber));
const selectedMethod = ref<"wechat" | "alipay">("wechat");
const wechatMethod = { key: "wechat" as const, label: "微信支付", qr: "/pay/wechat-qr.svg" };
const alipayMethod = { key: "alipay" as const, label: "支付宝", qr: "/pay/alipay-qr.svg" };
const methods = [wechatMethod, alipayMethod];
const activeMethod = computed(() => (selectedMethod.value === "alipay" ? alipayMethod : wechatMethod));
const latestQuoteAmount = computed(() => order.value?.quotes.at(-1)?.amount ?? order.value?.quotedPrice ?? 0);
const receivedAmount = computed(() =>
  order.value ? order.value.payments.filter((payment) => payment.status === "received").reduce((total, payment) => total + payment.amount, 0) : 0
);
const payableAmount = computed(() => Math.max(0, latestQuoteAmount.value - receivedAmount.value));

onMounted(async () => {
  await auth.restore();
  if (auth.token) order.value = (await api.getOrder(auth.token, orderNumber.value)).order;
});
</script>
