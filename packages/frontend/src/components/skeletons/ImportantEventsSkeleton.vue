<template>
  <div class="p-3 bg-info/10 border border-info/30 rounded-lg h-full">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="skeleton w-6 h-6 rounded-full"></div>
        <div class="skeleton w-32 h-4"></div>
      </div>
      <div class="skeleton w-8 h-8 rounded"></div>
    </div>
    
    <div class="space-y-1">
      <!-- Skeleton Event Cards -->
      <div 
        v-for="n in 3" 
        :key="n"
        class="bg-base-100 border border-info/20 rounded overflow-hidden"
      >
        <!-- Skeleton Header -->
        <div class="flex items-center justify-between text-xs px-2 py-1">
          <div class="flex items-center gap-2 flex-1">
            <div class="skeleton w-3 h-3"></div>
            <div class="skeleton w-40 h-4"></div>
          </div>
          <div class="skeleton w-20 h-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for skeleton
</script>