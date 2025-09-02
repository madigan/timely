<template>
  <div class="p-8 print:p-0 not-print:max-w-7xl print:w-screen h-full mx-auto">
    <!-- Header Skeleton -->
    <div class="mb-8 print:hidden">
      <div class="skeleton w-48 h-8 mb-4"></div>
      <div class="skeleton w-80 h-4 mb-6"></div>

      <!-- Date Range Controls Skeleton -->
      <div class="bg-base-100 rounded-lg p-4 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex items-center gap-2">
            <div class="skeleton w-10 h-4"></div>
            <div class="skeleton w-32 h-8"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="skeleton w-6 h-4"></div>
            <div class="skeleton w-32 h-8"></div>
          </div>
          <div class="skeleton w-32 h-8"></div>
        </div>
      </div>
    </div>

    <!-- Month Containers Skeleton -->
    <div class="space-y-4 print:space-y-0">
      <div 
        v-for="n in 3" 
        :key="n"
        class="bg-base-100 rounded-lg p-4 shadow-sm print:shadow-none print:border-0 print:p-3"
      >
        <!-- Month Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="skeleton w-40 h-6"></div>
        </div>

        <!-- Top Section: Important Events + Monthly Stats -->
        <div class="flex flex-col lg:flex-row gap-4 mb-4 print:hidden lg:items-stretch">
          <!-- Important Events Section Skeleton -->
          <div class="flex-1">
            <ImportantEventsSkeleton />
          </div>

          <!-- Monthly Stats Section Skeleton -->
          <div class="flex-1">
            <MonthlyStatsSkeleton />
          </div>
        </div>

        <!-- Calendar Month Skeleton -->
        <CalendarMonthSkeleton />
      </div>
    </div>

    <!-- Legend Skeleton -->
    <div class="mt-8 bg-base-100 rounded-lg p-6 shadow-sm print:hidden">
      <div class="skeleton w-32 h-6 mb-4"></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          v-for="n in 8" 
          :key="n"
          class="flex items-center space-x-2"
        >
          <div class="skeleton w-4 h-4 rounded-full"></div>
          <div class="skeleton w-20 h-4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImportantEventsSkeleton from "./ImportantEventsSkeleton.vue"
import MonthlyStatsSkeleton from "./MonthlyStatsSkeleton.vue"
import CalendarMonthSkeleton from "./CalendarMonthSkeleton.vue"
</script>