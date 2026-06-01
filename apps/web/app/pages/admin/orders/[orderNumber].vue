<template>
  <section class="shell app-surface">
    <NuxtLink class="back-link" to="/admin">← 返回管理台</NuxtLink>
    <div v-if="!auth.user" class="info-card dense">
      <strong>需要管理员登录</strong>
      <NuxtLink class="button" to="/login">去登录</NuxtLink>
    </div>

    <div v-else-if="order" class="admin-workbench admin-order-page">
      <header class="admin-order-hero">
        <div class="admin-order-title">
          <span class="status-pill" :class="display.orderStatus(order.status).tone">{{ display.orderStatus(order.status).label }}</span>
          <h1>{{ order.orderNumber }}</h1>
          <p>{{ order.title }}</p>
        </div>
        <dl class="admin-order-facts">
          <div><dt>客户</dt><dd>{{ order.customerName }}</dd></div>
          <div><dt>联系</dt><dd>{{ order.contact }}</dd></div>
          <div><dt>服务</dt><dd>{{ order.category }}</dd></div>
          <div><dt>更新</dt><dd>{{ display.dateTime(order.updatedAt) }}</dd></div>
        </dl>
        <div class="amount-card admin-next-card">
          <span>{{ display.priority(order.priority) }}</span>
          <strong>{{ order.nextAction }}</strong>
          <small>当前最该处理的事</small>
        </div>
      </header>

      <section class="work-panel admin-progress-panel order-wide-progress">
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

      <div class="admin-shell">
        <main class="order-workbench">
          <section class="work-panel admin-action-panel">
            <div class="admin-panel-head">
              <div>
                <h2>处理动作</h2>
                <p>先改状态和下一步，备注按客户可见和内部处理分开写。</p>
              </div>
              <button class="button" type="button" @click="savePatch">保存维护</button>
            </div>
            <div class="admin-control-grid">
              <label>状态
                <select v-model="patch.status">
                  <option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                </select>
              </label>
              <label>优先级
                <select v-model="patch.priority">
                  <option value="low">低</option>
                  <option value="normal">正常</option>
                  <option value="high">高</option>
                  <option value="urgent">紧急</option>
                </select>
              </label>
              <label>成本
                <input v-model.number="patch.cost" type="number" min="0">
              </label>
              <label>利润
                <input v-model.number="patch.profit" type="number" min="0">
              </label>
            </div>
            <label>下一步
              <input v-model="patch.nextAction">
            </label>
            <div class="admin-note-grid">
              <label>客户可见备注
                <textarea v-model="patch.publicNotes"></textarea>
              </label>
              <label>内部备注
                <textarea v-model="patch.internalNotes"></textarea>
              </label>
            </div>
          </section>

          <section class="work-panel admin-content-panel">
            <div class="admin-panel-head">
              <div>
                <h2>客户材料</h2>
                <p>先看客户原文和整理版本，再处理附件。</p>
              </div>
            </div>
            <div class="admin-demand-grid">
              <article class="message-item">
                <small>客户原文</small>
                <p>{{ order.originalDemand }}</p>
              </article>
              <article class="message-item">
                <small>整理版本</small>
                <p>{{ order.demand }}</p>
              </article>
            </div>
            <div v-if="order.attachments.length" class="admin-attachment-list">
              <div v-for="file in order.attachments" :key="file.id" class="admin-file-row">
                <div>
                  <strong>{{ file.fileName }}</strong>
                  <small>{{ display.attachmentStatus(file.scanStatus) }} · {{ display.fileSize(file.fileSize) }}</small>
                  <p v-if="file.parsedSummary">{{ file.parsedSummary }}</p>
                  <p v-if="file.scanError">解析问题：{{ file.scanError }}</p>
                </div>
                <div class="empty-actions">
                  <button class="button secondary" type="button" @click="openAttachment(file)">下载</button>
                  <button class="button secondary" type="button" @click="retryScan(file)">重试解析</button>
                </div>
              </div>
            </div>
            <p v-else class="muted">暂无附件。</p>
          </section>

          <section class="work-panel admin-activity-panel">
            <div class="admin-panel-head">
              <div>
                <h2>沟通与重要记录</h2>
                <p>用户消息、上传材料、管理员回复、小助手邮件提醒动作、报价收款和交付物都会汇总在这里。</p>
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

          <section class="work-panel communication-panel">
            <div class="admin-panel-head communication-head">
              <div>
                <h2>客户沟通</h2>
                <p>默认通过站内订单和邮件提醒跟进。客户可见消息会进入用户订单页；内部备注只留在后台。</p>
              </div>
              <span class="conversation-status">{{ adminCommunicationHint }}</span>
            </div>

            <div class="channel-note">
              <div>
                <strong>客户联系渠道</strong>
                <p>{{ order.contact || "客户暂未留下联系方式" }} · 站内沟通和邮件提醒 · 订单号 {{ order.orderNumber }}</p>
              </div>
              <button class="button secondary" type="button" @click="copyOrderNumber">{{ copyState }}</button>
            </div>

            <div v-if="order.messages.length" class="message-list conversation-list">
              <article
                v-for="item in order.messages"
                :key="item.id"
                class="message-item conversation-message"
                :class="adminMessageClass(item)"
              >
                <div class="message-meta">
                  <strong>{{ adminMessageSpeaker(item) }}</strong>
                  <small>{{ display.visibility(item.visibility) }} · {{ display.dateTime(item.createdAt) }}</small>
                </div>
                <p>{{ item.body }}</p>
              </article>
            </div>
            <p v-else class="muted">暂无沟通记录。可以先给客户发一条确认口径，或写内部备注分配处理人。</p>

            <div class="message-composer admin-composer">
              <textarea v-model="adminMessage.body" placeholder="给客户或内部团队的备注"></textarea>
              <div>
                <label class="visibility-select">发送范围
                  <select v-model="adminMessage.visibility">
                    <option value="public">客户可见</option>
                    <option value="internal">内部备注</option>
                  </select>
                </label>
                <button class="button" type="button" @click="sendAdminMessage">发送消息</button>
              </div>
            </div>
          </section>

          <section class="work-panel">
            <div class="admin-panel-head">
              <div>
                <h2>AI 自动化建议</h2>
                <p>把建议当成提醒，采纳前先看客户材料和上下文。</p>
              </div>
              <button class="button secondary" type="button" @click="runAutomation">重新运行</button>
            </div>
            <div v-if="order.automationSuggestions.length" class="message-list">
              <article v-for="suggestion in order.automationSuggestions" :key="suggestion.id" class="message-item">
                <small>{{ suggestion.severity }} · {{ suggestion.kind }}</small>
                <strong>{{ suggestion.summary }}</strong>
                <p>建议状态：{{ suggestion.suggestedStatus ? display.orderStatus(suggestion.suggestedStatus).label : "不改状态" }} · 置信度：{{ Math.round(suggestion.confidence * 100) }}%</p>
                <button v-if="suggestion.status === 'open'" class="button secondary" type="button" @click="applySuggestion(suggestion.id)">采纳建议</button>
              </article>
            </div>
            <p v-else class="muted">暂无建议。</p>
          </section>
        </main>

        <aside class="admin-side">
          <section class="work-panel admin-money-panel">
            <h2>报价、收款、交付</h2>
            <div class="admin-side-form">
              <strong>发报价</strong>
              <input v-model.number="quote.amount" type="number" min="0" placeholder="报价金额">
              <select v-model="quote.kind">
                <option value="full">全款</option>
                <option value="deposit">定金</option>
                <option value="final">尾款</option>
              </select>
              <input v-model="quote.note" placeholder="报价说明">
              <button class="button secondary" type="button" @click="addQuote">发报价</button>
            </div>
            <div class="admin-side-form">
              <strong>记收款</strong>
              <input v-model.number="payment.amount" type="number" min="0" placeholder="收款金额">
              <select v-model="payment.kind">
                <option value="deposit">定金</option>
                <option value="final">尾款</option>
                <option value="full">全款</option>
              </select>
              <select v-model="payment.status">
                <option value="pending">待确认</option>
                <option value="received">已收到</option>
              </select>
              <input v-model="payment.method" placeholder="收款方式">
              <button class="button secondary" type="button" @click="addPayment">记收款</button>
            </div>
            <div class="admin-side-form">
              <strong>登记交付</strong>
              <input v-model="deliverable.title" placeholder="交付物标题">
              <input v-model="deliverable.storageKey" placeholder="交付链接或存储标识">
              <button class="button secondary" type="button" @click="addDeliverable">登记交付</button>
            </div>
          </section>

          <section class="work-panel">
            <h2>运营记录</h2>
            <div v-if="order.quotes.length || order.payments.length || order.deliverables.length" class="message-list compact-records">
              <article v-for="item in order.quotes" :key="item.id" class="message-item">
                <small>报价 · {{ display.paymentKind(item.kind) }} · {{ display.paymentStatus(item.status) }}</small>
                <strong>{{ display.money(item.amount) }}</strong>
                <p>{{ item.note }}</p>
              </article>
              <article v-for="item in order.payments" :key="item.id" class="message-item">
                <small>收款 · {{ display.paymentKind(item.kind) }} · {{ display.paymentStatus(item.status) }}</small>
                <strong>{{ display.money(item.amount) }}</strong>
                <p>{{ item.method }} {{ item.note }}</p>
              </article>
              <article v-for="item in order.deliverables" :key="item.id" class="message-item">
                <small>交付物</small>
                <strong>{{ item.title }}</strong>
                <p>{{ item.description || "已登记交付。" }}</p>
              </article>
            </div>
            <p v-else class="muted">暂无报价、收款或交付记录。</p>
          </section>

          <section class="work-panel">
            <h2>待办与 AI 摘要</h2>
            <div class="message-list">
              <article v-for="todo in order.todos" :key="todo.id" class="message-item">
                <small>{{ todo.status }} · {{ todo.source }}</small>
                <strong>{{ todo.title }}</strong>
              </article>
              <article v-for="summary in order.aiSummaries" :key="summary.id" class="message-item">
                <small>AI 摘要</small>
                <p>{{ summary.summary }}</p>
                <small>{{ summary.suggestedQuestions.join("、") }}</small>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AdminOrder, AdminOrderPatch, OrderAttachment, OrderMessage } from "~/composables/useApi";
