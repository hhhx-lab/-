<template>
  <section class="shell app-surface">
    <NuxtLink class="back-link" to="/orders">← 返回我的订单</NuxtLink>
    <div v-if="!auth.user" class="info-card dense">
      <strong>需要登录</strong>
      <p>登录后才能查看自己的订单详情。</p>
      <NuxtLink class="button" to="/login">去登录</NuxtLink>
    </div>

    <div v-else-if="order" class="order-workbench">
      <header class="order-status-header">
        <div>
          <span class="status-pill" :class="status.tone">{{ status.label }}</span>
          <h1 class="page-title">{{ order.title }}</h1>
          <p class="lead">{{ order.orderNumber }} · {{ order.category }} · {{ display.intent(order.intent) }}</p>
        </div>
        <div class="amount-card">
          <span>下一步</span>
          <strong>{{ order.nextAction || status.hint }}</strong>
          <small>{{ status.hint }}</small>
        </div>
      </header>

      <section class="work-panel admin-progress-panel">
        <div class="admin-panel-head">
          <div>
            <h2>全链路节点</h2>
            <p>从发起需求到最终交付，绿色表示已经完成到这里，当前节点会重点标出。</p>
          </div>
          <span class="conversation-status">{{ currentWorkflowStep?.label || "等待判断" }}</span>
        </div>
        <div class="workflow-progress" :style="{ '--progress': `${workflowProgress}%` }">
          <article
            v-for="step in workflowSteps"
            :key="step.key"
            class="workflow-step"
            :class="{ done: step.done, current: step.current }"
          >
            <span>{{ step.index + 1 }}</span>
            <div>
              <strong>{{ step.label }}</strong>
              <p>{{ step.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <div class="order-detail-grid order-detail-grid-with-progress">
        <main class="order-workbench">
          <section class="work-panel admin-activity-panel">
            <div class="admin-panel-head">
              <div>
                <h2>沟通与重要记录</h2>
                <p>你的每次留言、上传材料、酷里回复、小助手邮件提醒动作、报价收款和交付物都会汇总在这里。</p>
              </div>
              <span class="conversation-status">共 {{ activityRecords.length }} 条</span>
            </div>
            <div v-if="activityRecords.length" class="activity-feed">
              <article v-for="item in activityRecords" :key="item.id" class="activity-record" :class="`kind-${item.kind}`">
                <div class="activity-marker" aria-hidden="true">{{ item.icon }}</div>
                <div>
                  <div class="message-meta">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.meta }} · {{ display.dateTime(item.createdAt) }}</small>
                  </div>
                  <p>{{ item.body }}</p>
                </div>
              </article>
            </div>
            <p v-else class="muted">暂无记录。</p>
          </section>

          <section class="work-panel">
            <h2>需求说明</h2>
            <article class="message-item">
              <small>原始小纸条</small>
              <p>{{ order.originalDemand || "没有保留原始描述。" }}</p>
            </article>
            <article class="message-item">
              <small>整理后的版本</small>
              <p>{{ order.demand || order.polishedDemand || "还没有整理版本。" }}</p>
            </article>
          </section>

          <section class="work-panel communication-panel">
            <div class="section-head compact communication-head">
              <div>
                <h2>沟通方式与记录</h2>
                <p>默认在站内跟进订单，沟通记录、支付、报价和交付都会留在这里。酷里小助手 team@kuly.com.cn 会通过邮件同步关键状态。</p>
              </div>
              <span class="conversation-status">{{ communicationHint }}</span>
            </div>

            <div class="channel-note site-default-note">
              <div>
                <strong>默认跟进方式</strong>
                <p>站内沟通 + 邮件提醒。当前联系方式：{{ order.contact || "待补充" }}</p>
              </div>
            </div>

            <details class="fallback-contact">
              <summary>不方便用站内或邮件？查看企业微信</summary>
              <div class="fallback-contact-body">
                <div>
                  <strong>添加企业微信时请带上订单号</strong>
                  <p>{{ order.orderNumber }}。重要结论、支付和交付仍建议同步回订单页，避免后续对不上。</p>
                  <button class="button secondary" type="button" @click="copyOrderNumber">{{ copyState }}</button>
                </div>
                <img src="/contact/wecom-contact.png" alt="酷里企业微信二维码">
              </div>
            </details>

            <div v-if="order.messages.length" class="message-list conversation-list">
              <article
                v-for="item in order.messages"
                :key="item.id"
                class="message-item conversation-message"
                :class="messageClass(item)"
              >
                <div class="message-meta">
                  <strong>{{ messageSpeaker(item) }}</strong>
                  <small>{{ display.dateTime(item.createdAt) }}</small>
                </div>
                <p>{{ item.body }}</p>
              </article>
            </div>
            <p v-else class="muted">还没有沟通记录。你可以先补充材料、付款说明或验收反馈。</p>

            <div class="message-composer">
              <textarea v-model="messageBody" placeholder="把补充说明、链接、截图说明或验收反馈写在这里"></textarea>
              <div>
                <small>发送后会进入订单沟通记录，酷里会在这里继续回复。</small>
                <button type="button" @click="sendMessage">发送消息</button>
              </div>
            </div>
          </section>

          <section class="work-panel">
            <h2>补充材料</h2>
            <div v-if="order.attachments.length" class="file-list">
              <div v-for="file in order.attachments" :key="file.id" class="message-item">
                <strong>{{ file.fileName }}</strong>
                <small>{{ display.attachmentStatus(file.scanStatus) }} · {{ display.fileSize(file.fileSize) }}</small>
                <p v-if="file.parsedSummary">{{ file.parsedSummary }}</p>
                <p v-if="file.scanError">解析问题：{{ file.scanError }}</p>
                <button class="button secondary" type="button" @click="openAttachment(file)">下载</button>
              </div>
            </div>
            <p v-else class="muted">还没有附件。截图、PDF、Word、表格或报错文本都可以补充。</p>
            <p class="safety-line">不要上传密码、验证码、私钥、支付凭证、身份证等敏感信息。</p>
            <label>补充附件
              <input type="file" @change="onFileChange">
            </label>
            <button class="button secondary" type="button" :disabled="!selectedFile" @click="attachSelected">上传并登记附件</button>
          </section>
        </main>

        <aside class="order-side">
          <section class="work-panel">
            <h2>报价与付款</h2>
            <div v-if="latestQuoteAmount" class="amount-card">
              <span>最新报价</span>
              <strong>{{ display.money(latestQuoteAmount) }}</strong>
            </div>
            <div class="message-list">
              <article v-for="quote in order.quotes" :key="quote.id" class="message-item">
                <small>报价 · {{ display.paymentKind(quote.kind) }} · {{ display.paymentStatus(quote.status) }}</small>
                <strong>{{ display.money(quote.amount) }}</strong>
                <p>{{ quote.note }}</p>
              </article>
              <article v-for="payment in order.payments" :key="payment.id" class="message-item">
                <small>付款 · {{ display.paymentKind(payment.kind) }}</small>
                <strong>{{ display.money(payment.amount) }} · {{ display.paymentStatus(payment.status) }}</strong>
                <p>{{ payment.method }} {{ payment.note }}</p>
              </article>
            </div>
            <p v-if="!order.quotes.length && !order.payments.length" class="muted">还没有报价或付款记录。</p>
            <div v-if="payableAmount > 0" class="payment-callout">
              <div>
                <span>待人工确认付款</span>
                <strong>{{ display.money(payableAmount) }}</strong>
                <small>扫码付款后管理员会核对到账。</small>
              </div>
              <NuxtLink class="button" :to="`/pay/${order.orderNumber}`">去付款</NuxtLink>
            </div>
          </section>

          <section class="work-panel">
            <div class="section-head compact">
              <h2>交付与验收</h2>
              <button class="button" type="button" :disabled="!canAccept" @click="accept">验收通过</button>
            </div>
            <div v-if="order.deliverables.length" class="message-list">
              <article v-for="item in order.deliverables" :key="item.id" class="message-item">
                <strong>{{ item.title }}</strong>
                <p>{{ item.description || "管理员已登记交付物。" }}</p>
                <small>{{ item.storageKey }}</small>
              </article>
            </div>
            <p v-else class="muted">还没有交付物。</p>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Order, OrderAttachment, OrderMessage } from "~/composables/useApi";

