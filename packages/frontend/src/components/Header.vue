<script setup lang="ts">
import { ref } from "vue"
import { RouterLink } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const { user, login, logout, isLoggedIn } = useAuthStore()
const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

const getUserInitials = (name?: string) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <header>
    <nav class="navbar bg-base-100 shadow-sm">
      <div class="flex-1">
        <RouterLink to="/" class="btn btn-ghost text-xl">⏰ Timely</RouterLink>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end" v-if="isLoggedIn()">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar"
          >
            <div class="w-10 rounded-full">
              <img 
                v-if="user?.picture && !imageError"
                :alt="user?.name || 'User'" 
                :src="user?.picture" 
                class="rounded-full"
                @error="handleImageError"
              />
              <div 
                v-else
                class="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center"
              >
                <span class="text-sm font-medium">{{ getUserInitials(user?.name) }}</span>
              </div>
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li><RouterLink to="/settings">Settings</RouterLink></li>
            <li><button v-on:click="logout">Logout</button></li>
          </ul>
        </div>
        <button class="btn btn-info" v-on:click="login" v-else>Log In</button>
      </div>
    </nav>
  </header>
</template>
