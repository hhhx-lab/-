<template>
  <section class="shell proto-note-page">
    <header class="proto-note-hero">
      <h1>写张小纸条给<em>酷里</em><span aria-hidden="true">⌁</span></h1>
      <p>不用写得太专业，直接说你想干嘛、哪里卡住了、希望什么时候搞定就行。</p>
    </header>

    <div class="proto-note-layout">
      <form class="proto-note-form" @submit.prevent="submit">
        <section class="proto-note-step">
          <header><span>1</span><h2>你想搞什么？<small>越详细越好，我们更容易理解</small></h2></header>
          <textarea v-model="originalDemand" maxlength="800" placeholder="例如：&#10;我想开通 GPT Pro，但是不会弄&#10;我想注册 Google 账号&#10;我有个 PDF 想翻译并保留格式&#10;我想做一个课程项目网页 demo" />
          <div class="proto-step-tools">
            <button class="button secondary proto-mini-button" type="button" :disabled="!originalDemand.trim() || polishing" @click="polish">
              {{ polishing ? "整理中" : "小酷帮我整理" }}
            </button>
            <small>{{ originalDemand.length }} / 800</small>
          </div>
          <textarea v-if="demand" v-model="demand" class="proto-polished-field" placeholder="整理后的版本会出现在这里，你可以继续修改。" />
          <p v-if="hints.length" class="proto-hint-line">建议补充：{{ hints.join("；") }}</p>
        </section>

        <section class="proto-note-step">
          <header><span>2</span><h2>大概属于哪一类？</h2></header>
          <div class="proto-choice-group">
            <label v-for="service in serviceChoices" :key="service.value" :class="{ selected: serviceSlug === service.value }">
              <input v-model="serviceSlug" type="radio" name="service" :value="service.value">
              <span>{{ service.label }}</span>
            </label>
          </div>
        </section>

        <section class="proto-note-step">
          <header><span>3</span><h2>什么时候需要？</h2></header>
          <div class="proto-choice-group compact">
            <label v-for="item in urgencyOptions" :key="item" :class="{ selected: urgency === item }">
              <input v-model="urgency" type="radio" name="urgency" :value="item">
              <span>{{ item }}</span>
            </label>
          </div>
        </section>

        <section class="proto-note-step">
          <header><span>4</span><h2>能不能远程帮你看？<small title="安装、配置、报错类问题远程会更快；是否远程由你确认。">ⓘ</small></h2></header>
          <div class="proto-choice-group remote">
            <label v-for="item in remoteOptions" :key="item" :class="{ selected: remoteSupport === item }">
              <input v-model="remoteSupport" type="radio" name="remote" :value="item">
              <span>{{ item }}</span>
            </label>
          </div>
          <p class="proto-soft-tip">有些安装、配置、报错类问题，远程看会快很多。</p>
        </section>

        <section class="proto-note-step">
          <header><span>5</span><h2>预算大概多少？</h2></header>
          <div class="proto-choice-group compact">
            <label v-for="item in budgetOptions" :key="item" :class="{ selected: budget === item }">
              <input v-model="budget" type="radio" name="budget" :value="item">
              <span>{{ item }}</span>
            </label>
          </div>
        </section>

        <section class="proto-note-step">
          <header><span>6</span><h2>有截图 / 文件 / 报错的话，也可以传一下</h2></header>
          <label class="proto-dropzone">
            <input type="file" multiple @change="onFilesChange">
            <span aria-hidden="true">☁</span>
            <strong>点击或拖拽文件到这里上传</strong>
            <small>支持图片、PDF、文档、压缩包等，单个文件 <= 50MB</small>
          </label>
          <ul v-if="selectedFiles.length" class="proto-selected-files">
            <li v-for="file in selectedFiles" :key="`${file.name}-${file.size}`">
              <span>{{ file.name }}</span>
              <small>{{ display.fileSize(file.size) }}</small>
              <button type="button" @click="removeFile(file.name, file.size)">移除</button>
            </li>
          </ul>
        </section>

        <section class="proto-note-step">
          <header><span>7</span><h2>怎么联系你？</h2></header>
          <div class="proto-contact-row">
            <div class="proto-choice-group contact">
              <label v-for="item in contactMethods" :key="item.value" :class="{ selected: contactMethod === item.value }">
                <input v-model="contactMethod" type="radio" name="contact-method" :value="item.value">
                <span>{{ item.label }}</span>
              </label>
            </div>
            <input v-model="contactValue" :type="contactInputType" :placeholder="contactPlaceholder" required>
          </div>
          <p class="proto-soft-tip">仅用于沟通，不会对外公开。</p>
        </section>

        <article class="proto-notice-bar proto-note-notice">
          <span aria-hidden="true">♢</span>
          <p>小活可以先做完再结；大一点的活可能要先付点定金。默认不包长期售后，部署 / 维护 / 修改另算。</p>
        </article>

        <button class="button proto-note-submit" type="submit" :disabled="submitting || !canSubmit">
          <span aria-hidden="true">⌁</span>{{ submitting ? "正在丢给酷里..." : "把小纸条丢给酷里" }}
        </button>
        <div v-if="result" class="status-box is-visible">
          已提交：{{ result.orderNumber }}，下一步：{{ result.nextAction }}
          <NuxtLink class="chip" :to="`/orders/${result.orderNumber}`">查看订单</NuxtLink>
        </div>
      </form>

      <aside class="proto-note-aside">
        <article class="proto-sticky-note proto-note-blue proto-aside-sticky">
          <span class="proto-tape" aria-hidden="true"></span>
          <p>不知道怎么写？<br>直接说人话就行！</p>
        </article>
        <h2>不知怎么描述也没关系</h2>
        <p>你可以像下面这样说 -</p>
        <div class="proto-example-chat">
          <button v-for="item in exampleMessages" :key="item.text" type="button" @click="useExample(item.text)">
            <span>K</span>
            <strong>{{ item.text }}</strong>
            <small>{{ item.emoji }}</small>
          </button>
        </div>
        <div class="proto-tip-list">
          <h3>小贴士</h3>
          <article v-for="tip in tips" :key="tip.title">
            <span aria-hidden="true">✓</span>
            <div><strong>{{ tip.title }}</strong><p>{{ tip.description }}</p></div>
          </article>
        </div>
        <article class="proto-sticky-note proto-note-lime proto-aside-bottom-note">
          <p>收到你的纸条后，酷里会尽快回复你~</p>
          <small>- Kuli :)</small>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDisplayText } from "~/composables/useDisplayText";

