<template>
  <section class="section form-shell auth-page auth-page-centered">
    <form class="form auth-form" @submit.prevent="submit">
      <div v-if="mode !== 'reset'" class="segmented">
        <button class="button secondary" :class="{ active: mode === 'login' }" type="button" @click="switchMode('login')">登录</button>
        <button class="button secondary" :class="{ active: mode === 'register' }" type="button" @click="switchMode('register')">注册</button>
      </div>

      <template v-if="mode === 'login'">
        <label>邮箱<input v-model="email" autocomplete="email" /></label>
        <label v-if="verificationCode">邮箱验证码<input v-model="verificationCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 位数字，60 秒内有效" /></label>
        <div class="field">
          <label for="login-password">密码</label>
          <span class="password-field">
            <input id="login-password" v-model="password" :type="passwordInputType" autocomplete="current-password" />
            <button
              class="password-toggle"
              type="button"
              aria-controls="login-password"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              :aria-pressed="showPassword"
              @click.stop.prevent="togglePasswordVisibility"
              @pointerdown.prevent
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
        </div>
        <button class="button" type="submit">登录</button>
        <button class="link-button" type="button" @click="switchMode('reset')">忘记密码？</button>
      </template>

      <template v-else-if="mode === 'register'">
        <label>邮箱
          <span class="inline-field">
            <input v-model="email" autocomplete="email" />
            <button class="button secondary inline-button" type="button" :disabled="codeCooldown > 0 || sendingCode" @click="sendRegisterCode">
              {{ codeCooldown > 0 ? `${codeCooldown}s` : sendingCode ? "发送中" : "发送验证码" }}
            </button>
          </span>
        </label>
        <label>邮箱验证码<input v-model="verificationCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 位数字，60 秒内有效" /></label>
        <label>展示名<input v-model="displayName" autocomplete="name" /></label>
        <div class="field">
          <label for="register-password">密码</label>
          <span class="password-field">
            <input id="register-password" v-model="password" :type="passwordInputType" autocomplete="new-password" />
            <button
              class="password-toggle"
              type="button"
              aria-controls="register-password"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              :aria-pressed="showPassword"
              @click.stop.prevent="togglePasswordVisibility"
              @pointerdown.prevent
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
        </div>
        <div class="field">
          <label for="register-password-confirm">确认密码</label>
          <span class="password-field">
            <input id="register-password-confirm" v-model="passwordConfirm" :type="passwordConfirmInputType" autocomplete="new-password" />
            <button
              class="password-toggle"
              type="button"
              aria-controls="register-password-confirm"
              :aria-label="showPasswordConfirm ? '隐藏确认密码' : '显示确认密码'"
              :aria-pressed="showPasswordConfirm"
              @click.stop.prevent="togglePasswordConfirmVisibility"
              @pointerdown.prevent
            >
              <svg v-if="showPasswordConfirm" aria-hidden="true" viewBox="0 0 24 24">
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
        </div>
        <ul class="password-rules" aria-label="密码规则">
          <li>至少 8 位</li>
          <li>必须同时包含字母和数字</li>
        </ul>
        <label>邀请码<input v-model="referralCode" placeholder="可选" /></label>
        <button class="button" type="submit">注册并进入</button>
        <button class="link-button" type="button" @click="switchMode('login')">已有账号？去登录</button>
      </template>

      <template v-else>
        <p class="plain-label">重置密码</p>
        <label>注册邮箱
          <span class="inline-field">
            <input v-model="resetEmail" autocomplete="email" placeholder="输入注册邮箱" />
            <button class="button secondary inline-button" type="button" :disabled="codeCooldown > 0 || sendingCode" @click="sendResetCode">
              {{ codeCooldown > 0 ? `${codeCooldown}s` : sendingCode ? "发送中" : "发送验证码" }}
            </button>
          </span>
        </label>
        <label>邮箱验证码<input v-model="resetVerificationCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 位数字，60 秒内有效" /></label>
        <div class="field">
          <label for="reset-password">新密码</label>
          <span class="password-field">
            <input id="reset-password" v-model="resetPassword" :type="resetPasswordInputType" autocomplete="new-password" />
            <button
              class="password-toggle"
              type="button"
              aria-controls="reset-password"
              :aria-label="showResetPassword ? '隐藏新密码' : '显示新密码'"
              :aria-pressed="showResetPassword"
              @click.stop.prevent="toggleResetPasswordVisibility"
              @pointerdown.prevent
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
        </div>
        <div class="field">
          <label for="reset-password-confirm">确认新密码</label>
          <span class="password-field">
            <input id="reset-password-confirm" v-model="resetPasswordConfirm" :type="resetPasswordConfirmInputType" autocomplete="new-password" />
            <button
              class="password-toggle"
              type="button"
              aria-controls="reset-password-confirm"
              :aria-label="showResetPasswordConfirm ? '隐藏确认密码' : '显示确认密码'"
              :aria-pressed="showResetPasswordConfirm"
              @click.stop.prevent="toggleResetPasswordConfirmVisibility"
              @pointerdown.prevent
            >
              <svg v-if="showResetPasswordConfirm" aria-hidden="true" viewBox="0 0 24 24">
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
        </div>
        <ul class="password-rules" aria-label="密码规则">
          <li>至少 8 位</li>
          <li>必须同时包含字母和数字</li>
        </ul>
        <button class="button" type="submit">确认重置密码</button>
        <button class="link-button" type="button" @click="switchMode('login')">返回登录</button>
      </template>

      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="notice" class="form-success">{{ notice }}</p>
      <small v-if="mode !== 'reset'">登录或注册后可以继续写小纸条、查看订单进度和接收站内通知。</small>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ApiError } from "~/composables/useApi";

