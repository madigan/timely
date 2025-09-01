<template>
  <!-- Month Analytics Modal -->
  <dialog class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">
        {{ selectedMonth ? `${selectedMonth.name} ${selectedMonth.year} Analytics` : 'Month Analytics' }}
      </h3>
      
      <div v-if="selectedMonth" class="space-y-6">
        <div class="text-sm text-base-content/70 mb-4">
          Category Performance vs Targets
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="categoryData in analytics" 
            :key="categoryData.id"
            class="space-y-2"
          >
            <!-- Category Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: categoryData.color }"
                ></div>
                <span class="font-medium">{{ categoryData.name }}</span>
              </div>
              <div class="text-sm text-base-content/70">
                {{ categoryData.eventCount }} event{{ categoryData.eventCount !== 1 ? 's' : '' }}
              </div>
            </div>
            
            <!-- Progress Bars -->
            <div class="space-y-1">
              <!-- Actual Progress -->
              <div class="flex items-center space-x-3 text-sm">
                <span class="w-16 text-right">Actual:</span>
                <div class="flex-1 bg-base-300 rounded-full h-4 relative">
                  <div
                    class="h-4 rounded-full transition-all duration-300 relative"
                    :style="{ 
                      width: Math.min(categoryData.actualPercentage, 100) + '%',
                      backgroundColor: categoryData.color 
                    }"
                  >
                    <span 
                      class="absolute right-0 top-0 h-full flex items-center pr-2 text-xs font-medium text-white"
                      v-if="categoryData.actualPercentage > 15"
                    >
                      {{ categoryData.actualPercentage.toFixed(1) }}%
                    </span>
                  </div>
                  <span 
                    class="absolute top-0 h-full flex items-center text-xs font-medium"
                    :style="{ left: Math.min(categoryData.actualPercentage, 100) + '%' }"
                    v-if="categoryData.actualPercentage <= 15"
                  >
                    <span class="ml-1 text-base-content">{{ categoryData.actualPercentage.toFixed(1) }}%</span>
                  </span>
                </div>
              </div>
              
              <!-- Target Progress -->
              <div class="flex items-center space-x-3 text-sm">
                <span class="w-16 text-right text-base-content/70">Target:</span>
                <div class="flex-1 bg-base-300 rounded-full h-2 relative">
                  <div
                    class="h-2 rounded-full bg-base-content/30"
                    :style="{ width: categoryData.target + '%' }"
                  ></div>
                  <span 
                    class="absolute top-0 h-full flex items-center text-xs text-base-content/70 ml-1"
                    :style="{ left: categoryData.target + '%' }"
                  >
                    {{ categoryData.target }}%
                  </span>
                </div>
              </div>
              
              <!-- Performance Indicator -->
              <div class="flex justify-end">
                <span 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="{
                    'bg-success text-success-content': categoryData.actualPercentage >= categoryData.target * 0.8,
                    'bg-warning text-warning-content': categoryData.actualPercentage >= categoryData.target * 0.5 && categoryData.actualPercentage < categoryData.target * 0.8,
                    'bg-error text-error-content': categoryData.actualPercentage < categoryData.target * 0.5
                  }"
                >
                  {{ categoryData.actualPercentage >= categoryData.target * 0.8 ? 'On Track' : 
                     categoryData.actualPercentage >= categoryData.target * 0.5 ? 'Below Target' : 'Needs Attention' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-action">
        <button class="btn" @click="$emit('close')">Close</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="$emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { Category } from "@/stores/categories"

interface MonthData {
  name: string
  year: number
  month: number
  events: any[]
}

interface CategoryAnalytics {
  id: string
  name: string
  color: string
  target: number
  actualPercentage: number
  eventCount: number
  hours: number
}

interface Props {
  isOpen: boolean
  selectedMonth: MonthData | null
  analytics: CategoryAnalytics[]
}

defineProps<Props>()

defineEmits<{
  close: []
}>()
</script>