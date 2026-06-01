<template>
  <section class="section form-shell auth-page auth-page-centered">
    <form class="form auth-form" @submit.prevent="submit">
      <div class="segmented">
        <button class="button secondary" :class="{ active: mode === 'login' }" type="button" @click="mode = 'login'">登录</button>
        <button class="button secondary" :class="{ active: mode === 'register' }" type="button" @click="mode = 'register'">注册</button>
      </div>
      <label v-if="mode === 'register'">展示名<input v-model="displayName" autocomplete="name" /></label>
      <label>邮箱<input v-model="email" autocomplete="email" /></label>
      <label>
        密码
        <span class="password-field">
          <input v-model="password" :type="showPassword ? 'text' : 'password'" :autocomplete="passwordAutocomplete" />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 4.3A9.5 9.5 0 0 1 12 4c5.2 0 8.5 5 9.5 8a11.7 11.7 0 0 1-2 3.5" />
              <path d="M6.3 6.3A12.4 12.4 0 0 0 2.5 12c1 3 4.3 8 9.5 8a9.7 9.7 0 0 0 5.7-1.9" />
            </svg>
            <svg v-else aria-hidden="true" viewBox="0 0 24 24">
              <path d="M2.5 12c1-3 4.3-8 9.5-8s8.5 5 9.5 8c-1 3-4.3 8-9.5 8s-8.5-5-9.5-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </span>
      </label>
      <label v-if="mode === 'register'">邀请码<input v-model="referralCode" placeholder="可选" /></label>
      <button class="button" type="submit">{{ mode === "login" ? "登录" : "注册并进入" }}</button>
      <button v-if="mode === 'login'" class="link-button" type="button" @click="showResetRequest = !showResetRequest">忘记密码？</button>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="notice" class="form-success">{{ notice }}</p>
      <small>登录或注册后可以继续写小纸条、查看订单进度和接收站内通知。</small>

      <div v-if="showResetRequest" class="auth-assist">
        <label>重置邮箱<input v-model="resetEmail" autocomplete="email" placeholder="输入注册邮箱" /></label>
        <button class="button secondary" type="button" @click="requestReset">发送重置邮件</button>
      </div>

      <div v-if="resetToken" class="auth-assist">
        <label>
          新密码
          <span class="password-field">
            <input v-model="resetPassword" :type="showResetPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="至少 8 位，包含字母和数字" />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showResetPassword ? '隐藏新密码' : '显示新密码'"
              :aria-pressed="showResetPassword"
              @click="showResetPassword = !showResetPassword"
            >
              <svg v-if="showResetPassword" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.3A9.5 9.5 0 0 1 12 4c5.2 0 8.5 5 9.5 8a11.7 11.7 0 0 1-2 3.5" />
                <path d="M6.3 6.3A12.4 12.4 0 0 0 2.5 12c1 3 4.3 8 9.5 8a9.7 9.7 0 0 0 5.7-1.9" />
              </svg>
              <svg v-else aria-hidden="true" viewBox="0 0 24 24">
                <path d="M2.5 12c1-3 4.3-8 9.5-8s8.5 5 9.5 8c-1 3-4.3 8-9.5 8s-8.5-5-9.5-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </span>
        </label>
        <button class="button secondary" type="button" @click="confirmReset">确认重置密码</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ApiError } from "~/composables/useApi";

const auth = useAuthStore();
const api = useApi();
const route = useRoute();
const router = useRouter();
const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const showResetPassword = ref(false);
const displayName = ref("");
const referralCode = ref(String(route.query.referralCode ?? ""));
const error = ref("");
const notice = ref("");
const showResetRequest = ref(false);
const resetEmail = ref("");
const resetPassword = ref("");
const resetToken = ref(String(route.query.resetToken ?? ""));
const passwordAutocomplete = computed(() => (mode.value === "register" ? "new-password" : "current-password"));
const redirectPath = computed(() => {
  const raw = String(route.query.redirect ?? "/");
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
});

onMounted(async () => {
  await auth.restore();
  if (route.query.verifyToken) await confirmVerification(String(route.query.verifyToken));
  if (resetToken.value) showResetRequest.value = false;
  if (auth.user) await router.replace(redirectPath.value);
});

useKuliSeo({
  title: "登录或注册 | 酷里 Kuly",
  description: "使用邮箱和密码登录酷里，登录后可以写小纸条、查看自己的订单进度、接收通知并继续和小酷沟通。",
  path: "/login"
});

async function submit() {
  error.value = "";
  try {
    if (mode.value === "login") {
      await auth.login(email.value, password.value);
    } else {
      await auth.register({
        email: email.value,
        password: password.value,
        displayName: displayName.value || email.value.split("@")[0] || "酷里用户",
        referralCode: referralCode.value || undefined
      });
    }
    await navigateAfterAuth();
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "提交失败，请稍后再试";
  }
}

async function navigateAfterAuth() {
  await nextTick();
  if (auth.user) {
    await router.replace(redirectPath.value);
    return;
  }
  const started = Date.now();
  while (Date.now() - started < 3000) {
    await auth.restore();
    if (auth.user) {
      await router.replace(redirectPath.value);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  await router.replace(redirectPath.value);
}

async function confirmVerification(token: string) {
  error.value = "";
  try {
    const result = await api.confirmEmailVerification({ token });
    notice.value = result.message;
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "邮箱验证失败，请重新发送验证邮件";
  }
}

async function requestReset() {
  error.value = "";
  notice.value = "";
  try {
    const result = await api.requestPasswordReset(resetEmail.value || email.value);
    notice.value = result.message;
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "重置邮件发送失败，请稍后再试";
  }
}

async function confirmReset() {
  error.value = "";
  notice.value = "";
  try {
    const result = await api.confirmPasswordReset({ token: resetToken.value, password: resetPassword.value });
    notice.value = result.message;
    resetToken.value = "";
    resetPassword.value = "";
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "密码重置失败，请重新申请";
  }
}
</script>
