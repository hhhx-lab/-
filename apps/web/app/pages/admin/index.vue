<template>
  <section class="shell app-surface admin-workbench">
    <header class="admin-header">
      <div>
        <p class="plain-label">管理后台</p>
        <h1 class="page-title">订单处理台</h1>
      </div>
      <NuxtLink v-if="!auth.user" class="button" to="/login">管理员登录</NuxtLink>
    </header>

    <section class="work-panel">
      <div class="admin-filters">
        <input v-model="search" placeholder="搜索订单号、客户、联系方式、需求关键词、附件名" @keyup.enter="load(1)">
        <select v-model="status" @change="load(1)">
          <option value="">全部状态</option>
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <select v-model="intent" @change="load(1)">
          <option value="">全部意图</option>
          <option value="consultation">先咨询</option>
          <option value="quote_request">希望报价</option>
          <option value="ready_to_start">明确开工</option>
        </select>
        <select v-model="service" @change="load(1)">
          <option value="">全部服务</option>
          <option v-for="item in services" :key="item.slug" :value="item.slug">{{ item.tag }}</option>
        </select>
        <button class="button" @click="load(1)">搜索</button>
      </div>
      <div class="toolbar">
        <small>共 {{ pagination.total }} 单 · 第 {{ pagination.page }} 页</small>
        <button class="button secondary" :disabled="pagination.page <= 1" @click="load(pagination.page - 1)">上一页</button>
        <button class="button secondary" :disabled="!pagination.hasMore" @click="load(pagination.page + 1)">下一页</button>
      </div>
    </section>

    <div class="admin-table">
      <NuxtLink v-for="order in orders" :key="order.orderNumber" class="admin-row" :to="`/admin/orders/${order.orderNumber}`">
        <strong>{{ order.orderNumber }}</strong>
        <div>
          <strong>{{ order.title }}</strong>
          <p>{{ order.customerName }} · {{ order.contact }}</p>
        </div>
        <span class="status-pill" :class="display.orderStatus(order.status).tone">{{ display.orderStatus(order.status).label }}</span>
        <span class="plain-label">{{ display.priority(order.priority) }}</span>
        <p>{{ order.nextAction }}</p>
        <small>{{ display.dateTime(order.updatedAt) }}</small>
      </NuxtLink>
      <div v-if="auth.user && !orders.length" class="empty-state">
        <strong>没有匹配订单。</strong>
        <p>调整状态、服务或搜索词再试。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AdminOrder } from "~/composables/useApi";
import { useDisplayText } from "~/composables/useDisplayText";

const auth = useAuthStore();
const api = useApi();
const display = useDisplayText();
const search = ref("");
const status = ref("");
const intent = ref("");
const service = ref("");
const orders = ref<AdminOrder[]>([]);
const pagination = reactive({ page: 1, pageSize: 20, total: 0, hasMore: false });
const { data: serviceData } = await useAsyncData("admin-services", () => api.listServices());
const services = computed(() => serviceData.value?.services ?? []);
const statusOptions = [
  { value: "submitted", label: "已提交" },
  { value: "clarifying", label: "待补充" },
  { value: "quoted", label: "已报价" },
  { value: "deposit_pending", label: "待付定金" },
  { value: "in_progress", label: "处理中" },
  { value: "review", label: "待验收" },
  { value: "final_payment_pending", label: "待付尾款" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" }
];

onMounted(async () => {
  await auth.restore();
  await load(1);
});

async function load(page = pagination.page) {
  if (!auth.token) return;
  const query = new URLSearchParams();
  if (search.value) query.set("search", search.value);
  if (status.value) query.set("status", status.value);
  if (intent.value) query.set("intent", intent.value);
  if (service.value) query.set("service", service.value);
  query.set("page", String(page));
  query.set("pageSize", String(pagination.pageSize));
  const response = await api.listAdminOrders(auth.token, `?${query}`);
  orders.value = response.orders;
  Object.assign(pagination, response.pagination ?? { page, pageSize: pagination.pageSize, total: response.orders.length, hasMore: false });
}
</script>
