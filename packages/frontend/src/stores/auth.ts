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

  async function login() {
    user.value = {
      id: "123",
      email: "something@something.com",
      name: "Tim",
      picture:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
      accessToken: "456",
    };
  }

  async function logout() {
    user.value = null;
  }

  function isLoggedIn() {
    return user.value !== null;
  }

  return {
    user,
    login,
    logout,
    isLoggedIn,
  };
});
