<template>
  <div class="bg-base-200/50 rounded-lg p-4 border border-base-300 h-full flex flex-col">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="skeleton w-4 h-4"></div>
        <div class="skeleton w-24 h-4"></div>
      </div>
      <div class="flex items-center gap-1">
        <div class="skeleton w-6 h-6 rounded"></div>
        <div class="skeleton w-4 h-4 rounded-full"></div>
      </div>
    </div>
    
    <div class="space-y-2 flex-1">
      <!-- Skeleton Category Rows -->
      <div 
        v-for="n in 5" 
        :key="n"
        class="flex items-center space-x-2 text-xs"
      >
        <!-- Category Label -->
        <div class="flex items-center space-x-1 min-w-fit">
          <div class="skeleton w-2 h-2 rounded-full"></div>
          <div class="skeleton w-20 h-3"></div>
        </div>
        
        <!-- Progress Bar -->
        <div class="flex-1 relative">
          <div class="skeleton w-full h-1 rounded-full"></div>
        </div>
        
        <!-- Performance Stats -->
        <div class="flex items-center space-x-1 min-w-fit">
          <div class="skeleton w-12 h-3"></div>
          <div class="skeleton w-5 h-5 rounded"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton
</script>