import { useDisplayText } from "~/composables/useDisplayText";

const route = useRoute();
const auth = useAuthStore();
const api = useApi();
const config = useRuntimeConfig();
const display = useDisplayText();
const order = ref<AdminOrder | null>(null);
const orderNumber = computed(() => String(route.params.orderNumber));
const patch = reactive<AdminOrderPatch>({});
const adminMessage = reactive<{ body: string; visibility: "public" | "internal" }>({ body: "", visibility: "public" });
const copyState = ref("复制订单号");
const quote = reactive({ amount: 0, kind: "deposit", note: "" });
const payment = reactive({ amount: 0, kind: "deposit", method: "微信/支付宝/银行转账", status: "received", note: "" });
const deliverable = reactive({ title: "", description: "", storageKey: "" });
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
const lastMessage = computed(() => order.value?.messages.at(-1));
const workflowStatusOrder = ["submitted", "clarifying", "quoted", "deposit_pending", "in_progress", "review", "final_payment_pending", "completed"];
const workflowCopy: Record<string, { label: string; description: string }> = {
  submitted: { label: "发起需求", description: "提交小纸条和联系方式" },
  clarifying: { label: "需求确认", description: "确认范围 材料 标准" },
  quoted: { label: "报价确认", description: "发送报价 等待确认" },
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
const adminCommunicationHint = computed(() => {
  if (!lastMessage.value) return "还没有开始沟通";
  if (lastMessage.value.visibility === "internal") return "最近是内部备注";
  return isCustomerMessage(lastMessage.value) ? "客户刚补充了消息" : "最近由酷里回复";
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
    title: "用户发起需求",
    meta: "用户消息 · 原始小纸条",
    body: order.value.originalDemand || order.value.demand || "用户提交了订单需求。",
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
      const internal = message.visibility === "internal";
      return {
        id: `message-${message.id}`,
        kind: "message" as const,
        icon: internal ? "内" : "聊",
        title: internal ? "内部备注" : fromCustomer ? "客户补充消息" : "酷里回复客户",
        meta: display.visibility(message.visibility),
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
      body: file.parsedSummary || file.scanError || "用户上传的补充资料已登记到订单。",
      createdAt: file.createdAt
    }))
  );

  records.push(
    ...order.value.quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      kind: "quote" as const,
      icon: "价",
      title: `发送报价 ${display.money(quote.amount)}`,
      meta: `${display.paymentKind(quote.kind)} · ${display.paymentStatus(quote.status)}`,
      body: quote.note || "管理员已发送报价。",
      createdAt: quote.createdAt
    }))
  );

  records.push(
    ...order.value.payments.map((payment) => ({
      id: `payment-${payment.id}`,
      kind: "payment" as const,
      icon: "款",
      title: `记录收款 ${display.money(payment.amount)}`,
      meta: `${display.paymentKind(payment.kind)} · ${display.paymentStatus(payment.status)}`,
      body: `${payment.method || "未填写方式"} ${payment.note || ""}`.trim() || "管理员已登记付款记录。",
      createdAt: payment.createdAt
    }))
  );

  records.push(
    ...order.value.deliverables.map((item) => ({
      id: `deliverable-${item.id}`,
      kind: "deliverable" as const,
      icon: "交",
      title: `登记交付物：${item.title}`,
      meta: "交付文件",
      body: item.description || item.storageKey || "管理员已登记交付物。",
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
        body: `订单节点「${display.orderStatus(event.status).label}」已触发客户提醒队列。`,
        createdAt: event.createdAt
      }))
  );

  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

