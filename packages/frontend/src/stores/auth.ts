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
  const authError = ref<string | null>(null);
  const showAuthError = ref(false);
  const hasAttemptedAuth = ref(false); // Track if user has ever tried to authenticate

  // Check if session cookies exist (indicating previous auth attempt)
  function hasSessionCookies(): boolean {
    return document.cookie.includes('session=') || document.cookie.includes('oauth_state=');
  }

  // Initialize user state from server on app load
  async function initializeAuth() {
    isLoading.value = true;
    authError.value = null;
    
    // Check if user has previously attempted to authenticate
    const hadPreviousSession = hasSessionCookies();

    try {
      const response = await fetch('/auth/profile', {
        credentials: 'include'
      });

      if (response.ok) {
        const profile = await response.json();
        user.value = profile;
      } else if (response.status === 401) {
        // 401 is expected for users who haven't logged in yet
        // Only show error if they had a previous session
        const errorData = await response.json().catch(() => ({}));
        
        if (hadPreviousSession) {
          authError.value = errorData.error || 'Your session has expired. Please sign in again.';
          showAuthError.value = true;
        }
        
        user.value = null;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Only show connection errors if user had a previous session
      if (hadPreviousSession) {
        authError.value = 'Unable to connect to server. Please check your connection.';
        showAuthError.value = true;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function login() {
    // Mark that user is attempting to authenticate
    hasAttemptedAuth.value = true;
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
      clearAuthError();

      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if server request fails
      user.value = null;
      clearAuthError();

      // Still redirect to home even if logout request failed
      window.location.href = '/';
    } finally {
      isLoading.value = false;
    }
  }

  function isLoggedIn() {
    return user.value !== null;
  }

  // Clear error state
  function clearAuthError() {
    authError.value = null;
    showAuthError.value = false;
  }

  return {
    user,
    isLoading,
    authError,
    showAuthError,
    login,
    logout,
    isLoggedIn,
    initializeAuth,
    clearAuthError,
  };
});
