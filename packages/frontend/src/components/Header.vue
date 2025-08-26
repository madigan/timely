<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const { user, login, logout, isLoggedIn } = useAuthStore();
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
            class="btn btn-ghost btn-circle avatar avatar-placeholder"
          >
            <div class="w-10 rounded-full bg-neutral-500 text-neutral-content">
              <!-- <img :alt="user?.name" :src="user?.picture" /> -->
              <span class="text-xl">JL</span>
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
