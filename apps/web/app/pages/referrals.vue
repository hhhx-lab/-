<template>
  <section class="section referral-page">
    <div class="section-head">
      <div>
        <p class="plain-label">邀请奖励</p>
        <h1>邀请朋友来酷里</h1>
        <p>第一版积分只用于成长展示，不做支付抵扣。邀请注册成功后会记录积分奖励</p>
      </div>
      <NuxtLink class="button secondary" to="/me">回个人主页</NuxtLink>
    </div>

    <div v-if="referral" class="referral-layout">
      <article class="panel referral-card">
        <span class="plain-label">邀请码</span>
        <h2>{{ referral.referralCode }}</h2>
        <p>{{ inviteUrl }}</p>
        <button class="button" type="button" @click="copyInvite">复制邀请链接</button>
        <p v-if="copyNotice" class="copy-toast" role="status" aria-live="polite">{{ copyNotice }}</p>
      </article>
      <article class="panel points-panel">
        <span class="plain-label">积分</span>
        <h2>{{ referral.points }}</h2>
        <p>已奖励邀请：{{ referral.rewardedInvites }} 人</p>
      </article>
      <article class="panel referral-history">
        <h2>奖励记录</h2>
        <div v-if="referral.rewards.length" class="stack">
          <div v-for="item in referral.rewards" :key="item.id" class="row-item">
            <strong>+{{ item.points }}</strong>
            <span>{{ item.referredUser ? `${item.referredUser.displayName} · ${item.referredUser.email}` : "被邀请用户" }}</span>
            <small>{{ rewardReason(item.reason) }} · {{ formatDate(item.createdAt) }}</small>
          </div>
        </div>
        <p v-else>暂时还没有邀请奖励。</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UserReferral } from "~/composables/useApi";

const auth = useAuthStore();
const api = useApi();
const referral = ref<UserReferral | null>(null);
const copyNotice = ref("");
let copyNoticeTimer: ReturnType<typeof setTimeout> | undefined;
const inviteUrl = computed(() => {
  if (!referral.value) return "";
  if (import.meta.server) return referral.value.invitePath;
  return `${location.origin}${referral.value.invitePath}`;
});

onMounted(async () => {
  await auth.restore();
  if (auth.token) referral.value = (await api.getReferral(auth.token)).referral;
});

async function copyInvite() {
  if (!inviteUrl.value) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(inviteUrl.value);
    } else {
      copyTextFallback(inviteUrl.value);
    }
    copyNotice.value = "已复制！快去分享给和你一样酷的朋友吧";
    if (copyNoticeTimer) clearTimeout(copyNoticeTimer);
    copyNoticeTimer = setTimeout(() => {
      copyNotice.value = "";
    }, 3200);
  } catch {
    copyNotice.value = "复制失败，请手动复制上方链接";
  }
}

function copyTextFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN");
}

function rewardReason(value: string) {
  return value === "invited_registration" ? "邀请注册奖励" : value;
}
</script>
