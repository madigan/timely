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
  body {
    margin: 0;
    padding: 0;
  }
  
  .min-h-screen {
    min-height: auto !important;
  }
  
  /* Force colors and backgrounds to print */
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Prevent page breaks inside calendar elements */
  .calendar-month-container {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  .calendar-row {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  .calendar-cell {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}
</style>
