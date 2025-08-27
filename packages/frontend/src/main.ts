import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import GoogleSignInPlugin from "vue3-google-login"

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

// Initialize authentication state
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
