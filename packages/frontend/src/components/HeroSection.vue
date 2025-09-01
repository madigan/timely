<template>
  <div class="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
    <div class="max-w-4xl mx-auto px-8 text-center">
      <div class="mb-8">
        <h1 class="text-5xl md:text-7xl font-bold text-base-content mb-6">
          ⏰ Timely
        </h1>
        <p class="text-xl md:text-2xl text-base-content/80 mb-8 max-w-2xl mx-auto">
          Streamline your church's calendar management with intelligent event categorization and seamless scheduling.
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <button class="btn btn-primary btn-lg" @click="$emit('login')">
          Get Started
        </button>
        <button class="btn btn-outline btn-lg" @click="scrollToFeatures">
          Learn More
        </button>
      </div>
      
      <div class="mockup-window border bg-base-300 max-w-3xl mx-auto">
        <div class="flex justify-center px-4 py-16 bg-base-200">
          <div class="grid grid-cols-7 gap-2 w-full max-w-md">
            <div v-for="day in 35" :key="day" class="aspect-square bg-base-100 rounded flex flex-col items-center justify-center text-xs">
              <span class="font-medium">{{ Math.ceil(day / 7) > 2 ? day - 14 : '' }}</span>
              <div v-if="Math.ceil(day / 7) > 2" class="flex gap-1 mt-1">
                <div class="w-1 h-1 bg-primary rounded-full"></div>
                <div class="w-1 h-1 bg-secondary rounded-full"></div>
                <div class="w-1 h-1 bg-accent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = (e: "login") => void

defineEmits<Emits>()

function scrollToFeatures() {
  const featuresEl = document.getElementById("features")
  if (featuresEl) {
    featuresEl.scrollIntoView({ behavior: "smooth" })
  }
}
</script>