onMounted(async () => {
  await auth.restore();
  await load();
});

async function load() {
  if (!auth.token) return;
  order.value = (await api.getAdminOrder(auth.token, orderNumber.value)).order;
  syncPatch();
}

async function runAutomation() {
  if (!auth.token) return;
  order.value = (await api.runAutomation(auth.token, orderNumber.value)).order;
  syncPatch();
}

async function savePatch() {
  if (!auth.token) return;
  order.value = (await api.updateAdminOrder(auth.token, orderNumber.value, patch)).order;
  syncPatch();
}

async function applySuggestion(id: string) {
  if (!auth.token) return;
  order.value = (await api.applySuggestion(auth.token, orderNumber.value, id)).order;
  syncPatch();
}

async function sendAdminMessage() {
  if (!auth.token || !adminMessage.body.trim()) return;
  order.value = (await api.addAdminMessage(auth.token, orderNumber.value, { body: adminMessage.body.trim(), visibility: adminMessage.visibility })).order;
  adminMessage.body = "";
}

function isCustomerMessage(item: OrderMessage) {
  return item.authorUserId === order.value?.ownerUserId;
}

function adminMessageSpeaker(item: OrderMessage) {
  if (item.visibility === "internal") return "内部备注";
  return isCustomerMessage(item) ? "客户" : "酷里";
}

