<template>
  <section class="shell app-surface order-workbench">
    <header class="orders-header">
      <div>
        <p class="plain-label">我的订单</p>
        <h1 class="page-title">订单进度一眼看清</h1>
      </div>
      <NuxtLink v-if="auth.user" class="button" to="/note">写新的小纸条</NuxtLink>
      <NuxtLink v-else class="button" to="/login">登录查看</NuxtLink>
    </header>

    <div v-if="auth.user" class="status-tabs" aria-label="订单状态筛选">
      <button v-for="tab in tabs" :key="tab.value" class="button secondary" :class="{ 'is-active': statusFilter === tab.value }" type="button" @click="statusFilter = tab.value">
        {{ tab.label }} <span v-if="tab.value !== 'all'">{{ countByStatus(tab.value) }}</span>
      </button>
    </div>

    <div v-if="auth.user" class="docs-command">
      <div class="field">
        <label for="order-search">搜索订单号、标题或下一步</label>
        <input id="order-search" v-model="search" type="search" placeholder="例如：PDF、报价、Kuly-000001">
      </div>
      <span class="plain-label">共 {{ filteredOrders.length }} 单</span>
    </div>

    <div v-if="auth.user && loading" class="empty-state">
      <strong>正在同步你的订单。</strong>
      <p>酷里正在读取你的订单进度、沟通记录和下一步动作。</p>
    </div>

    <div v-if="auth.user && loadError" class="empty-state">
      <strong>订单列表暂时没加载成功。</strong>
      <p>{{ loadError }}</p>
      <div class="empty-actions">
        <button class="button" type="button" @click="loadOrders">重新加载</button>
      </div>
    </div>

    <div v-if="auth.user && filteredOrders.length" class="orders-table">
      <NuxtLink v-for="order in filteredOrders" :key="order.orderNumber" class="orders-row" :to="`/orders/${order.orderNumber}`">
        <div>
          <strong>{{ order.title }}</strong>
          <p>{{ order.orderNumber }} · {{ order.category }}</p>
        </div>
        <span class="status-pill" :class="display.orderStatus(order.status).tone">{{ display.orderStatus(order.status).label }}</span>
        <div>
          <strong>下一步</strong>
          <p>{{ order.nextAction || display.orderStatus(order.status).hint }}</p>
        </div>
        <small>{{ display.dateTime(order.updatedAt) }}</small>
      </NuxtLink>
    </div>

    <div v-if="auth.user && !filteredOrders.length" class="empty-state">
      <strong>{{ orders.length ? "没有匹配的订单" : "还没有订单" }}</strong>
      <p>先写一张小纸条，酷里会帮你判断能不能做、材料够不够，以及后续是验收后付款还是需要先确认定金。</p>
      <div class="empty-actions">
        <NuxtLink class="button" to="/note">写小纸条</NuxtLink>
        <NuxtLink class="button secondary" to="/services">看看服务</NuxtLink>
      </div>
    </div>

    <div v-if="!auth.user" class="empty-state">
      <strong>登录后这里会变成你的订单工作台</strong>
      <p>你可以查看自己的订单进度、沟通记录、附件、报价、付款记录和交付物。</p>
      <div class="empty-actions">
        <NuxtLink class="button" to="/login">登录查看</NuxtLink>
        <NuxtLink class="button secondary" to="/note">先写小纸条</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ApiError, type Order } from "~/composables/useApi";

const auth = useAuthStore();
const api = useApi();
const display = useDisplayText();
const orders = ref<Order[]>([]);
const loading = ref(true);
const loadError = ref("");
let disposed = false;

onBeforeUnmount(() => {
  disposed = true;
});

async function loadOrders() {
  loading.value = true;
  loadError.value = "";
  await auth.restore();
  if (!auth.token) {
    loading.value = false;
    return;
  }
  try {
    orders.value = (await api.listOrders(auth.token)).orders;
  } catch (caught) {
    if (disposed) return;
    loadError.value = caught instanceof ApiError ? caught.message : "网络连接不稳定，请稍后重试。";
  } finally {
    if (!disposed) loading.value = false;
  }
}

onMounted(async () => {
  await loadOrders();
});

const statusFilter = ref("all");
const search = ref("");

const tabs = [
  { label: "全部", value: "all" },
  { label: "待确认", value: "submitted" },
  { label: "待补充", value: "clarifying" },
  { label: "待报价", value: "quoted" },
  { label: "进行中", value: "in_progress" },
  { label: "待验收", value: "review" },
  { label: "已完成", value: "completed" }
];

const filteredOrders = computed(() => {
  const query = search.value.trim().toLowerCase();
  return orders.value.filter((order) => {
    if (statusFilter.value !== "all" && order.status !== statusFilter.value) return false;
    if (!query) return true;
    return `${order.orderNumber}\n${order.title}\n${order.category}\n${order.nextAction}`.toLowerCase().includes(query);
  });
});

function countByStatus(status: string) {
  return orders.value.filter((order) => order.status === status).length;
}
</script>
