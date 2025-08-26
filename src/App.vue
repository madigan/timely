<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header class="print:hidden" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer class="print:hidden" />
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