const route = useRoute();
const api = useApi();
const auth = useAuthStore();
const display = useDisplayText();
const { data } = await useAsyncData("note-services", () => api.listServices());
const services = computed(() => data.value?.services ?? []);
const serviceSlug = ref(String(route.query.service ?? "not-sure"));
const originalDemand = ref(typeof route.query.topic === "string" ? `我想咨询：${route.query.topic}` : "");
const demand = ref("");
const contactMethod = ref<"wechat" | "qq" | "email">("wechat");
const contactValue = ref("");
const urgency = ref("1-2 天");
const budget = ref("先报价看看");
const remoteSupport = ref("看情况，需要的时候再说");
const hints = ref<string[]>([]);
const intent = ref("consultation");
const result = ref<{ orderNumber: string; nextAction: string } | null>(null);
const selectedFiles = ref<File[]>([]);
const submitting = ref(false);
const polishing = ref(false);

const urgencyOptions = ["今天", "1-2 天", "3-5 天", "不急", "先聊聊"];
const budgetOptions = ["50 元以内", "50-100", "100-300", "300-1000", "1000+", "先报价看看"];
const remoteOptions = ["可以远程，方便你们直接帮我看", "暂时不方便，先文字或截图沟通", "看情况，需要的时候再说"];
const contactMethods = [
  { label: "微信", value: "wechat" },
  { label: "QQ", value: "qq" },
  { label: "邮箱", value: "email" }
] as const;
const fallbackServices = [
  { label: "GPT / AI 工具", value: "ai-tools" },
  { label: "Google / 账号相关", value: "ai-tools" },
  { label: "Claude / AI 工具", value: "ai-tools" },
  { label: "文档处理", value: "document-processing" },
  { label: "小工具开发", value: "tool-development" },
  { label: "部署配置", value: "deployment-config" },
  { label: "不知道怎么分", value: "not-sure" }
];
const exampleMessages = [
  { text: "我想开通 GPT Pro，但是不会弄", emoji: "🙂" },
  { text: "我想注册一个 Google 账号", emoji: "👍" },
  { text: "我的 PDF 需要翻译，还要保持排版", emoji: "📚" },
  { text: "想做一个课程项目网页 demo，有设计稿", emoji: "🚀" }
];
const tips = [
  { title: "越具体，越容易搞定", description: "把你的目标、遇到的问题、期望效果说清楚，节省来回沟通时间。" },
  { title: "带上截图 / 报错信息", description: "有图有真相，我们能更快定位问题。" },
  { title: "时间越准越好", description: "告诉我们的时间要求，便于安排优先级。" }
];

