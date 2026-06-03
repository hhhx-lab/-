<template>
  <section class="shell proto-orders-page">
    <header class="proto-orders-header">
      <div>
        <h1>我的订单</h1>
        <p>这里能看到你的小纸条进度、沟通记录和当前状态。</p>
      </div>
      <article class="proto-sticky-note proto-note-lime proto-orders-note">
        <span class="proto-pin" aria-hidden="true"></span>
        <p>有问题就<br>继续回这个单子里聊</p>
        <small>- Kuli :)</small>
      </article>
    </header>

    <div v-if="auth.user" class="proto-order-stats">
      <button v-for="stat in statCards" :key="stat.key" type="button" class="proto-order-stat" :class="[`tone-${stat.tone}`, { selected: statusFilter === stat.key }]" @click="selectStat(stat.key)">
        <span class="proto-icon-tile">{{ stat.icon }}</span>
        <small>{{ stat.label }}</small>
        <strong>{{ stat.count }}<em>个</em></strong>
        <p>{{ stat.hint }}</p>
      </button>
    </div>

    <div v-if="auth.user" class="proto-orders-workbench">
      <aside class="proto-order-list-panel">
        <header>
          <h2>订单列表</h2>
          <select v-model="statusFilter" aria-label="订单状态筛选">
            <option value="all">全部状态</option>
            <option value="confirming">需求确认中</option>
            <option value="in_progress">试跑初版中</option>
            <option value="review">待验收</option>
            <option value="completed">已完成</option>
          </select>
        </header>

        <div v-if="loading" class="proto-empty-panel">
          <strong>正在同步你的订单。</strong>
          <p>酷里正在读取你的订单进度、沟通记录和下一步动作。</p>
        </div>
        <div v-else-if="loadError" class="proto-empty-panel">
          <strong>订单列表暂时没加载成功。</strong>
          <p>{{ loadError }}</p>
          <button class="button" type="button" @click="loadOrders">重新加载</button>
        </div>
        <div v-else-if="filteredOrders.length" class="proto-order-list">
          <button v-for="order in filteredOrders" :key="order.orderNumber" class="proto-order-list-item" :class="{ selected: selectedOrderNumber === order.orderNumber }" type="button" @click="selectOrder(order.orderNumber)">
            <span>
              <strong>{{ order.title }}</strong>
              <small>订单 ID：{{ order.orderNumber }}</small>
              <small>提交时间：{{ display.dateTime(order.createdAt) }}</small>
            </span>
            <span class="proto-list-meta">
              <em :class="display.orderStatus(order.status).tone">{{ display.orderStatus(order.status).label }}</em>
              <small>预算：{{ order.budget || "待确认" }}</small>
            </span>
            <b aria-hidden="true">›</b>
          </button>
          <p class="proto-list-bottom">没有更多啦，继续写小纸条吧 ✨</p>
        </div>
        <div v-else class="proto-empty-panel">
          <strong>{{ orders.length ? "没有匹配的订单" : "还没有订单" }}</strong>
          <p>先写一张小纸条，酷里会帮你判断能不能做、材料够不够。</p>
          <NuxtLink class="button" to="/note">写张小纸条</NuxtLink>
        </div>
      </aside>

      <section v-if="selectedOrder" class="proto-order-detail">
        <header class="proto-order-detail-head">
          <div>
            <h2>{{ selectedOrder.title }}</h2>
            <p>订单 ID：{{ selectedOrder.orderNumber }}</p>
          </div>
          <span class="status-pill" :class="display.orderStatus(selectedOrder.status).tone">{{ display.orderStatus(selectedOrder.status).label }}</span>
          <small>提交时间：{{ display.dateTime(selectedOrder.createdAt) }}</small>
          <small>预算范围：{{ selectedOrderEstimate }}</small>
        </header>

        <div class="proto-progress-rail">
          <article v-for="(step, index) in progressSteps" :key="step.key" :class="{ done: index < currentStepIndex, current: index === currentStepIndex }">
            <span>{{ step.icon }}</span>
            <strong>{{ step.label }}</strong>
            <small>{{ index === currentStepIndex ? display.orderStatus(selectedOrder.status).hint : step.hint }}</small>
          </article>
        </div>

        <div class="proto-order-detail-grid">
          <div class="proto-order-main-column">
            <article class="proto-order-card">
              <header><h3>你的原始需求</h3><button type="button" @click="copyDemand">复制</button></header>
              <p>{{ selectedOrder.originalDemand || selectedOrder.demand || "还没有记录原始需求。" }}</p>
            </article>

            <article class="proto-order-card proto-conversation-card">
              <header><h3>沟通记录</h3></header>
              <div class="proto-message-list">
                <article v-for="message in previewMessages" :key="message.id" :class="{ mine: message.authorUserId === auth.user?.id }">
                  <span>{{ message.authorUserId === auth.user?.id ? "你" : "酷里" }}</span>
                  <div><small>{{ display.dateTime(message.createdAt) }}</small><p>{{ message.body }}</p></div>
                </article>
                <p v-if="!previewMessages.length">有问题可以直接在这里问酷里。</p>
              </div>
              <form class="proto-message-composer" @submit.prevent="sendMessage">
                <input ref="messageInputRef" v-model="messageBody" :disabled="sendingMessage" placeholder="有问题就在这里继续聊...">
                <button type="submit" :disabled="sendingMessage || !messageBody.trim()">发送</button>
              </form>
            </article>
          </div>

          <div class="proto-order-side-column">
            <article class="proto-order-card">
              <header><h3>附件 / 截图</h3><NuxtLink :to="`/orders/${selectedOrder.orderNumber}`">查看更多</NuxtLink></header>
              <div v-if="selectedOrderAttachments.length" class="proto-attachment-strip">
                <button v-for="file in selectedOrderAttachments.slice(0, 3)" :key="file.id" type="button">
                  <span>{{ file.contentType.startsWith("image/") ? "IMG" : "FILE" }}</span>
                  <strong>{{ file.fileName }}</strong>
                  <small>{{ display.fileSize(file.fileSize) }}</small>
                </button>
              </div>
              <p v-else>还没有补充截图或文件。</p>
            </article>

            <article class="proto-order-card proto-quote-card">
              <header><h3>报价 & 付款</h3><NuxtLink :to="`/orders/${selectedOrder.orderNumber}`">查看报价明细</NuxtLink></header>
              <p><span>预计报价：</span><strong>{{ selectedOrderEstimate }}</strong></p>
              <p><span>支付方式：</span><strong>支持微信 / 支付宝</strong></p>
              <div>小需求可验收后付款；复杂需求可能需要先付定金。</div>
            </article>

            <article class="proto-order-card proto-rules-card">
              <h3>规则说明</h3>
              <p>默认不包长期售后，部署 / 维护 / 修改另算。</p>
            </article>
          </div>
        </div>

        <footer class="proto-order-action-bar">
          <NuxtLink class="button secondary" :to="`/orders/${selectedOrder.orderNumber}`">补充材料</NuxtLink>
          <button class="button" type="button" @click="focusMessageInput">联系酷里</button>
        </footer>
      </section>
    </div>

    <div v-if="!auth.user" class="proto-empty-panel proto-login-panel">
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
import { useDisplayText } from "~/composables/useDisplayText";

