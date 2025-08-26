<template>
  <div>
    <!-- Days of week header -->
    <div class="grid grid-cols-8 gap-1 mb-2">
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="text-center text-sm font-medium text-base-content/70 py-2"
      >
        {{ day }}
      </div>
      <div
        class="text-center text-sm font-medium text-base-content/70 py-2"
      >
        Week Stats
      </div>
    </div>

    <!-- Calendar cells -->
    <div class="space-y-1">
      <div
        v-for="(row, rowIndex) in calendarRows"
        :key="rowIndex"
        class="grid grid-cols-8 gap-1"
      >
        <div
          v-for="cell in row"
          :key="`${cell.date}-${cell.isCurrentMonth}`"
          class="aspect-square border rounded p-1 flex flex-col transition-colors"
          :class="{
            'border-base-300 cursor-pointer hover:bg-base-300/50':
              cell.isVisible,
            'border-transparent': !cell.isVisible,
            'bg-base-200': !cell.isCurrentMonth && cell.isVisible,
            'bg-base-100': cell.isCurrentMonth && cell.isVisible,
            'ring-2 ring-primary': cell.isToday && cell.isVisible,
            invisible: !cell.isVisible,
          }"
          @click="
            cell.isVisible && cell.dayEvents.length > 0
              ? $emit('dayClick', cell)
              : null
          "
        >
          <div class="flex items-start justify-between mb-1">
            <div
              class="text-xs font-medium"
              :class="{ 'text-base-content/50': !cell.isCurrentMonth }"
            >
              {{ cell.date }}
            </div>
            <div
              v-if="cell.isCurrentMonth && cell.dayEvents.length > 0"
              class="badge badge-primary badge-xs"
            >
              {{ cell.dayEvents.length }}
            </div>
          </div>

          <div
            v-if="cell.isCurrentMonth && cell.dayEvents.length > 0"
            class="flex-1 flex flex-col justify-end"
          >
            <div class="space-y-0.5">
              <div
                v-for="categoryInfo in cell.categoryPercentages"
                :key="categoryInfo.id"
                class="flex items-center space-x-1 leading-none"
              >
                <span
                  class="text-xs text-base-content/70 w-7 text-right leading-none"
                  :title="`${categoryInfo.name} (${categoryInfo.percentage}%)`"
                  >{{ categoryInfo.percentage }}%</span
                >
                <div
                  class="flex-1 relative overflow-hidden"
                  :title="`${categoryInfo.name} (${categoryInfo.percentage}%)`"
                >
                  <div
                    class="h-3 rounded-full"
                    :style="{
                      backgroundColor: categoryInfo.color,
                      width: `${categoryInfo.percentage}%`,
                      minWidth: '12px',
                    }"
                  ></div>
                  <span
                    class="absolute inset-0 text-xs text-base-content font-medium px-1 leading-3 flex items-center whitespace-nowrap text-ellipsis"
                  >
                    {{ categoryInfo.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Stats Column -->
        <div
          class="aspect-square border-l border-base-300 pl-1 flex"
        >
          <WeeklyStatsPanel
            v-if="weeklyStatsData[rowIndex]"
            :week-events="weeklyStatsData[rowIndex].weekEvents"
            :categories="categories"
            class="w-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Category } from "@/stores/categories";
import {
  getEventsForWeek,
  getWeekStart,
  categorizeEvent,
  calculateEventDuration,
  calculatePercentage,
  formatDateString,
} from "@/utils/events";
import { DISPLAY_LIMITS } from "@/constants/display";
import WeeklyStatsPanel from "./WeeklyStatsPanel.vue";

interface Props {
  year: number;
  month: number;
  events: any[];
  categories: Category[];
  startDate?: Date;
  endDate?: Date;
}

interface Emits {
  (e: "dayClick", cell: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarRows = computed(() => {
  const firstDay = new Date(props.year, props.month, 1);
  const lastDay = new Date(props.year, props.month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const allCells = [];
  const today = new Date();

  // Generate all calendar cells
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);

    const isCurrentMonth = cellDate.getMonth() === props.month;
    const isToday = cellDate.toDateString() === today.toDateString();

    // Check if this cell should be visible based on date range
    let isVisible = isCurrentMonth;
    if (props.startDate && props.endDate) {
      // Compare date strings to avoid timezone issues
      const cellDateStr = formatDateString(cellDate);
      const startDateStr = formatDateString(props.startDate);
      const endDateStr = formatDateString(props.endDate);

      isVisible =
        isCurrentMonth &&
        cellDateStr >= startDateStr &&
        cellDateStr <= endDateStr;
    }

    // Get events for this day
    const dayEvents = props.events.filter((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === cellDate.toDateString();
    });

    // Calculate category percentages
    const categoryPercentages = calculateCategoryPercentages(dayEvents);

    allCells.push({
      date: cellDate.getDate(),
      isCurrentMonth,
      isVisible,
      isToday,
      dayEvents,
      categoryPercentages,
    });
  }

  // Group cells into rows of 7 and filter out rows with no visible cells
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const row = allCells.slice(i * 7, (i + 1) * 7);
    const hasVisibleCells = row.some((cell) => cell.isVisible);

    if (hasVisibleCells) {
      rows.push(row);
    }
  }

  return rows;
});

const weeklyStatsData = computed(() => {
  const rows = calendarRows.value;
  const weeklyStats = [];

  for (const row of rows) {
    // Get the first day of this row (Sunday)
    const firstCell = row[0];
    if (firstCell) {
      // Calculate the actual date for the first cell
      const firstDay = new Date(props.year, props.month, 1);
      const startOfMonth = new Date(firstDay);
      startOfMonth.setDate(startOfMonth.getDate() - firstDay.getDay());

      // Calculate week start based on row position
      const rowIndex = rows.indexOf(row);
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(startOfMonth.getDate() + rowIndex * 7);

      // Get all events for this week using the utility function
      const weekEvents = getEventsForWeek(props.events, weekStart);

      weeklyStats.push({
        weekStart,
        weekEvents,
      });
    }
  }

  return weeklyStats;
});

function calculateCategoryPercentages(events: any[]) {
  if (events.length === 0) return [];

  const categoryStats: { [key: string]: { hours: number; count: number } } = {};
  let totalHours = 0;

  // Calculate hours by category
  events.forEach((event) => {
    const category = categorizeEvent(event, props.categories);
    if (!category) return;

    const hours = calculateEventDuration(event);

    if (!categoryStats[category.id]) {
      categoryStats[category.id] = { hours: 0, count: 0 };
    }

    categoryStats[category.id].hours += hours;
    categoryStats[category.id].count += 1;
    totalHours += hours;
  });

  // Convert to array with category info
  const categoryResults = Object.entries(categoryStats)
    .map(([categoryId, stats]) => {
      const category = props.categories.find((cat) => cat.id === categoryId);
      const percentage = calculatePercentage(stats.hours, totalHours);

      return {
        id: categoryId,
        name: category?.name || "Other",
        color: category?.color || "#64748b",
        count: stats.count,
        hours: stats.hours,
        percentage,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  // If more than max categories, combine smaller ones into "Other"
  if (categoryResults.length > DISPLAY_LIMITS.MAX_CATEGORIES_PER_DAY) {
    const topCategories = categoryResults.slice(
      0,
      DISPLAY_LIMITS.TOP_CATEGORIES_TO_SHOW
    );
    const remainder = categoryResults.slice(
      DISPLAY_LIMITS.TOP_CATEGORIES_TO_SHOW
    );

    const otherHours = remainder.reduce((sum, cat) => sum + cat.hours, 0);
    const otherCount = remainder.reduce((sum, cat) => sum + cat.count, 0);
    const otherPercentage = calculatePercentage(otherHours, totalHours);

    const other = {
      id: "other",
      name: "Other",
      color: "#64748b",
      count: otherCount,
      hours: otherHours,
      percentage: otherPercentage,
    };

    return [...topCategories, other];
  }

  return categoryResults;
}
</script>
