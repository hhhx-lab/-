<template>
  <section class="section settings-page settings-page-centered">
    <form class="form settings-form" @submit.prevent="save">
      <div>
        <p class="plain-label">账号设置</p>
        <h1>账号设置</h1>
      </div>
      <label>邮箱<input :value="profile?.email ?? ''" disabled /></label>
      <label>展示名<input v-model="displayName" /></label>
      <label>其他联系方式<input v-model="otherContact" placeholder="微信 / QQ / 手机号任选一种" /></label>
      <button class="button" type="submit">保存设置</button>
      <button class="button secondary" type="button" @click="logout">退出登录</button>
      <p v-if="message" class="status-box is-visible">{{ message }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { UserProfile } from "~/composables/useApi";

const auth = useAuthStore();
const api = useApi();
const router = useRouter();
const profile = ref<UserProfile | null>(null);
const displayName = ref("");
const otherContact = ref("");
const message = ref("");

onMounted(async () => {
  await auth.restore();
  if (!auth.token) return;
  profile.value = (await api.getProfile(auth.token)).profile;
  displayName.value = profile.value.displayName;
  otherContact.value = profile.value.otherContact ?? "";
});

async function save() {
  if (!auth.token) return;
  profile.value = (await api.updateProfile(auth.token, { displayName: displayName.value, otherContact: otherContact.value })).profile;
  if (auth.user) auth.user.displayName = profile.value.displayName;
  message.value = "设置已保存";
}

async function logout() {
  auth.logout();
  await router.push("/");
}
</script>