const auth = useAuthStore();
const api = useApi();
const display = useDisplayText();
const orders = ref<Order[]>([]);
const orderDetail = ref<Order | null>(null);
const loading = ref(true);
const loadError = ref("");
const statusFilter = ref("all");
const selectedOrderNumber = ref("");
const messageBody = ref("");
const sendingMessage = ref(false);
const messageInputRef = ref<HTMLInputElement | null>(null);
let disposed = false;

const progressSteps = [
  { key: "submitted", label: "已提交", hint: "小纸条已收到", icon: "✓" },
  { key: "clarifying", label: "需求确认中", hint: "酷里正在看你的需求", icon: "◎" },
  { key: "in_progress", label: "试跑初版中", hint: "开始动手做", icon: "</>" },
  { key: "review", label: "待验收", hint: "等你反馈", icon: "⌛" },
  { key: "completed", label: "已完成", hint: "交付完成", icon: "✓" }
];

onBeforeUnmount(() => {
  disposed = true;
});

onMounted(async () => {
  await loadOrders();
});

const selectedOrder = computed(() => orderDetail.value ?? orders.value.find((order) => order.orderNumber === selectedOrderNumber.value) ?? null);
const previewMessages = computed(() => selectedOrder.value?.messages?.slice(-5) ?? []);
const selectedOrderAttachments = computed(() => selectedOrder.value?.attachments ?? []);
const selectedOrderEstimate = computed(() => {
  const order = selectedOrder.value;
  if (!order) return "待确认";
  return order.budget || (order.quotedPrice ? display.money(order.quotedPrice) : "待确认");
});
const filteredOrders = computed(() => orders.value.filter((order) => {
  if (statusFilter.value === "all") return true;
  if (statusFilter.value === "confirming") return ["submitted", "clarifying", "quoted", "deposit_pending"].includes(order.status);
  return order.status === statusFilter.value;
}));
const statCards = computed(() => [
  { key: "all", label: "全部订单", count: orders.value.length, hint: "包含历史订单", icon: "□", tone: "neutral" },
  { key: "confirming", label: "需求确认中", count: orders.value.filter((order) => ["submitted", "clarifying", "quoted", "deposit_pending"].includes(order.status)).length, hint: "酷里正在确认需求", icon: "◎", tone: "orange" },
  { key: "in_progress", label: "试跑初版中", count: orders.value.filter((order) => order.status === "in_progress").length, hint: "正在开发和测试中", icon: "</>", tone: "blue" },
  { key: "review", label: "待验收", count: orders.value.filter((order) => order.status === "review" || order.status === "final_payment_pending").length, hint: "等你验收和反馈", icon: "⌛", tone: "yellow" },
  { key: "completed", label: "已完成", count: orders.value.filter((order) => order.status === "completed").length, hint: "已交付，期待下次合作", icon: "✓", tone: "green" }
]);
const currentStepIndex = computed(() => {
  const status = selectedOrder.value?.status ?? "submitted";
  if (status === "completed") return 4;
  if (status === "review" || status === "final_payment_pending") return 3;
  if (status === "in_progress") return 2;
  if (["clarifying", "quoted", "deposit_pending"].includes(status)) return 1;
  return 0;
});

