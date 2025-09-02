<template>
  <div class="calendar-grid">
    <!-- Month Header Skeleton -->
    <div class="flex items-center justify-between mb-3">
      <div class="skeleton w-40 h-6"></div>
    </div>

    <!-- Days of Week Header -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div 
        v-for="n in 7" 
        :key="n"
        class="text-center text-xs font-medium p-1"
      >
        <div class="skeleton w-6 h-3 mx-auto"></div>
      </div>
    </div>

    <!-- Calendar Days Grid -->
    <div class="grid grid-cols-7 gap-1">
      <div 
        v-for="n in 42" 
        :key="n"
        class="aspect-square border border-base-300 rounded-lg p-1 bg-base-100 hover:bg-base-200/50 transition-colors cursor-pointer relative"
      >
        <!-- Day Number Skeleton -->
        <div class="skeleton w-4 h-3 mb-1"></div>
        
        <!-- Event Indicators Skeleton -->
        <div class="space-y-0.5">
          <div 
            v-for="e in Math.floor(Math.random() * 3)" 
            :key="e"
            class="skeleton w-full h-1 rounded-full"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton
</script>