<template>
  <section class="shell app-surface">
    <header class="orders-header">
      <div>
        <p class="plain-label">写小纸条</p>
        <h1 class="page-title">先把需求写清楚</h1>
        <p class="lead">不用一开始就写方案。先说目标、材料、交付期待和时间预算，小酷可以帮你整理</p>
      </div>
      <NuxtLink class="button secondary" to="/help?doc=quick-start">查看填写指南</NuxtLink>
    </header>

    <div class="note-workbench" id="note-form">
      <aside class="note-assist">
        <article class="note-service-card">
          <span class="plain-label">当前服务</span>
          <h2>{{ selectedService?.title ?? "先判断分类" }}</h2>
          <p class="muted">{{ selectedService?.summary ?? "如果不知道属于哪类，就先选“不知道怎么分”，酷里会继续追问。" }}</p>
          <div class="choice-row">
            <label v-for="service in services" :key="service.slug">
              <input v-model="serviceSlug" type="radio" name="kind" :value="service.slug">
              <span>{{ service.tag }}</span>
            </label>
          </div>
        </article>

        <article class="note-service-card">
          <h2>材料清单</h2>
          <ul class="material-list">
            <li v-for="item in materialList" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="note-service-card">
          <h2>示例小纸条</h2>
          <p class="muted">{{ exampleNote }}</p>
          <button class="button secondary" type="button" @click="useExample">套用示例</button>
        </article>
      </aside>

      <form class="form-panel" @submit.prevent="submit">
        <section class="note-step">
          <header>
            <div><span class="note-step-number">1</span></div>
            <div>
              <h2>你想解决什么</h2>
              <p class="muted">先写最终想达到什么效果，再写现在卡在哪里。</p>
            </div>
          </header>
          <textarea id="need-detail" v-model="originalDemand" maxlength="1000" placeholder="例如：我有一份 PDF 想翻译成中文，保留大致排版；现在文件比较长，里面有表格和截图。" />
          <small>{{ originalDemand.length }} / 1000</small>
        </section>

        <section class="note-step">
          <header>
            <span class="note-step-number">2</span>
            <div>
              <h2>已有材料</h2>
              <p class="muted">截图、PDF、Word、表格、报错文本都可以。你也可以先不上传，等管理员追问时再补充</p>
            </div>
          </header>
          <div class="choice-row">
            <label><input v-model="uploadMode" type="radio" name="upload-mode" value="later"><span>暂不上传</span></label>
            <label><input v-model="uploadMode" type="radio" name="upload-mode" value="now"><span>现在上传</span></label>
          </div>
          <input v-if="uploadMode === 'now'" type="file" multiple @change="onFilesChange">
          <ul v-if="uploadMode === 'now' && selectedFiles.length" class="file-list">
            <li v-for="file in selectedFiles" :key="`${file.name}-${file.size}`">{{ file.name }} · {{ display.fileSize(file.size) }}</li>
          </ul>
        </section>

        <section class="note-step">
          <header>
            <span class="note-step-number">3</span>
            <div>
              <h2>小酷整理</h2>
              <p class="muted">把口语化描述整理成给管理员看的版本，你可以继续修改。</p>
            </div>
          </header>
          <button class="button secondary" type="button" :disabled="!originalDemand.trim()" @click="polish">小酷帮我整理成给管理员看的版本</button>
          <textarea id="polished-demand" v-model="demand" placeholder="整理后的版本会出现在这里；不点整理也可以直接提交原文。" />
          <div v-if="hints.length" class="hint-box">
            <p><strong>建议补充：</strong>{{ hints.join("；") }}</p>
          </div>
        </section>

        <section class="note-step">
          <header>
            <span class="note-step-number">4</span>
            <div>
              <h2>时间、预算和联系方式</h2>
              <p class="muted">只用于判断优先级和沟通方式。</p>
            </div>
          </header>
          <div class="field">
            <label>什么时候需要？</label>
            <div class="choice-row">
              <label v-for="item in urgencyOptions" :key="item"><input v-model="urgency" type="radio" name="time" :value="item"><span>{{ item }}</span></label>
            </div>
          </div>
          <div class="field">
            <label>预算大概多少？</label>
            <div class="choice-row">
              <label v-for="item in budgetOptions" :key="item"><input v-model="budget" type="radio" name="budget" :value="item"><span>{{ item }}</span></label>
            </div>
          </div>
          <div class="field">
            <label for="contact-email">邮箱</label>
            <input id="contact-email" v-model="email" type="email" required placeholder="用于接收订单状态、报价和交付提醒">
            <small>默认在站内跟进订单，酷里小助手 team@kuly.com.cn 会通过邮件同步关键状态。</small>
          </div>
          <div class="field optional-contact">
            <label for="other-contact">其他联系方式</label>
            <input id="other-contact" v-model="otherContact" type="text" required placeholder="微信 / QQ / 手机号任选一种">
            <div class="wecom-inline">
              <div>
                <strong>也可以添加企业微信</strong>
                <p>适合需要语音、截图来回确认的情况；订单记录、支付和交付仍以站内为准。</p>
              </div>
              <img src="/contact/wecom-contact.png" alt="酷里企业微信二维码">
            </div>
          </div>
        </section>

        <button class="button submit-button" type="submit" :disabled="submitting || !canSubmit">
          {{ submitting ? "提交中" : "提交给酷里判断" }}
        </button>
        <div v-if="result" class="status-box is-visible">
          已提交：{{ result.orderNumber }}，下一步：{{ result.nextAction }}
          <NuxtLink class="chip" :to="`/orders/${result.orderNumber}`">查看订单</NuxtLink>
        </div>
      </form>

      <aside class="note-preview">
        <article class="note-preview-card">
          <span class="note-paper-pin">提交预览</span>
          <h2>{{ selectedService?.tag ?? "先聊聊" }}</h2>
          <ul class="preview-list">
            <li><strong>需求：</strong>{{ previewDemand || "还没有填写需求" }}</li>
            <li><strong>材料：</strong>{{ uploadMode === "now" && selectedFiles.length ? `${selectedFiles.length} 个附件` : "暂不上传附件" }}</li>
            <li><strong>时间：</strong>{{ urgency }}</li>
            <li><strong>预算：</strong>{{ budget }}</li>
            <li><strong>邮箱：</strong>{{ email || "待填写" }}</li>
            <li><strong>其他联系：</strong>{{ otherContact || "待填写" }}</li>
          </ul>
        </article>
        <article class="notice safety">
          <strong>安全提醒</strong>
          <span>账号类需求后续由管理员确认安全方式。不要在纸条或附件里放密码、验证码、私钥、支付凭证等敏感信息。</span>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const api = useApi();
