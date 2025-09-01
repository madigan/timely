<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
import Footer from "./components/Footer.vue"
import Header from "./components/Header.vue"
import { useToastStore } from "./stores/toast"

const toastStore = useToastStore()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header class="print:hidden" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer class="print:hidden" />

    <!-- Global Toast Container -->
    <div class="toast toast-top toast-end z-50">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['alert', `alert-${toast.type}`]"
      >
        <svg v-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <svg v-if="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
        <button class="btn btn-sm btn-ghost" @click="toastStore.removeToast(toast.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  /* Force colors and backgrounds to print */
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Page break rules */
  .calendar-month-container {
    break-before: always;
    break-inside: avoid;
    break-after: auto;
    display: grid !important;
    grid-template-rows: auto 1fr !important;
    height: calc(100vh - 1in) !important;
    max-height: calc(100vh - 1in) !important;
    transform: scale(0.82) !important;
    transform-origin: top left !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    margin: 0.5in 0.5in 0.5in 0.5in !important;
  }

  /* First month should not have page break before */
  .calendar-month-container:first-child {
    page-break-before: auto;
  }

  /* Calendar grid layout */
  .calendar-month > .space-y-1 {
    display: grid !important;
    grid-template-rows: repeat(6, 1fr) !important;
    gap: 0.0625rem !important;
    height: 100% !important;
    overflow: hidden !important;
  }

  /* Calendar rows */
  .calendar-row {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) 1fr !important;
    gap: 0.0625rem !important;
    height: 100% !important;
    min-height: 0 !important;
  }

  /* Calendar cells */
  .calendar-cell {
    min-height: 0 !important;
    overflow: hidden !important;
  }

  /* Weekly stats sizing */
  .weekly-stats-panel {
    height: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
}
</style>
