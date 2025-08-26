<template>
  <div class="min-h-screen">
    <!-- Logged out state - Hero and Features -->
    <div v-if="!isLoggedIn()">
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
import { useAuthStore } from "@/stores/auth";
import HeroSection from "@/components/HeroSection.vue";
import FeaturesSection from "@/components/FeaturesSection.vue";
import CalendarGrid from "@/components/CalendarGrid.vue";

const { login, isLoggedIn } = useAuthStore();
</script>
