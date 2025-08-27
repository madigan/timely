import { defineStore } from "pinia";
import { ref } from "vue";

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  // Initialize user state from server on app load
  async function initializeAuth() {
    isLoading.value = true;
    try {
      const response = await fetch('/auth/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const profile = await response.json();
        user.value = profile;
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function login() {
    // Redirect to backend OAuth endpoint
    window.location.href = '/auth/google';
  }

  async function logout() {
    isLoading.value = true;
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      user.value = null;
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if server request fails
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  function isLoggedIn() {
    return user.value !== null;
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn,
    initializeAuth,
  };
});
