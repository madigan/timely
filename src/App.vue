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
  
  /* Each month on its own page and fit to page height */
  .calendar-month-container {
    page-break-before: always !important;
    page-break-after: avoid !important;
    height: 90vh !important;
    margin: 0 !important;
    padding: 0.75rem !important;
    display: flex !important;
    flex-direction: column !important;
    break-inside: avoid !important;
  }
  
  /* First month shouldn't have page break before */
  .calendar-month-container:first-child {
    page-break-before: avoid !important;
  }
  
  /* Last month shouldn't force page break after */
  .calendar-month-container:last-child {
    page-break-after: avoid !important;
  }
  
  /* Month header should be compact but readable */
  .calendar-month-container h2 {
    font-size: 1.25rem !important;
    margin-bottom: 1rem !important;
    flex-shrink: 0 !important;
  }
  
  /* Calendar should expand to fill remaining space */
  .calendar-month {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Days of week header */
  .calendar-month > .grid:first-child {
    flex-shrink: 0 !important;
    margin-bottom: 0.5rem !important;
  }
  
  /* Calendar grid container should expand */
  .calendar-month > .space-y-1 {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Each calendar row should take equal height */
  .calendar-row {
    flex: 1 !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  /* Calendar cells should expand to fill row height */
  .calendar-cell {
    height: 100% !important;
    min-height: auto !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Remove aspect-square constraint for print */
  .calendar-month .aspect-square {
    aspect-ratio: auto !important;
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