const selectedService = computed(() => services.value.find((service) => service.slug === serviceSlug.value));
const serviceChoices = computed(() => {
  if (!services.value.length) return fallbackServices;
  const base = services.value.map((service) => ({ label: service.tag, value: service.slug }));
  return base.some((item) => item.value === "not-sure") ? base : [...base, { label: "不知道怎么分", value: "not-sure" }];
});
const contactInputType = computed(() => (contactMethod.value === "email" ? "email" : "text"));
const contactPlaceholder = computed(() => ({ wechat: "请输入你的微信号", qq: "请输入你的 QQ 号", email: "请输入你的邮箱" })[contactMethod.value]);
const contactPayload = computed(() => `${contactMethods.find((item) => item.value === contactMethod.value)?.label ?? "联系方式"}：${contactValue.value.trim()}`);
const canSubmit = computed(() => Boolean(originalDemand.value.trim() && urgency.value && budget.value && contactValue.value.trim()));

onMounted(async () => {
  await auth.restore();
  if (auth.user?.email && !contactValue.value) {
    contactMethod.value = "email";
    contactValue.value = auth.user.email;
  }
});

watch(
  () => route.query.topic,
  (topic) => {
    if (typeof topic === "string" && !originalDemand.value.trim()) originalDemand.value = `我想咨询：${topic}`;
  }
);

function useExample(text: string) {
  originalDemand.value = text;
}

function onFilesChange(event: Event) {
  selectedFiles.value = Array.from((event.target as HTMLInputElement).files ?? []);
}

function removeFile(name: string, size: number) {
  selectedFiles.value = selectedFiles.value.filter((file) => file.name !== name || file.size !== size);
}

async function polish() {
  polishing.value = true;
  try {
    const response = await api.polishDemand({ demand: originalDemand.value, serviceSlug: serviceSlug.value });
    demand.value = response.polishedDemand;
    hints.value = response.hints;
    intent.value = response.intent;
  } finally {
    polishing.value = false;
  }
}

async function submit() {
  submitting.value = true;
  try {
    await auth.restore();
    const response = await api.createOrder({
      serviceSlug: serviceSlug.value,
      originalDemand: originalDemand.value,
      demand: [demand.value || originalDemand.value, `远程协助：${remoteSupport.value}`].join("\n"),
      category: selectedService.value?.tag ?? "先聊聊",
      urgency: urgency.value,
      budget: budget.value,
      contact: contactPayload.value,
      intent: intent.value
    }, auth.token);
    result.value = { orderNumber: response.order.orderNumber, nextAction: response.order.nextAction };
    if (auth.token && selectedFiles.value.length) await uploadAttachments(auth.token, response.order.orderNumber);
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
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return "";
  const digest = await subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

useKuliSeo({
  title: "写张小纸条 | 酷里 Kuly",
  description: "用一张小纸条告诉酷里你的 AI 工具、文档处理、小工具开发或部署配置需求，先判断能不能做。",
  path: "/note"
});
</script>
