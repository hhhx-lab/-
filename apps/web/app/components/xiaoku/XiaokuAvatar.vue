<template>
  <aside
    v-if="visible"
    class="xiaoku"
    :class="[motionState, { open, sleep, reduced, muted }]"
    :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @mousemove="wake"
  >
    <button v-if="bubble && !open" class="xiaoku-bubble" type="button" @click="openPanel">
      {{ bubble }}
    </button>

    <button class="xiaoku-face xiaoku-3d" type="button" @click="togglePanel" aria-label="打开小酷">
      <canvas ref="canvasRef" class="xiaoku-canvas" width="180" height="180" aria-hidden="true" />
      <span class="xiaoku-fallback" aria-hidden="true">K</span>
      <span class="xiaoku-status">{{ stateLabel }}</span>
    </button>

    <section v-if="open" class="xiaoku-panel">
      <XProvider>
        <div class="section-head compact">
          <div class="xiaoku-title">
            <span class="xiaoku-title-mark" aria-hidden="true">K</span>
            <div>
              <strong>小酷助手</strong>
              <small>在线陪你整理需求</small>
            </div>
          </div>
          <div class="xiaoku-controls">
            <button type="button" title="别跟着我" @click="toggleFollow">{{ followMouse ? "定" : "跟" }}</button>
            <button type="button" title="减少动画" @click="toggleReduced">{{ reduced ? "动" : "静" }}</button>
            <button type="button" title="静音" @click="toggleMuted">{{ muted ? "声" : "默" }}</button>
            <button type="button" title="隐藏本页" @click="hideForPage">×</button>
          </div>
        </div>
        <div class="xiaoku-x-intro">
          <Welcome
            variant="borderless"
            root-class-name="xiaoku-x-welcome"
            :icon="welcomeIcon"
            title="我是小酷"
            :description="welcomeDescription"
          />
        </div>
        <div ref="messagesRef" class="xiaoku-messages xiaoku-x-bubbles" aria-live="polite">
          <BubbleList :items="bubbleItems" :roles="bubbleRoles" :auto-scroll="true" />
        </div>
        <div v-if="draft" class="xiaoku-draft">
          <strong>小纸条草稿</strong>
          <span>{{ draft.summary }}</span>
          <small v-if="draft.missingFields.length">还可以补：{{ draft.missingFields.join("、") }}</small>
        </div>
        <div v-if="citations.length" class="xiaoku-citations" aria-label="小酷引用">
          <span>参考</span>
          <NuxtLink v-for="citation in citations" :key="citation.to" :to="citation.to">{{ citation.title }}</NuxtLink>
        </div>
        <div class="xiaoku-x-prompts">
          <Prompts title="小酷可以帮你" :items="promptItems" :wrap="true" @item-click="handlePromptClick" />
        </div>
        <Sender
          :value="message"
          :loading="assistantBusy"
          :disabled="!sessionId"
          :send-disabled="assistantBusy || !message.trim()"
          placeholder="问问服务、材料或订单状态"
          root-class-name="xiaoku-x-sender"
          :auto-size="{ minRows: 1, maxRows: 3 }"
          @change="handleSenderChange"
          @submit="send"
          @focus="setState('calm')"
        />
      </XProvider>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { h } from "vue";
import { BubbleList, Prompts, Sender, Welcome, XProvider, useXAgent, useXChat } from "ant-design-x-vue";
import type { BubbleListProps } from "ant-design-x-vue";
import type * as Three from "three";

type XiaokuState = "idle" | "curious" | "thinking" | "happy" | "alert" | "sleep" | "hide" | "calm";
type XiaokuChatMessage = { role: "assistant" | "user"; content: string };
type XiaokuPrompt = { key: string; label: string; description?: string; to?: string; message?: string };
type XiaokuAgentRequest = { message?: XiaokuChatMessage; messages?: XiaokuChatMessage[] };
type XiaokuBubbleItem = NonNullable<BubbleListProps["items"]>[number];
type XiaokuBubbleRoles = NonNullable<BubbleListProps["roles"]>;