const route = useRoute();
const auth = useAuthStore();
const api = useApi();
const config = useRuntimeConfig();
const display = useDisplayText();
const order = ref<Order | null>(null);
const selectedFile = ref<File | null>(null);
const messageBody = ref("");
const copyState = ref("复制订单号");
const orderNumber = computed(() => String(route.params.orderNumber));
const status = computed(() => display.orderStatus(order.value?.status));
const canAccept = computed(() => order.value?.status === "review");
const latestQuoteAmount = computed(() => order.value?.quotes.at(-1)?.amount ?? order.value?.quotedPrice ?? 0);
const lastMessage = computed(() => order.value?.messages.at(-1));
const workflowStatusOrder = ["submitted", "clarifying", "quoted", "deposit_pending", "in_progress", "review", "final_payment_pending", "completed"];
const workflowCopy: Record<string, { label: string; description: string }> = {
  submitted: { label: "发起需求", description: "提交小纸条和联系方式" },
  clarifying: { label: "需求确认", description: "确认范围 材料 标准" },
  quoted: { label: "报价确认", description: "收到报价 等待确认" },
  deposit_pending: { label: "定金待付", description: "确认定金和开工条件" },
  in_progress: { label: "执行处理", description: "制作 修复 整理 代办" },
  review: { label: "交付验收", description: "交付物登记 等待反馈" },
  final_payment_pending: { label: "尾款确认", description: "确认尾款和最终款项" },
  completed: { label: "完成交付", description: "文件 结论 记录归档" }
};
const currentWorkflowIndex = computed(() => {
  if (!order.value) return 0;
  if (order.value.status === "cancelled") return -1;
  const index = workflowStatusOrder.indexOf(order.value.status);
  return index >= 0 ? index : 0;
});
const workflowSteps = computed(() =>
  workflowStatusOrder.map((key, index) => ({
    key,
    index,
    ...workflowCopy[key],
    done: currentWorkflowIndex.value >= index,
    current: currentWorkflowIndex.value === index
  }))
);
const currentWorkflowStep = computed(() => workflowSteps.value.find((step) => step.current));
const workflowProgress = computed(() => {
  if (currentWorkflowIndex.value < 0) return 0;
  return Math.round((currentWorkflowIndex.value / Math.max(1, workflowStatusOrder.length - 1)) * 100);
});
const communicationHint = computed(() => {
  if (!lastMessage.value) return "等待你发起沟通";
  return isCustomerMessage(lastMessage.value) ? "已发送，等待酷里回复" : "酷里已回复，等待你确认";
});
type ActivityRecord = {
  id: string;
  kind: "event" | "message" | "attachment" | "quote" | "payment" | "deliverable" | "email";
  icon: string;
  title: string;
  meta: string;
  body: string;
  createdAt: string;
};
const activityRecords = computed<ActivityRecord[]>(() => {
  if (!order.value) return [];
  const records: ActivityRecord[] = [];

  records.push({
    id: `demand-${order.value.id}`,
    kind: "message",
    icon: "需",
    title: "你发起了需求",
    meta: "用户消息 · 原始小纸条",
    body: order.value.originalDemand || order.value.demand || "你提交了订单需求。",
    createdAt: order.value.createdAt
  });

  records.push(
    ...order.value.events.map((event) => ({
      id: `event-${event.id}`,
      kind: "event" as const,
      icon: "节",
      title: display.orderStatus(event.status).label,
      meta: event.createdBy ? "重要节点" : "系统节点",
      body: event.note,
      createdAt: event.createdAt
    }))
  );

  records.push(
    ...order.value.messages.map((message) => {
      const fromCustomer = isCustomerMessage(message);
      return {
        id: `message-${message.id}`,
        kind: "message" as const,
        icon: "聊",
        title: fromCustomer ? "你补充了消息" : "酷里回复",
        meta: "站内沟通",
        body: message.body,
        createdAt: message.createdAt
      };
    })
  );

  records.push(
    ...order.value.attachments.map((file) => ({
      id: `attachment-${file.id}`,
      kind: "attachment" as const,
      icon: "件",
      title: `上传资料：${file.fileName}`,
      meta: `${display.attachmentStatus(file.scanStatus)} · ${display.fileSize(file.fileSize)}`,
      body: file.parsedSummary || file.scanError || "补充资料已登记到订单。",
      createdAt: file.createdAt
    }))
  );

  records.push(
    ...order.value.quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      kind: "quote" as const,
      icon: "价",
      title: `酷里发送报价 ${display.money(quote.amount)}`,
      meta: `${display.paymentKind(quote.kind)} · ${display.paymentStatus(quote.status)}`,
      body: quote.note || "酷里已发送报价。",
      createdAt: quote.createdAt
    }))
  );

  records.push(
    ...order.value.payments.map((payment) => ({
      id: `payment-${payment.id}`,
      kind: "payment" as const,
      icon: "款",
      title: `付款记录 ${display.money(payment.amount)}`,
      meta: `${display.paymentKind(payment.kind)} · ${display.paymentStatus(payment.status)}`,
      body: `${payment.method || "未填写方式"} ${payment.note || ""}`.trim() || "付款记录已登记。",
      createdAt: payment.createdAt
    }))
  );

  records.push(
    ...order.value.deliverables.map((item) => ({
      id: `deliverable-${item.id}`,
      kind: "deliverable" as const,
      icon: "交",
      title: `交付物：${item.title}`,
      meta: "交付文件",
      body: item.description || item.storageKey || "酷里已登记交付物。",
      createdAt: item.createdAt
    }))
  );

  records.push(
    ...order.value.events
      .filter((event) => event.createdBy)
      .map((event) => ({
        id: `email-${event.id}`,
        kind: "email" as const,
        icon: "邮",
        title: "小助手邮件提醒动作",
        meta: "邮件/站内提醒",
        body: `订单节点「${display.orderStatus(event.status).label}」已触发提醒队列。`,
        createdAt: event.createdAt
      }))
  );

  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});
