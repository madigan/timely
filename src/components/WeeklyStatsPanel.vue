<template>
  <div
    class="weekly-stats-panel bg-base-200/30 rounded-lg p-2 text-xs border border-base-300 h-full flex flex-col"
  >
    <div class="font-medium text-center mb-1 text-base-content/80 text-xs">
      Week Stats
    </div>

    <div
      v-if="weeklyStats.length === 0"
      class="text-center text-base-content/50 py-2 flex-1 flex items-center justify-center"
    >
      <span class="text-xs">No events this week</span>
    </div>

    <div v-else class="space-y-1 flex-1 overflow-hidden">
      <div
        v-for="stat in weeklyStats"
        :key="stat.id"
        class="flex items-center space-x-1 text-xs"
      >
        <!-- Category Label -->
        <div class="flex items-center space-x-1 min-w-fit">
          <div
            class="w-1.5 h-1.5 rounded-full"
            :style="{ backgroundColor: stat.color }"
          ></div>
          <span class="font-medium truncate text-xs" :title="stat.name">{{
            stat.name.substring(0, 2)
          }}</span>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>
        <!-- Performance Stats -->
        <div class="flex items-center space-x-1 min-w-fit">
          <span class="font-medium text-xs"
            >{{ Math.round(stat.actualPercentage) }}/{{ stat.target }}%</span
          >
          <span
            class="text-xs px-0.5 py-0.5 rounded text-white w-3 h-3 text-center flex items-center justify-center"
            :class="{
              'bg-success':
                stat.actualPercentage >=
                stat.target * PERFORMANCE_THRESHOLDS.EXCELLENT,
              'bg-warning':
                stat.actualPercentage >=
                  stat.target * PERFORMANCE_THRESHOLDS.WARNING &&
                stat.actualPercentage <
                  stat.target * PERFORMANCE_THRESHOLDS.EXCELLENT,
              'bg-error':
                stat.actualPercentage <
                stat.target * PERFORMANCE_THRESHOLDS.WARNING,
            }"
            :title="`${stat.eventCount} event${
              stat.eventCount !== 1 ? 's' : ''
            }, ${stat.hours.toFixed(1)}h`"
          >
            <span class="text-xs leading-none">{{
              stat.actualPercentage >=
              stat.target * PERFORMANCE_THRESHOLDS.EXCELLENT
                ? "✓"
                : stat.actualPercentage >=
                  stat.target * PERFORMANCE_THRESHOLDS.WARNING
                ? "!"
                : "✗"
            }}</span>
          </span>
        </div>
      </div>

      <!-- Total hours at bottom -->
      <div class="border-t border-base-300 pt-1 mt-1 flex-shrink-0">
        <div class="flex justify-between items-center">
          <span class="text-xs font-medium text-base-content/60">Total</span>
          <span class="text-xs font-mono font-semibold"
            >{{ totalHours.toFixed(PRECISION.HOURS) }}h</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Category } from "@/stores/categories";
import {
  categorizeEvent,
  calculateEventDuration,
  calculatePercentage,
} from "@/utils/events";
import { PRECISION, PERFORMANCE_THRESHOLDS } from "@/constants/display";

interface Props {
  weekEvents: any[];
  categories: Category[];
}

const props = defineProps<Props>();

const weeklyStats = computed(() => {
  if (props.weekEvents.length === 0) return [];

  const categoryStats: {
    [key: string]: { hours: number; count: number; category: Category };
  } = {};
  let totalHours = 0;

  // Initialize category stats
  props.categories.forEach((category) => {
    categoryStats[category.id] = {
      hours: 0,
      count: 0,
      category,
    };
  });

  // Calculate hours for each event
  props.weekEvents.forEach((event) => {
    const hours = calculateEventDuration(event);
    totalHours += hours;

    // Categorize event based on keywords
    const matchedCategory = categorizeEvent(event, props.categories);
    if (matchedCategory) {
      categoryStats[matchedCategory.id].hours += hours;
      categoryStats[matchedCategory.id].count += 1;
    }
  });

  // Convert to array and calculate actual vs target percentages
  return props.categories
    .map((category) => {
      const stats = categoryStats[category.id];
      const actualPercentage =
        totalHours > 0 ? (stats.hours / totalHours) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        hours: stats.hours,
        eventCount: stats.count,
        actualPercentage,
        target: category.target,
      };
    })
    .filter((stat) => stat.eventCount > 0)
    .sort((a, b) => b.target - a.target);
});

const totalHours = computed(() => {
  return weeklyStats.value.reduce((sum, stat) => sum + stat.hours, 0);
});
</script>
