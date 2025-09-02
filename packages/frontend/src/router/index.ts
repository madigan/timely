import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import SplashView from "../views/SplashView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "splash",
      component: SplashView,
    },
    {
      path: "/calendar",
      name: "calendar",
      component: () => import("../views/CalendarView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If route requires auth, ensure auth is initialized first
  if (to.meta.requiresAuth) {
    // Wait for auth initialization if it's still loading
    if (authStore.isLoading) {
      await authStore.initializeAuth()
    }

    if (!authStore.isLoggedIn()) {
      // Redirect to home page if not authenticated
      next("/")
      return
    }
  }

  next()
})

export default router
