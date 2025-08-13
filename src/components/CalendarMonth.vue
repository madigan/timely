<template>
  <div class="calendar-month">
    <!-- Days of week header -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in daysOfWeek" :key="day" class="text-center text-sm font-medium text-base-content/70 py-2">
        {{ day }}
      </div>
    </div>
    
    <!-- Calendar cells -->
    <div class="grid grid-cols-7 gap-1">
      <div 
        v-for="cell in calendarCells" 
        :key="`${cell.date}-${cell.isCurrentMonth}`"
        class="aspect-square border border-base-300 rounded p-1 flex flex-col cursor-pointer hover:bg-base-300/50 transition-colors"
        :class="{
          'bg-base-200': !cell.isCurrentMonth,
          'bg-base-100': cell.isCurrentMonth,
          'ring-2 ring-primary': cell.isToday
        }"
        @click="cell.isCurrentMonth && cell.dayEvents.length > 0 ? $emit('dayClick', cell) : null"
      >
        <div class="flex items-start justify-between mb-1">
          <div class="text-xs font-medium" :class="{ 'text-base-content/50': !cell.isCurrentMonth }">
            {{ cell.date }}
          </div>
          <div 
            v-if="cell.isCurrentMonth && cell.dayEvents.length > 0" 
            class="badge badge-primary badge-xs"
          >
            {{ cell.dayEvents.length }}
          </div>
        </div>
        
        <div v-if="cell.isCurrentMonth && cell.dayEvents.length > 0" class="flex-1 flex flex-col justify-end">
          <div class="space-y-0.5">
            <div 
              v-for="categoryInfo in cell.categoryPercentages" 
              :key="categoryInfo.id"
              class="flex items-center space-x-1 leading-none"
            >
              <span 
                class="text-xs text-base-content/70 w-7 text-right leading-none"
                :title="`${categoryInfo.name} (${categoryInfo.percentage}%)`"
              >{{ categoryInfo.percentage }}%</span>
              <div 
                class="flex-1 relative"
                :title="`${categoryInfo.name} (${categoryInfo.percentage}%)`"
              >
                <div
                  class="h-1 rounded-full"
                  :style="{ 
                    backgroundColor: categoryInfo.color,
                    width: `${categoryInfo.percentage}%`,
                    minWidth: '6px'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Category } from "@/stores/categories";

interface Props {
  year: number;
  month: number;
  events: any[];
  categories: Category[];
}

interface Emits {
  (e: 'dayClick', cell: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarCells = computed(() => {
  const firstDay = new Date(props.year, props.month, 1);
  const lastDay = new Date(props.year, props.month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const cells = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    
    const isCurrentMonth = cellDate.getMonth() === props.month;
    const isToday = cellDate.toDateString() === today.toDateString();
    
    // Get events for this day
    const dayEvents = props.events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === cellDate.toDateString();
    });
    
    // Calculate category percentages
    const categoryPercentages = calculateCategoryPercentages(dayEvents);
    
    cells.push({
      date: cellDate.getDate(),
      isCurrentMonth,
      isToday,
      dayEvents,
      categoryPercentages
    });
  }
  
  return cells;
});

function calculateCategoryPercentages(events: any[]) {
  if (events.length === 0) return [];
  
  const categoryCounts: { [key: string]: number } = {};
  
  // Count events by category
  events.forEach(event => {
    const category = categorizeEvent(event);
    categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
  });
  
  // Convert to array with category info
  const categoryResults = Object.entries(categoryCounts).map(([categoryId, count]) => {
    const category = props.categories.find(cat => cat.id === categoryId);
    const percentage = Math.round((count / events.length) * 100);
    
    return {
      id: categoryId,
      name: category?.name || 'Other',
      color: category?.color || '#64748b',
      count,
      percentage
    };
  }).sort((a, b) => b.count - a.count);
  
  // If more than 4 categories, combine smaller ones into "Other"
  if (categoryResults.length > 4) {
    const top3 = categoryResults.slice(0, 3);
    const remainder = categoryResults.slice(3);
    
    const otherCount = remainder.reduce((sum, cat) => sum + cat.count, 0);
    const otherPercentage = Math.round((otherCount / events.length) * 100);
    
    const other = {
      id: 'other',
      name: 'Other',
      color: '#64748b',
      count: otherCount,
      percentage: otherPercentage
    };
    
    return [...top3, other];
  }
  
  return categoryResults;
}

function categorizeEvent(event: any): Category {
  const eventText = (event.summary + ' ' + (event.description || '')).toLowerCase();
  
  for (const category of props.categories) {
    for (const keyword of category.keywords) {
      if (eventText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Default to first category if no match
  return props.categories[0] || { id: 'default', name: 'Other', color: '#64748b', keywords: [] };
}
</script>