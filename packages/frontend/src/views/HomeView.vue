<template>
  <div class="min-h-screen">

    <!-- Loading state -->
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="loading loading-spinner loading-lg text-primary"></div>
        <p class="mt-4 text-base-content/70">Loading...</p>
      </div>
    </div>
    
    <!-- Logged out state - Hero and Features -->
    <div v-else-if="!isLoggedIn()">
      <HeroSection @login="login" />
      <FeaturesSection @getStarted="login" />
    </div>
    
    <!-- Logged in state - Calendar Grid -->
    <div v-else>
      <CalendarGrid />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import CalendarGrid from "@/components/CalendarGrid.vue"
import FeaturesSection from "@/components/FeaturesSection.vue"
import HeroSection from "@/components/HeroSection.vue"
import { useAuthStore } from "@/stores/auth"
import { useToastStore } from "@/stores/toast"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const { login, isLoggedIn, initializeAuth } = authStore

// Watch for authentication errors and show toast
watch(
  () => authStore.authError,
  (newError) => {
    if (newError && authStore.showAuthError) {
      toastStore.showToast(newError, "error")
      authStore.showAuthError = false
    }
  }
)

const errorMessages: Record<string, string> = {
  access_denied: "You denied access to Google Calendar. Please try again.",
  missing_parameters: "OAuth callback is missing required parameters.",
  invalid_state: "Invalid OAuth state. This might be a security issue.",
  expired_state: "OAuth state has expired. Please try logging in again.",
  no_access_token: "Failed to obtain access token from Google.",
  oauth_failed: "OAuth authentication failed. Please try again.",
}

onMounted(async () => {
  await initializeAuth()

  // Handle OAuth errors from URL params
  const error = route.query.error as string
  if (error) {
    const message = errorMessages[error] || "An unknown error occurred during authentication."
    toastStore.showToast(message, "error")

    // Clear error from URL
    router.replace({ query: {} })
  }
})
</script>
