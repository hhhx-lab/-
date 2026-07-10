export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const publicPaths = new Set(["/", "/login"]);
  const isPublic = publicPaths.has(to.path);

  if (import.meta.server) {
    const tokenCookie = useCookie<string | null>("kuli-v2-token");
    if (tokenCookie.value) await auth.restore();
    if (!isPublic && !auth.user) {
      return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
    }
    if (to.path === "/login" && auth.user) {
      return navigateTo("/");
    }
    return;
  }

  if (!auth.ready) await auth.restore();

  if (!isPublic && !auth.user) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (to.path === "/login" && auth.user) {
    return navigateTo("/");
  }
});
