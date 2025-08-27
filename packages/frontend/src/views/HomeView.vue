<template>
  <div class="min-h-screen">
    <!-- OAuth Error Alert -->
    <div v-if="oauthError" class="alert alert-error fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ oauthError }}</span>
      <button class="btn btn-sm btn-ghost" @click="dismissError">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

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
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HeroSection from "@/components/HeroSection.vue";
import FeaturesSection from "@/components/FeaturesSection.vue";
import CalendarGrid from "@/components/CalendarGrid.vue";

const route = useRoute();
const authStore = useAuthStore();
const { login, isLoggedIn } = authStore;

// Handle OAuth errors from URL params
const oauthError = ref<string | null>(null);

const errorMessages: Record<string, string> = {
  'access_denied': 'You denied access to Google Calendar. Please try again.',
  'missing_parameters': 'OAuth callback is missing required parameters.',
  'invalid_state': 'Invalid OAuth state. This might be a security issue.',
  'expired_state': 'OAuth state has expired. Please try logging in again.',
  'no_access_token': 'Failed to obtain access token from Google.',
  'oauth_failed': 'OAuth authentication failed. Please try again.'
};

onMounted(() => {
  const error = route.query.error as string;
  if (error) {
    oauthError.value = errorMessages[error] || 'An unknown error occurred during authentication.';
  }
});

function dismissError() {
  oauthError.value = null;
}
</script>
