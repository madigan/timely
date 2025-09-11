<template>
  <div id="features" class="py-20 bg-base-200">
    <div class="max-w-6xl mx-auto px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-base-content mb-4">
          Perfect for Church Communities
        </h2>
        <p class="text-xl text-base-content/70 max-w-2xl mx-auto">
          Designed specifically for pastors and church administrators who need efficient calendar management.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📅</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Smart Calendar Integration</h3>
          <p class="text-base-content/70">
            Connect multiple calendars and manage them all in one unified view.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🏷️</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Automatic Categorization</h3>
          <p class="text-base-content/70">
            Automatically categorize events based on keywords.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📊</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Visual Insights</h3>
          <p class="text-base-content/70">
            See at a glance where your time is going—and if any category is being neglected.
          </p>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button class="btn btn-primary btn-lg" @click="$emit('getStarted')">
          Start Managing Your Calendar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = (e: "getStarted") => void

defineEmits<Emits>()
</script>