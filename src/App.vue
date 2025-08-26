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
    height: 100vh !important;
    max-height: 100vh !important;
    margin: 0 !important;
    padding: 0.25rem !important;
    display: grid !important;
    grid-template-rows: auto 1fr !important;
    break-inside: avoid !important;
    transform: scale(0.82) !important;
    transform-origin: top left !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
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
    font-size: 0.9rem !important;
    margin: 0 !important;
    padding: 0.125rem 0 !important;
    line-height: 1.2 !important;
    grid-row: 1 !important;
  }
  
  /* Calendar should expand to fill remaining space */
  .calendar-month {
    grid-row: 2 !important;
    display: grid !important;
    grid-template-rows: auto 1fr !important;
    gap: 0.125rem !important;
    overflow: hidden !important;
  }
  
  /* Days of week header */
  .calendar-month > .grid:first-child {
    grid-row: 1 !important;
    padding: 0.125rem 0 !important;
    font-size: 0.65rem !important;
    font-weight: 600 !important;
  }
  
  /* Calendar grid container should expand */
  .calendar-month > .space-y-1 {
    grid-row: 2 !important;
    display: grid !important;
    grid-template-rows: repeat(6, 1fr) !important;
    gap: 0.0625rem !important;
    overflow: hidden !important;
  }
  
  /* Each calendar row should take equal height */
  .calendar-row {
    display: grid !important;
    grid-template-columns: repeat(7, 1fr) 1fr !important;
    gap: 0.0625rem !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    overflow: hidden !important;
  }
  
  /* Calendar cells should expand to fill row height */
  .calendar-cell {
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    padding: 0.0625rem !important;
    font-size: 0.6rem !important;
    min-height: 0 !important;
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
  
  /* Weekly stats panel optimization for print */
  .weekly-stats-panel {
    font-size: 0.55rem !important;
    padding: 0.0625rem !important;
    margin: 0 !important;
    height: 100% !important;
    max-height: 100% !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .weekly-stats-panel .space-y-1 > * {
    margin-bottom: 0.0625rem !important;
  }
  
  .weekly-stats-panel .text-xs {
    font-size: 0.5rem !important;
    line-height: 1.1 !important;
  }
  
  /* Weekly stats column in grid */
  .calendar-month .aspect-square:last-child {
    aspect-ratio: auto !important;
    display: flex !important;
    align-items: stretch !important;
  }
  
  /* Ensure 8-column grid fits properly with consistent alignment */
  .grid-cols-8 {
    grid-template-columns: repeat(7, 1fr) 1fr !important;
    display: grid !important;
  }
  
  /* Header row should maintain consistent column widths */
  .calendar-month > .grid:first-child {
    grid-template-columns: repeat(7, 1fr) 1fr !important;
  }
  
  /* Remove spacing overrides - handled by grid */
  .calendar-month .gap-1 {
    gap: 0.0625rem !important;
  }
  
  .calendar-month .space-y-1 > * + * {
    margin-top: 0 !important;
  }
}
</style>
