import "./assets/main.css"

import { createPinia } from "pinia"
import { createApp } from "vue"

import App from "./App.vue"
import router from "./router"
import { useAuthStore } from "./stores/auth"
import { useToastStore } from "./stores/toast"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const authStore = useAuthStore()
const toastStore = useToastStore()

// Initialize authentication state
authStore.initializeAuth()

app.mount("#app")
