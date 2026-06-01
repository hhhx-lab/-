export default defineNuxtConfig({
  compatibilityDate: "2026-05-29",
  srcDir: "app/",
  modules: ["@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000",
      appName: "Kuly",
      enableXiaoku: process.env.NUXT_PUBLIC_ENABLE_XIAOKU !== "false",
      wechatPayQrUrl: process.env.NUXT_PUBLIC_WECHAT_PAY_QR_URL ?? "/pay/wechat-qr.png",
      alipayPayQrUrl: process.env.NUXT_PUBLIC_ALIPAY_PAY_QR_URL ?? "/pay/alipay-qr.png"
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit", "three"]
    }
  }
});