const PASSWORD_RULE_HINT = "密码至少需要 8 位，且必须同时包含字母和数字";

const auth = useAuthStore();
const api = useApi();
const route = useRoute();
const router = useRouter();
const mode = ref<"login" | "register" | "reset">("login");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const showResetPassword = ref(false);
const showResetPasswordConfirm = ref(false);
const displayName = ref("");
const referralCode = ref(String(route.query.referralCode ?? ""));
const verificationCode = ref("");
const error = ref("");
const notice = ref("");
const sendingCode = ref(false);
const codeCooldown = ref(0);
const resetEmail = ref("");
const resetPassword = ref("");
const resetPasswordConfirm = ref("");
const resetVerificationCode = ref("");
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const passwordInputType = computed(() => (showPassword.value ? "text" : "password"));
const passwordConfirmInputType = computed(() => (showPasswordConfirm.value ? "text" : "password"));
const resetPasswordInputType = computed(() => (showResetPassword.value ? "text" : "password"));
const resetPasswordConfirmInputType = computed(() => (showResetPasswordConfirm.value ? "text" : "password"));
const redirectPath = computed(() => {
  const raw = String(route.query.redirect ?? "/");
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
});

onMounted(async () => {
  await auth.restore();
  if (route.query.verifyEmail && route.query.verifyCode) {
    email.value = String(route.query.verifyEmail);
    verificationCode.value = String(route.query.verifyCode);
    await confirmVerification(email.value, verificationCode.value);
    mode.value = "login";
  }
  if (route.query.resetEmail && route.query.resetCode) {
    mode.value = "reset";
    resetEmail.value = String(route.query.resetEmail);
    resetVerificationCode.value = String(route.query.resetCode);
    email.value = resetEmail.value;
  }
  if (auth.user) await router.replace(redirectPath.value);
});

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

useKuliSeo({
  title: "登录或注册 | 酷里 Kuly",
  description: "使用邮箱和密码登录酷里，登录后可以写小纸条、查看自己的订单进度、接收通知并继续和小酷沟通。",
  path: "/login"
});