const payableAmount = computed(() => {
  if (!order.value) return 0;
  const received = order.value.payments
    .filter((payment) => payment.status === "received")
    .reduce((total, payment) => total + payment.amount, 0);
  return Math.max(0, latestQuoteAmount.value - received);
});

onMounted(async () => {
  await auth.restore();
  await load();
});

async function load() {
  if (!auth.token) return;
  order.value = (await api.getOrder(auth.token, orderNumber.value)).order;
}

function onFileChange(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}

async function attachSelected() {
  if (!auth.token || !selectedFile.value) return;
  const upload = await api.presignUpload(auth.token, {
    orderNumber: orderNumber.value,
    fileName: selectedFile.value.name,
    fileSize: selectedFile.value.size,
    contentType: selectedFile.value.type || "application/octet-stream"
  });
  await api.uploadFile(auth.token, upload.upload, selectedFile.value);
  order.value = (
    await api.addOrderAttachment(auth.token, orderNumber.value, {
      fileName: selectedFile.value.name,
      fileSize: selectedFile.value.size,
      contentType: selectedFile.value.type || "application/octet-stream",
      storageKey: upload.upload.objectKey,
      bucket: upload.upload.bucket,
      checksum: await sha256File(selectedFile.value)
    })
  ).order;
  selectedFile.value = null;
}