watch(selectedOrderNumber, async (orderNumber) => {
  orderDetail.value = null;
  if (!orderNumber || !auth.token) return;
  try {
    orderDetail.value = (await api.getOrder(auth.token, orderNumber)).order;
  } catch {
    orderDetail.value = orders.value.find((order) => order.orderNumber === orderNumber) ?? null;
  }
});

watch(filteredOrders, (items) => {
  if (!items.length) {
    selectedOrderNumber.value = "";
    orderDetail.value = null;
    return;
  }
  const firstOrder = items[0];
  if (firstOrder && !items.some((order) => order.orderNumber === selectedOrderNumber.value)) selectedOrderNumber.value = firstOrder.orderNumber;
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
    selectedOrderNumber.value = orders.value[0]?.orderNumber ?? "";
  } catch (caught) {
    if (disposed) return;
    loadError.value = caught instanceof ApiError ? caught.message : "网络连接不稳定，请稍后重试。";
  } finally {
    if (!disposed) loading.value = false;
  }
}

function selectStat(key: string) {
  statusFilter.value = key;
}

function selectOrder(orderNumber: string) {
  selectedOrderNumber.value = orderNumber;
}

function focusMessageInput() {
  messageInputRef.value?.focus();
}

async function copyDemand() {
  const demand = selectedOrder.value?.originalDemand || selectedOrder.value?.demand;
  if (demand && globalThis.navigator?.clipboard) await navigator.clipboard.writeText(demand);
}

async function sendMessage() {
  if (!auth.token || !selectedOrder.value || !messageBody.value.trim()) return;
  sendingMessage.value = true;
  try {
    await api.addOrderMessage(auth.token, selectedOrder.value.orderNumber, messageBody.value.trim());
    messageBody.value = "";
    orderDetail.value = (await api.getOrder(auth.token, selectedOrder.value.orderNumber)).order;
  } finally {
    sendingMessage.value = false;
  }
}

useKuliSeo({
  title: "我的订单 | 酷里 Kuly",
  description: "查看酷里小纸条订单进度、沟通记录、附件、报价付款和当前状态。",
  path: "/orders"
});
</script>