const api = useApi();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const open = ref(false);
const sleep = ref(false);
const visible = ref(true);
const reduced = ref(false);
const muted = ref(false);
const followMouse = ref(true);
const hovering = ref(false);
const hasPointer = ref(false);
const pending = ref(false);
const message = ref("");
const actions = ref<Array<{ label: string; to: string }>>([{ label: "写小纸条", to: "/note" }]);
const citations = ref<Array<{ title: string; to: string; source?: string | null }>>([]);
const draft = ref<{ serviceSlug: string; summary: string; missingFields: string[] } | null>(null);
const sessionId = ref("");
const visitorId = ref("");
const motionState = ref<XiaokuState>("idle");
const bubble = ref("");
const canvasRef = ref<HTMLCanvasElement | null>(null);
const messagesRef = ref<HTMLElement | null>(null);
const pointer = reactive({ x: 0, y: 0 });
const offset = reactive({ x: 0, y: 0 });
const quickActions = computed(() => pageContext(route.path).actions);
const panelActions = computed(() => {
  const seen = new Set<string>();
  return [...quickActions.value, ...actions.value].filter((action) => {
    const key = `${action.to}::${action.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});
const welcomeIcon = h("span", { class: "xiaoku-welcome-mark", "aria-hidden": "true" }, "K");
const welcomeDescription = computed(() => pageContext(route.path).text);
const promptItems = computed<XiaokuPrompt[]>(() => {
  const routePrompts = panelActions.value.map((action) => ({
    key: `action:${action.to}:${action.label}`,
    label: action.label,
    description: action.to.startsWith("/note") ? "我帮你把需求整理成小纸条" : "带你去对应页面继续处理",
    to: action.to
  }));
  return [
    { key: "ask:service", label: "帮我选服务", description: "描述目标，我判断适合哪类服务", message: "我想做一个需求，但不知道该选哪类服务，你帮我判断一下。" },
    { key: "ask:material", label: "检查材料", description: "看看小纸条还缺哪些信息", message: "请帮我检查一下现在还缺哪些材料或需求信息。" },
    ...routePrompts
  ];
});
const xAgent = useXAgent<XiaokuChatMessage, XiaokuAgentRequest, XiaokuChatMessage>({
  request: async (info, callbacks) => {
    const content = info.message?.content?.trim();
    if (!content || !sessionId.value) {
      callbacks.onError(new Error("小酷会话还没有准备好"));
      return;
    }
    pending.value = true;
    setState("thinking");
    try {
      const response = await api.chat({ sessionId: sessionId.value, message: content }, auth.token);
      actions.value = response.actions;
      citations.value = response.citations ?? [];
      draft.value = response.draft ?? null;
      callbacks.onSuccess([{ role: "assistant", content: response.answer }]);
      setState("happy", 2600);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error("小酷请求失败"));
      setState("alert", 2600);
    } finally {
      pending.value = false;
      void scrollMessages();
    }
  }
})[0]!;
const { onRequest, parsedMessages, setMessages: setXMessages } = useXChat<XiaokuChatMessage, XiaokuChatMessage, XiaokuAgentRequest, XiaokuChatMessage>({
  agent: xAgent.value,
  requestPlaceholder: { role: "assistant", content: "我先帮你整理一下" },
  requestFallback: { role: "assistant", content: "我这边刚才没连上，可以稍后再问一次，或者先写小纸条给管理员。" }
});
const assistantBusy = computed(() => pending.value || xAgent.value.isRequesting());
const bubbleItems = computed<XiaokuBubbleItem[]>(() =>
  parsedMessages.value.map((item) => ({
    key: item.id,
    role: item.message.role,
    content: item.message.content,
    placement: item.message.role === "user" ? "end" as const : "start" as const,
    loading: item.status === "loading",
    typing: item.status === "success" && item.message.role === "assistant" ? { step: 2, interval: 18 } : false
  }))
);
const bubbleRoles: XiaokuBubbleRoles = {
  assistant: {
    avatar: () => h("span", { class: "xiaoku-role-avatar assistant", "aria-hidden": "true" }, "K"),
    variant: "filled",
    shape: "corner",
    header: "小酷"
  },
  user: {
    avatar: () => h("span", { class: "xiaoku-role-avatar user", "aria-hidden": "true" }, "你"),
    variant: "filled",
    shape: "corner",
    header: "你"
  }
};
const stateLabel = computed(() => ({ idle: "online", curious: "scan", thinking: "think", happy: "done", alert: "check", sleep: "sleep", hide: "mini", calm: "calm" })[motionState.value]);

function createClientId() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }
  return `xiaoku-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

let frame = 0;
let ThreeRuntime: typeof import("three") | null = null;
let renderer: Three.WebGLRenderer | null = null;
let scene: Three.Scene | null = null;
let camera: Three.PerspectiveCamera | null = null;
let cat: Three.Group | null = null;
let tail: Three.Mesh | null = null;
let halo: Three.Group | null = null;
let lastAction = 0;
let sleepTimer = 0;
let hintTimer = 0;

onMounted(async () => {
  await auth.restore();
  const storageKey = `kuli-xiaoku-hidden:${location.pathname}`;
  visible.value = localStorage.getItem(storageKey) !== "true";
  reduced.value = localStorage.getItem("kuli-xiaoku-reduced") === "true";
  muted.value = localStorage.getItem("kuli-xiaoku-muted") === "true";
  followMouse.value = localStorage.getItem("kuli-xiaoku-follow") !== "false";
  let storedVisitorId = localStorage.getItem("kuli-visitor");
  if (!storedVisitorId) {
    storedVisitorId = createClientId();
    localStorage.setItem("kuli-visitor", storedVisitorId);
  }
  visitorId.value = storedVisitorId;
  await createSessionForCurrentRoute();
  await initThree();
  showPageHint();
  scheduleSleep();
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("scroll", onUserBusy, { passive: true });
  window.addEventListener("focusin", onFocusIn);
  animate();
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("scroll", onUserBusy);
  window.removeEventListener("focusin", onFocusIn);
  window.clearTimeout(sleepTimer);
  window.clearTimeout(hintTimer);
  window.cancelAnimationFrame(frame);
  renderer?.dispose();
});

watch(
  () => route.fullPath,
  () => {
    bubble.value = "";
    offset.x = 0;
    offset.y = 0;
    hasPointer.value = false;
    void createSessionForCurrentRoute();
    showPageHint();
  }
);

async function createSessionForCurrentRoute() {
  if (!visitorId.value) return;
  const session = await api.createAgentSession({ visitorId: visitorId.value, ...agentContextForRoute() }, auth.token);
  sessionId.value = session.session.id;
  seedGreeting();
}

function agentContextForRoute() {
  const path = route.path || "/";
  const serviceQuery = typeof route.query.service === "string" ? route.query.service : undefined;
  return {
    pagePath: path,
    docSlug: path.startsWith("/help/") ? path.split("/").filter(Boolean).pop() : undefined,
    serviceSlug: path.startsWith("/services/") ? path.split("/").filter(Boolean).pop() : serviceQuery
  };
}

async function initThree() {
  if (!canvasRef.value) return;
  ThreeRuntime = await import("three");
  const THREE = ThreeRuntime;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.2);
  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(180, 180, false);
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);
  const purpleLight = new THREE.PointLight(0x9c5cff, 12, 8);
  purpleLight.position.set(-2.4, 1.4, 2);
  scene.add(purpleLight);
  cat = createCat();
  scene.add(cat);
}

function createCat() {
  const THREE = assertThree();
  const group = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: 0x111117, roughness: 0.58, metalness: 0.22 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f0ea, roughness: 0.48 });
  const purple = new THREE.MeshStandardMaterial({ color: 0x8f4bff, emissive: 0x5f22c8, emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.35 });
  const eye = new THREE.MeshStandardMaterial({ color: 0xb077ff, emissive: 0x8f4bff, emissiveIntensity: 0.8 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 20), black);
  body.scale.set(0.78, 1.08, 0.58);
  body.position.y = -0.35;
  group.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), white);
  chest.scale.set(0.72, 1.1, 0.32);
  chest.position.set(0, -0.25, 0.47);
  group.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 20), black);
  head.position.set(0, 0.62, 0.02);
  group.add(head);

  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 4), black);
    ear.position.set(side * 0.37, 1.08, -0.02);
    ear.rotation.set(0.12, 0, side * 0.46);
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 4), purple);
    inner.position.set(side * 0.36, 1.06, 0.04);
    inner.rotation.copy(ear.rotation);
    group.add(inner);
  }

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), white);
  muzzle.scale.set(1.25, 0.72, 0.45);
  muzzle.position.set(0, 0.48, 0.5);
  group.add(muzzle);

  for (const side of [-1, 1]) {
    const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), eye);
    eyeMesh.scale.set(1.4, 0.72, 0.6);
    eyeMesh.position.set(side * 0.2, 0.68, 0.53);
    group.add(eyeMesh);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 12), white);
    paw.scale.set(1.18, 0.58, 0.88);
    paw.position.set(side * 0.28, -1.06, 0.33);
    group.add(paw);
  }

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.026, 8, 48), purple);
  collar.position.set(0, 0.2, 0.05);
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  const badge = makeBadge();
  badge.position.set(0, 0.03, 0.55);
  group.add(badge);

  tail = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.42, -0.72, -0.12), new THREE.Vector3(0.9, -0.22, -0.1), new THREE.Vector3(0.72, 0.38, 0.06)]), 32, 0.055, 10),
    black
  );
  group.add(tail);

  halo = new THREE.Group();
  for (let i = 0; i < 2; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.92 + i * 0.16, 0.008, 8, 90), purple);
    ring.rotation.set(Math.PI / 2.45, 0.2 + i * 0.18, 0);
    halo.add(ring);
  }
  halo.position.y = 0.04;
  group.add(halo);

  group.scale.setScalar(1.05);
  return group;
}

