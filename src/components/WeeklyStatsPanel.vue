<template>
  <div class="weekly-stats-panel bg-base-200/30 rounded-lg p-2 text-xs border border-base-300 h-full flex flex-col">
    <div class="font-medium text-center mb-1 text-base-content/80 text-xs">
      Week Stats
    </div>
    
    <div v-if="weeklyStats.length === 0" class="text-center text-base-content/50 py-2 flex-1 flex items-center justify-center">
      <span class="text-xs">No events this week</span>
    </div>
    
    <div v-else class="space-y-1 flex-1 overflow-hidden">
      <div 
        v-for="stat in weeklyStats" 
        :key="stat.id"
        class="flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-1.5 min-w-0 flex-1">
          <div 
            class="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            :style="{ backgroundColor: stat.color }"
          ></div>
          <span 
            class="text-xs font-medium truncate" 
            :title="stat.name"
          >
            {{ stat.name }}
          </span>
        </div>
        
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="text-xs font-mono text-base-content/70">
            {{ stat.hours.toFixed(1) }}h
          </div>
          <div class="text-xs font-semibold text-primary min-w-[2rem] text-right">
            {{ stat.percentage }}%
          </div>
        </div>
      </div>
      
      <!-- Total hours at bottom -->
      <div class="border-t border-base-300 pt-1 mt-1 flex-shrink-0">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-base-content/60">Total</span>
          <span class="text-xs font-mono font-semibold">{{ totalHours.toFixed(1) }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Category } from "@/stores/categories";

interface Props {
  weekEvents: any[];
  categories: Category[];
}

const props = defineProps<Props>();

const weeklyStats = computed(() => {
  if (props.weekEvents.length === 0) return [];
  
  const categoryStats: { [key: string]: { hours: number; count: number; category: Category } } = {};
  let totalCategorizedHours = 0;
  
  // Initialize category stats
  props.categories.forEach(category => {
    categoryStats[category.id] = {
      hours: 0,
      count: 0,
      category
    };
  });
  
  // Calculate hours for each event
  props.weekEvents.forEach(event => {
    const startTime = new Date(event.start.dateTime || event.start.date);
    const endTime = new Date(event.end.dateTime || event.end.date);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Categorize event based on keywords
    const matchedCategory = categorizeEvent(event);
    if (matchedCategory) {
      categoryStats[matchedCategory.id].hours += hours;
      categoryStats[matchedCategory.id].count += 1;
      totalCategorizedHours += hours;
    }
  });
  
  // Convert to array and filter out categories with no events
  const activeCategories = props.categories
    .map(category => {
      const stats = categoryStats[category.id];
      const percentage = totalCategorizedHours > 0 ? Math.round((stats.hours / totalCategorizedHours) * 100) : 0;
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        hours: stats.hours,
        count: stats.count,
        percentage
      };
    })
    .filter(stat => stat.count > 0)
    .sort((a, b) => b.hours - a.hours);

  // Ensure percentages add up to 100% by adjusting the largest category
  const totalPercentage = activeCategories.reduce((sum, stat) => sum + stat.percentage, 0);
  if (activeCategories.length > 0 && totalPercentage !== 100) {
    const adjustment = 100 - totalPercentage;
    activeCategories[0].percentage += adjustment;
  }

  return activeCategories;
});

const totalHours = computed(() => {
  return weeklyStats.value.reduce((sum, stat) => sum + stat.hours, 0);
});

function categorizeEvent(event: any): Category | null {
  const eventText = (
    (event.summary || '') + ' ' + 
    (event.description || '')
  ).toLowerCase();
  
  // Find the first category whose keywords match the event
  for (const category of props.categories) {
    if (category.keywords.some(keyword => 
      eventText.includes(keyword.toLowerCase())
    )) {
      return category;
    }
  }
  
  return null;
}
</script>