function switchMode(next: "login" | "register" | "reset") {
  mode.value = next;
  error.value = "";
  notice.value = "";
}

function startCooldown(seconds = 60) {
  codeCooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    if (codeCooldown.value <= 1) {
      codeCooldown.value = 0;
      if (cooldownTimer) clearInterval(cooldownTimer);
      cooldownTimer = null;
      return;
    }
    codeCooldown.value -= 1;
  }, 1000);
}

function validatePasswordRules(value: string) {
  if (value.length < 8) return PASSWORD_RULE_HINT;
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return PASSWORD_RULE_HINT;
  return "";
}

async function submit() {
  error.value = "";
  notice.value = "";
  try {
    if (mode.value === "login") {
      await auth.login(email.value, password.value);
      await navigateAfterAuth();
      return;
    }
    if (mode.value === "register") {
      if (!verificationCode.value.trim()) {
        error.value = "请先获取并填写邮箱验证码";
        return;
      }
      const passwordError = validatePasswordRules(password.value);
      if (passwordError) {
        error.value = passwordError;
        return;
      }
      if (password.value !== passwordConfirm.value) {
        error.value = "两次输入的密码不一致，请重新确认";
        return;
      }
      await auth.register({
        email: email.value,
        password: password.value,
        displayName: displayName.value || email.value.split("@")[0] || "酷里用户",
        referralCode: referralCode.value || undefined,
        verificationCode: verificationCode.value.trim()
      });
      await navigateAfterAuth();
      return;
    }
    const passwordError = validatePasswordRules(resetPassword.value);
    if (passwordError) {
      error.value = passwordError;
      return;
    }
    if (resetPassword.value !== resetPasswordConfirm.value) {
      error.value = "两次输入的新密码不一致，请重新确认";
      return;
    }
    if (!resetVerificationCode.value.trim()) {
      error.value = "请先获取并填写邮箱验证码";
      return;
    }
    const result = await api.confirmPasswordReset({
      email: resetEmail.value || email.value,
      verificationCode: resetVerificationCode.value.trim(),
      password: resetPassword.value
    });
    notice.value = result.message;
    resetPassword.value = "";
    resetPasswordConfirm.value = "";
    resetVerificationCode.value = "";
    mode.value = "login";
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "提交失败，请稍后再试";
  }
}

async function sendRegisterCode() {
  error.value = "";
  notice.value = "";
  if (!email.value.trim()) {
    error.value = "请先填写邮箱";
    return;
  }
  sendingCode.value = true;
  try {
    const result = await api.sendRegisterCode(email.value.trim());
    notice.value = result.message;
    startCooldown();
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "验证码发送失败，请稍后再试";
  } finally {
    sendingCode.value = false;
  }
}

async function sendResetCode() {
  error.value = "";
  notice.value = "";
  const targetEmail = resetEmail.value.trim() || email.value.trim();
  if (!targetEmail) {
    error.value = "请先填写注册邮箱";
    return;
  }
  resetEmail.value = targetEmail;
  sendingCode.value = true;
  try {
    const result = await api.requestPasswordReset(targetEmail);
    notice.value = result.message;
    startCooldown();
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "验证码发送失败，请稍后再试";
  } finally {
    sendingCode.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}

function togglePasswordConfirmVisibility() {
  showPasswordConfirm.value = !showPasswordConfirm.value;
}

function toggleResetPasswordVisibility() {
  showResetPassword.value = !showResetPassword.value;
}

function toggleResetPasswordConfirmVisibility() {
  showResetPasswordConfirm.value = !showResetPasswordConfirm.value;
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

async function confirmVerification(targetEmail: string, code: string) {
  error.value = "";
  try {
    const result = await api.confirmEmailVerification({ email: targetEmail, verificationCode: code });
    notice.value = result.message;
  } catch (caught) {
    error.value = caught instanceof ApiError ? caught.message : "邮箱验证失败，请重新发送验证邮件";
  }
}
</script>
