<template>
  <section class="shell app-surface account-dashboard">
    <header class="account-hero">
      <div>
        <p class="plain-label">我的酷里</p>
        <h1 class="page-title">我的酷里</h1>
        <p v-if="summary">当前账号：{{ summary.profile.email }}</p>
      </div>
      <div class="empty-actions">
        <NuxtLink class="button" to="/note">写新的小纸条</NuxtLink>
        <NuxtLink class="button secondary" to="/orders">订单工作台</NuxtLink>
      </div>
    </header>

    <div v-if="summary" class="dashboard-overview">
      <article class="panel profile-panel account-main-card">
        <span class="plain-label">账号</span>
        <div class="account-main-head">
          <div>
            <h2>{{ summary.profile.displayName }}</h2>
            <p>{{ summary.profile.role === "admin" ? "管理员账号" : "普通账号" }}</p>
          </div>
          <div class="account-quick-stats">
            <span><strong>{{ summary.orders.total }}</strong>订单</span>
            <span><strong>{{ unreadCount }}</strong>未读</span>
            <span><strong>{{ summary.points.current }}</strong>积分</span>
          </div>
        </div>
        <dl>
          <div><dt>邮箱</dt><dd>{{ summary.profile.email }}</dd></div>
          <div><dt>其他联系方式</dt><dd>{{ summary.profile.otherContact || "未填写" }}</dd></div>
          <div><dt>注册时间</dt><dd>{{ display.date(summary.profile.createdAt) }}</dd></div>
          <div>
            <dt>邮箱验证</dt>
              <dd>
                {{ summary.profile.emailVerifiedAt ? "已验证" : "待验证" }}
                <button v-if="!summary.profile.emailVerifiedAt" class="button secondary inline-button" type="button" :disabled="verificationBusy" @click="requestVerification">
                  {{ verificationBusy ? "发送中" : "发送验证码" }}
                </button>
              </dd>
          </div>
        </dl>
        <p v-if="verificationMessage" class="form-success">{{ verificationMessage }}</p>
      </article>

      <article class="panel points-panel account-side-card">
        <span class="plain-label">积分</span>
        <h2>{{ summary.points.current }} / {{ summary.points.nextLevel }}</h2>
        <div class="progress-track"><span :style="{ width: `${summary.points.progress}%` }" /></div>
        <p>邀请注册、完善资料、完成订单都可以作为后续积分来源。</p>
        <NuxtLink class="button secondary" to="/referrals">邀请注册</NuxtLink>
      </article>
    </div>

    <section v-if="summary" class="account-section">
      <div class="section-head compact">
        <h2 class="compact-title">最近订单</h2>
        <NuxtLink class="button secondary" to="/orders">全部订单</NuxtLink>
      </div>
      <div class="orders-table">
        <NuxtLink v-for="order in summary.recentOrders" :key="order.orderNumber" class="orders-row" :to="`/orders/${order.orderNumber}`">
          <div>
            <strong>{{ order.title }}</strong>
            <p>{{ order.orderNumber }}</p>
          </div>
          <span class="status-pill" :class="display.orderStatus(order.status).tone">{{ display.orderStatus(order.status).label }}</span>
          <p>{{ order.nextAction }}</p>
          <small>{{ display.dateTime(order.updatedAt) }}</small>
        </NuxtLink>
        <div v-if="summary.recentOrders.length === 0" class="empty-state">
          <strong>还没有订单。</strong>
          <p>先写一张小纸条，酷里会帮你判断下一步。</p>
        </div>
      </div>
    </section>

    <section v-if="recentNotifications.length" class="account-section">
      <div class="section-head compact">
        <h2 class="compact-title">最近通知</h2>
        <NuxtLink class="button secondary" to="/notifications">通知中心</NuxtLink>
      </div>
      <div class="notification-strip">
        <NuxtLink v-for="item in recentNotifications" :key="item.id" :to="item.targetUrl || '/notifications'">
          <span>{{ item.status === "unread" ? "未读" : "已读" }}</span>
          <strong>{{ item.title }}</strong>
          <small>{{ item.body }}</small>
        </NuxtLink>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { NotificationItem, UserSummary } from "~/composables/useApi";
import { useDisplayText } from "~/composables/useDisplayText";

const auth = useAuthStore();
const api = useApi();
const display = useDisplayText();
const summary = ref<UserSummary | null>(null);
const recentNotifications = ref<NotificationItem[]>([]);
const verificationBusy = ref(false);
const verificationMessage = ref("");
const unreadCount = computed(() => recentNotifications.value.filter((item) => item.status === "unread").length);

onMounted(async () => {
  await auth.restore();
  if (auth.token) {
    summary.value = (await api.getMySummary(auth.token)).summary;
    recentNotifications.value = (await api.listNotifications(auth.token)).notifications.slice(0, 3);
  }
});

async function requestVerification() {
  if (!auth.token || !summary.value) return;
  verificationBusy.value = true;
  verificationMessage.value = "";
  try {
    const result = await api.requestEmailVerification(summary.value.profile.email);
    verificationMessage.value = result.message;
  } finally {
    verificationBusy.value = false;
  }
}
</script>