function makeBadge() {
  const THREE = assertThree();
  const badgeCanvas = document.createElement("canvas");
  badgeCanvas.width = 128;
  badgeCanvas.height = 128;
  const ctx = badgeCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#8f4bff";
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 104, 104);
    ctx.fillStyle = "#f4f0ea";
    ctx.font = "bold 74px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("K", 64, 68);
  }
  const texture = new THREE.CanvasTexture(badgeCanvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), material);
  return badge;
}

function assertThree() {
  if (!ThreeRuntime) throw new Error("Three.js has not loaded yet");
  return ThreeRuntime;
}

function animate(time = 0) {
  const state = reduced.value ? "calm" : motionState.value;
  if (hasPointer.value && followMouse.value && !reduced.value && !open.value && !hovering.value && !isDenseRoute(route.path)) {
    const targetX = Math.max(-72, Math.min(10, pointer.x - window.innerWidth + 132));
    const targetY = Math.max(-92, Math.min(10, pointer.y - window.innerHeight + 132));
    offset.x += (targetX - offset.x) * 0.035;
    offset.y += (targetY - offset.y) * 0.035;
  }
  if (cat && renderer && scene && camera) {
    const t = time / 1000;
    const bob = state === "sleep" || state === "hide" ? -0.04 : Math.sin(t * 2.4) * 0.035;
    const happyJump = state === "happy" ? Math.abs(Math.sin(t * 8)) * 0.18 : 0;
    const alertShake = state === "alert" ? Math.sin(t * 18) * 0.07 : 0;
    cat.position.y = bob + happyJump;
    cat.rotation.y += (((pointer.x / Math.max(window.innerWidth, 1)) - 0.5) * 0.38 + alertShake - cat.rotation.y) * 0.05;
    cat.rotation.x += ((state === "sleep" ? -0.12 : 0.02) - cat.rotation.x) * 0.04;
    if (tail) tail.rotation.z = Math.sin(t * (state === "happy" ? 8 : 2.4)) * 0.18;
    if (halo) halo.rotation.z += state === "thinking" ? 0.045 : 0.01;
    renderer.render(scene, camera);
  }
  maybeFreeMotion();
  frame = window.requestAnimationFrame(animate);
}