async function sha256File(file: File) {
  if (!crypto.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sendMessage() {
  if (!auth.token || !messageBody.value.trim()) return;
  order.value = (await api.addOrderMessage(auth.token, orderNumber.value, messageBody.value.trim())).order;
  messageBody.value = "";
}

function isCustomerMessage(item: OrderMessage) {
  return item.authorUserId === auth.user?.id;
}

function messageSpeaker(item: OrderMessage) {
  return isCustomerMessage(item) ? "你" : "酷里";
}

function messageClass(item: OrderMessage) {
  return isCustomerMessage(item) ? "from-customer" : "from-admin";
}

async function copyOrderNumber() {
  await navigator.clipboard?.writeText(orderNumber.value);
  copyState.value = "已复制";
  window.setTimeout(() => {
    copyState.value = "复制订单号";
  }, 1800);
}

async function accept() {
  if (!auth.token) return;
  order.value = (await api.acceptOrder(auth.token, orderNumber.value)).order;
}

async function openAttachment(file: OrderAttachment) {
  if (!auth.token) return;
  const response = await api.getAttachmentDownload(auth.token, orderNumber.value, file.id);
  const url = response.download.downloadUrl.startsWith("/")
    ? `${config.public.apiBaseUrl}${response.download.downloadUrl}`
    : response.download.downloadUrl;
  window.open(url, "_blank", "noopener");
}
</script>
