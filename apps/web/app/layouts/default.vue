<template>
  <div>
    <header class="topbar">
      <div class="shell nav">
        <NuxtLink class="brand" to="/" aria-label="酷里小窗口首页">
          <span class="mark logo-mark" aria-hidden="true"><img src="/kuly-logo.png" alt=""></span>
          <span class="brand-name"><strong>酷里 Kuly</strong><span>酷里小窗口</span></span>
        </NuxtLink>
        <nav class="navlinks" aria-label="主导航">
          <NuxtLink to="/services">热门需求</NuxtLink>
          <NuxtLink to="/services/document-processing">文档处理</NuxtLink>
          <NuxtLink to="/services/ai-tools">AI 工具</NuxtLink>
          <NuxtLink to="/services/tool-development">小工具开发</NuxtLink>
          <NuxtLink to="/services/deployment-config">部署配置</NuxtLink>
          <NuxtLink to="/orders">我的订单</NuxtLink>
          <NuxtLink v-if="auth.user?.role === 'admin'" to="/admin">管理后台</NuxtLink>
        </nav>
        <div class="nav-actions">
          <NuxtLink v-if="!auth.user" class="button secondary" to="/login">登录 / 注册</NuxtLink>
          <details v-else class="account-menu">
            <summary>
              <span>{{ auth.user.email }}</span>
              <strong>{{ auth.user.role === "admin" ? "管理员" : "账号" }}</strong>
              <i v-if="unreadCount" class="notification-badge" aria-label="未读通知">{{ unreadCount }}</i>
            </summary>
            <div class="account-popover">
              <NuxtLink to="/me">我的酷里</NuxtLink>
              <NuxtLink to="/orders">我的订单</NuxtLink>
              <NuxtLink to="/notifications">通知中心<span v-if="unreadCount">{{ unreadCount }}</span></NuxtLink>
              <NuxtLink to="/settings">设置</NuxtLink>
              <NuxtLink to="/referrals">积分与邀请</NuxtLink>
              <NuxtLink v-if="auth.user.role === 'admin'" to="/admin">管理后台</NuxtLink>
              <button class="button secondary" type="button" @click="logout">退出登录</button>
            </div>
          </details>
          <NuxtLink class="button" to="/note"><span aria-hidden="true">✎</span>写张小纸条</NuxtLink>
        </div>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="site-footer">
      <div class="shell">
        <span>酷里 Kuly</span>
        <nav aria-label="法律与服务说明">
          <NuxtLink to="/services">热门需求</NuxtLink>
          <NuxtLink to="/help?doc=privacy">隐私政策</NuxtLink>
          <NuxtLink to="/help?doc=terms">服务条款</NuxtLink>
          <NuxtLink to="/help?doc=upload-policy">上传说明</NuxtLink>
          <NuxtLink to="/help?doc=contact">联系我们</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const router = useRouter();
const api = useApi();
const unreadCount = ref(0);

onMounted(async () => {
  await auth.restore();
  await refreshUnreadCount();
});

watch(
  () => auth.token,
  async () => {
    await refreshUnreadCount();
  }
);

async function refreshUnreadCount() {
  if (!auth.token) {
    unreadCount.value = 0;
    return;
  }
  try {
    unreadCount.value = (await api.getUnreadNotificationCount(auth.token)).unreadCount;
  } catch {
    unreadCount.value = 0;
  }
}

async function logout() {
  auth.logout();
  unreadCount.value = 0;
  await router.push("/");
}
</script>