function maybeFreeMotion() {
  if (reduced.value || open.value || motionState.value === "sleep" || motionState.value === "hide") return;
  const now = Date.now();
  if (now - lastAction < 14000) return;
  lastAction = now;
  setState(Math.random() > 0.5 ? "curious" : "happy", 3600);
}

function pageContext(path: string) {
  if (path.startsWith("/services/")) {
    return { state: "curious" as XiaokuState, text: "你可以先发一个大概需求，我帮你判断材料够不够。", actions: [{ label: "写小纸条", to: `/note?service=${path.split("/").pop()}` }] };
  }
  if (path === "/services") {
    return { state: "hide" as XiaokuState, text: "不知道选哪类服务的话，可以先问我。", actions: [{ label: "帮我写小纸条", to: "/note" }, { label: "文档说明", to: "/help" }] };
  }
  if (path.startsWith("/note")) {
    return { state: "hide" as XiaokuState, text: "写不完整也没关系，我可以帮你整理。", actions: [{ label: "查看服务", to: "/services" }] };
  }
  if (path.startsWith("/orders")) {
    return { state: "hide" as XiaokuState, text: "我可以解释订单状态和下一步。", actions: [{ label: "我的订单", to: "/orders" }] };
  }
  if (path.startsWith("/notifications")) {
    return { state: "hide" as XiaokuState, text: "我可以帮你解释通知和订单下一步。", actions: [{ label: "我的订单", to: "/orders" }] };
  }
  if (path.startsWith("/legal")) {
    return { state: "hide" as XiaokuState, text: "这里主要是规则说明，我会安静一点。", actions: [{ label: "上传说明", to: "/help?doc=upload-policy" }] };
  }
  if (path.startsWith("/admin")) {
    return { state: "hide" as XiaokuState, text: "后台信息密集，我先缩在角落。", actions: [{ label: "订单管理", to: "/admin" }] };
  }
  return { state: "curious" as XiaokuState, text: "不知道选哪类服务的话，可以先问我。", actions: [{ label: "帮我写小纸条", to: "/note" }, { label: "查看服务", to: "/services" }] };
}