function adminMessageClass(item: OrderMessage) {
  if (item.visibility === "internal") return "is-internal";
  return isCustomerMessage(item) ? "from-customer" : "from-admin";
}

async function copyOrderNumber() {
  await navigator.clipboard?.writeText(orderNumber.value);
  copyState.value = "已复制";
  window.setTimeout(() => {
    copyState.value = "复制订单号";
  }, 1800);
}

async function openAttachment(file: OrderAttachment) {
  if (!auth.token) return;
  const response = await api.getAttachmentDownload(auth.token, orderNumber.value, file.id);
  const url = response.download.downloadUrl.startsWith("/")
    ? `${config.public.apiBaseUrl}${response.download.downloadUrl}`
    : response.download.downloadUrl;
  window.open(url, "_blank", "noopener");
}

async function retryScan(file: OrderAttachment) {
  if (!auth.token) return;
  order.value = (await api.retryAttachmentScan(auth.token, orderNumber.value, file.id)).order;
  syncPatch();
}

async function addQuote() {
  if (!auth.token || !quote.amount || !quote.note.trim()) return;
  order.value = (await api.addQuote(auth.token, orderNumber.value, { amount: quote.amount, kind: quote.kind, note: quote.note.trim() })).order;
  quote.amount = 0;
  quote.note = "";
  syncPatch();
}

async function addPayment() {
  if (!auth.token || !payment.amount) return;
  order.value = (await api.addPayment(auth.token, orderNumber.value, { ...payment })).order;
  payment.amount = 0;
  payment.note = "";
  syncPatch();
}

async function addDeliverable() {
  if (!auth.token || !deliverable.title.trim() || !deliverable.storageKey.trim()) return;
  order.value = (await api.addDeliverable(auth.token, orderNumber.value, { ...deliverable })).order;
  deliverable.title = "";
  deliverable.storageKey = "";
  deliverable.description = "";
  syncPatch();
}

function syncPatch() {
  if (!order.value) return;
  patch.status = order.value.status;
  patch.priority = order.value.priority;
  patch.cost = order.value.cost ?? undefined;
  patch.profit = order.value.profit ?? undefined;
  patch.publicNotes = order.value.publicNotes;
  patch.internalNotes = order.value.internalNotes;
  patch.nextAction = order.value.nextAction;
}
</script>