const display = useDisplayText();
const { data } = await useAsyncData("note-services", () => api.listServices());
const services = computed(() => data.value?.services ?? []);
const serviceSlug = ref(String(route.query.service ?? "not-sure"));
const selectedService = computed(() => services.value.find((service) => service.slug === serviceSlug.value));
const originalDemand = ref("");
const demand = ref("");
const email = ref("");
const otherContact = ref("");
const urgency = ref("1-2 天");
const budget = ref("先报价看看");
const hints = ref<string[]>([]);
const intent = ref("consultation");
const result = ref<{ orderNumber: string; nextAction: string } | null>(null);
const selectedFiles = ref<File[]>([]);
const uploadMode = ref<"later" | "now">("later");
const submitting = ref(false);
const urgencyOptions = ["今天", "1-2 天", "3-5 天", "不急", "先聊聊"];
const budgetOptions = ["50 元以内", "50-100", "100-300", "300-1000", "先报价看看"];

const fallbackMaterials = ["一张截图或报错文本", "想达到的结果", "相关文件或链接", "期望时间和预算"];
const materialList = computed(() => selectedService.value?.requiredMaterials?.length ? selectedService.value.requiredMaterials : fallbackMaterials);
const previewDemand = computed(() => (demand.value || originalDemand.value).trim());
const contactNote = computed(() => otherContact.value.trim() ? `${email.value.trim()}；备用：${otherContact.value.trim()}` : email.value.trim());
const canSubmit = computed(() => Boolean(
  originalDemand.value.trim()
  && urgency.value.trim()
  && budget.value.trim()
  && email.value.trim()
  && otherContact.value.trim()
));
const exampleNote = computed(() => {
  const tag = selectedService.value?.tag ?? "先聊聊";
  if (serviceSlug.value === "document-processing") return "我有一份 PDF 想翻译成中文，尽量保留排版。文件里有表格和截图，希望两天内拿到可检查版本。";
  if (serviceSlug.value === "tool-development") return "我想做一个课程展示用的小网页，有首页、提交表单和结果页，先做能演示的版本。";
  if (serviceSlug.value === "deployment-config") return "我的项目部署到服务器后打不开，域名和端口都不确定。我可以提供报错截图和当前配置。";
  if (serviceSlug.value === "ai-tools") return "我想开通或使用 AI 工具，但不确定账号、订阅和 API key 怎么处理，想先判断可行路径。";
  return `我现在不确定属于哪类，只知道和「${tag}」有关。目标是先判断能不能做，需要我补什么材料。`;
});

watch(uploadMode, (mode) => {
  if (mode === "later") selectedFiles.value = [];
});

function useExample() {
  originalDemand.value = exampleNote.value;
}

function onFilesChange(event: Event) {
  selectedFiles.value = Array.from((event.target as HTMLInputElement).files ?? []);
}

async function polish() {
  const response = await api.polishDemand({ demand: originalDemand.value, serviceSlug: serviceSlug.value });
  demand.value = response.polishedDemand;
  hints.value = response.hints;
  intent.value = response.intent;
}

async function submit() {
  submitting.value = true;
  try {
    const auth = useAuthStore();
    await auth.restore();
    const response = await api.createOrder({
      serviceSlug: serviceSlug.value,
      originalDemand: originalDemand.value,
      demand: demand.value || originalDemand.value,
      category: selectedService.value?.tag ?? "先聊聊",
      urgency: urgency.value,
      budget: budget.value,
      contact: contactNote.value,
      intent: intent.value
    }, auth.token);
    result.value = { orderNumber: response.order.orderNumber, nextAction: response.order.nextAction };
    if (auth.token && uploadMode.value === "now") await uploadAttachments(auth.token, response.order.orderNumber);
  } finally {
    submitting.value = false;
  }
}

async function uploadAttachments(token: string, orderNumber: string) {
  for (const file of selectedFiles.value) {
    const upload = await api.presignUpload(token, {
      orderNumber,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || "application/octet-stream"
    });
    await api.uploadFile(token, upload.upload, file);
    await api.addOrderAttachment(token, orderNumber, {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || "application/octet-stream",
      storageKey: upload.upload.objectKey,
      bucket: upload.upload.bucket,
      checksum: await sha256File(file)
    });
  }
  selectedFiles.value = [];
}

async function sha256File(file: File) {
  if (!crypto.subtle) return "";
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
</script>
