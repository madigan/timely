<template>
  <div class="bg-base-200/50 rounded-lg p-4 border border-base-300 h-full flex flex-col">
    <!-- Loading State -->
    <MonthlyStatsSkeleton v-if="isLoading" />
    
    <!-- Loaded Content -->
    <div v-else class="h-full flex flex-col">
      <h3 class="text-sm font-semibold mb-3 flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Monthly Stats
        </div>
        <div class="flex items-center gap-1">
          <button 
            class="btn btn-ghost btn-xs hover:bg-base-300 print:hidden"
            @click="$emit('open-settings')"
            title="Category Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <div class="relative group">
            <svg 
              class="w-4 h-4 text-base-content/50 hover:text-base-content cursor-help transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <!-- Tooltip -->
            <div class="absolute right-0 top-6 bg-base-300 text-base-content text-xs rounded-lg px-3 py-2 shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              <div class="space-y-1">
                <div class="font-semibold">Performance Indicators:</div>
                <div class="flex items-center space-x-2">
                  <span class="bg-success text-white px-1 py-0.5 rounded w-5 text-center">✓</span>
                  <span>On Track: ≥80% of target</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="bg-warning text-white px-1 py-0.5 rounded w-5 text-center">!</span>
                  <span>Below Target: 50-79% of target</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="bg-error text-white px-1 py-0.5 rounded w-5 text-center">✗</span>
                  <span>Needs Attention: &lt;50% of target</span>
                </div>
              </div>
              <!-- Tooltip arrow -->
              <div class="absolute -top-1 right-2 w-2 h-2 bg-base-300 rotate-45"></div>
            </div>
          </div>
        </div>
      </h3>
      <div v-if="categoryAnalytics.length === 0 && !isLoading" class="flex items-center justify-center h-20 text-sm text-base-content/50">
        No categories configured yet.
      </div>
    
    <div v-else class="space-y-2 flex-1">
      <div 
        v-for="categoryData in categoryAnalytics" 
        :key="categoryData.id"
        class="flex items-center space-x-2 text-xs"
      >
        <!-- Category Label -->
        <div class="flex items-center space-x-1 min-w-fit">
          <div
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: categoryData.color }"
          ></div>
          <span class="font-medium truncate w-20">{{ categoryData.name }}</span>
        </div>
        
        <!-- Progress Bar -->
        <div class="flex-1 relative">
          <!-- Target background -->
          <div class="h-1 bg-base-content/20 rounded-full"></div>
          <!-- Target marker -->
          <div 
            class="absolute -top-0.5 h-2 w-0.5 bg-base-content/80 rounded-full z-10"
            :style="{ left: Math.min(categoryData.target, 100) + '%' }"
            :title="`Target: ${categoryData.target}%`"
          ></div>
          <!-- Actual progress -->
          <div
            class="absolute top-0 h-1 rounded-full transition-all duration-300"
            :style="{ 
              width: Math.min(categoryData.actualPercentage, 100) + '%',
              backgroundColor: categoryData.color 
            }"
            :title="`Actual: ${categoryData.actualPercentage.toFixed(1)}%`"
          ></div>
        </div>
        
        <!-- Performance Stats -->
        <div class="flex items-center space-x-1 min-w-fit">
          <span class="font-medium">{{ Math.round(categoryData.actualPercentage) }}/{{ categoryData.target }}%</span>
          <span 
            class="text-xs px-1 py-0.5 rounded text-white w-5 text-center"
            :class="{
              'bg-success': categoryData.actualPercentage >= categoryData.target * PERFORMANCE_THRESHOLDS.EXCELLENT,
              'bg-warning': categoryData.actualPercentage >= categoryData.target * PERFORMANCE_THRESHOLDS.WARNING && categoryData.actualPercentage < categoryData.target * PERFORMANCE_THRESHOLDS.EXCELLENT,
              'bg-error': categoryData.actualPercentage < categoryData.target * PERFORMANCE_THRESHOLDS.WARNING
            }"
            :title="`${categoryData.eventCount} event${categoryData.eventCount !== 1 ? 's' : ''}`"
          >
            {{ categoryData.actualPercentage >= categoryData.target * PERFORMANCE_THRESHOLDS.EXCELLENT ? '✓' : 
               categoryData.actualPercentage >= categoryData.target * PERFORMANCE_THRESHOLDS.WARNING ? '!' : '✗' }}
          </span>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PERFORMANCE_THRESHOLDS } from "@/constants/display"
import MonthlyStatsSkeleton from "./skeletons/MonthlyStatsSkeleton.vue"

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
  categoryAnalytics: CategoryAnalytics[]
  isLoading?: boolean
}

defineProps<Props>()

defineEmits<{
  "open-settings": []
}>()
</script>