function showPageHint() {
  const context = pageContext(route.path);
  setState(context.state, context.state === "hide" ? 0 : 5200);
  window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(() => {
    if (!open.value && !reduced.value && context.state !== "hide" && window.innerWidth > 760) bubble.value = context.text;
  }, 900);
}

function seedGreeting() {
  const context = pageContext(route.path);
  setXMessages([{ id: createClientId(), status: "local", message: { role: "assistant", content: context.text } }]);
  actions.value = [...context.actions];
  citations.value = [];
  draft.value = null;
  void scrollMessages();
}

function isDenseRoute(path: string) {
  return path === "/services" || path.startsWith("/note") || path.startsWith("/orders") || path.startsWith("/notifications") || path.startsWith("/legal") || path.startsWith("/admin");
}

function setState(state: XiaokuState, resetAfter = 0) {
  motionState.value = state;
  sleep.value = state === "sleep";
  if (resetAfter) {
    window.setTimeout(() => {
      if (!open.value && motionState.value === state) motionState.value = "idle";
    }, resetAfter);
  }
}

function wake() {
  sleep.value = false;
  if (motionState.value === "sleep") motionState.value = "idle";
  scheduleSleep();
}

function scheduleSleep() {
  window.clearTimeout(sleepTimer);
  sleepTimer = window.setTimeout(() => setState("sleep"), 60000);
}

function onPointerMove(event: PointerEvent) {
  wake();
  hasPointer.value = true;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
}

function onUserBusy() {
  bubble.value = "";
  if (!open.value) setState(isDenseRoute(route.path) ? "hide" : "calm", isDenseRoute(route.path) ? 0 : 2600);
}

function onFocusIn(event: FocusEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.matches("input, textarea, select")) setState("calm", 3200);
}

function togglePanel() {
  open.value = !open.value;
  bubble.value = "";
  setState(open.value ? "curious" : "idle", 2400);
}

function openPanel() {
  open.value = true;
  bubble.value = "";
  setState("curious", 2400);
}

function toggleFollow() {
  followMouse.value = !followMouse.value;
  localStorage.setItem("kuli-xiaoku-follow", String(followMouse.value));
}

function toggleReduced() {
  reduced.value = !reduced.value;
  localStorage.setItem("kuli-xiaoku-reduced", String(reduced.value));
}

function toggleMuted() {
  muted.value = !muted.value;
  localStorage.setItem("kuli-xiaoku-muted", String(muted.value));
}

function hideForPage() {
  localStorage.setItem(`kuli-xiaoku-hidden:${location.pathname}`, "true");
  visible.value = false;
}

async function send() {
  const content = message.value.trim();
  if (!content || !sessionId.value || assistantBusy.value) return;
  message.value = "";
  onRequest({ message: { role: "user", content } });
  await scrollMessages();
}

function handleSenderChange(value: string) {
  message.value = value;
}

function handlePromptClick({ data }: { data: { key: string; message?: string; to?: string } }) {
  if (data.message) {
    message.value = data.message;
    void send();
    return;
  }
  if (data.to) void router.push(data.to);
}

async function scrollMessages() {
  await nextTick();
  if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
}
</script>
