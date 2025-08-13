<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">Calendar Overview</h1>
      <p class="text-base-content/70 mb-6">View your church events across enabled calendars</p>
      
      <!-- Date Range Controls -->
      <div class="bg-base-100 rounded-lg p-4 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">From:</label>
            <input 
              type="date" 
              class="input input-bordered input-sm"
              v-model="fromDate"
              @change="updateDateRange"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">To:</label>
            <input 
              type="date" 
              class="input input-bordered input-sm"
              v-model="toDate"
              @change="updateDateRange"
            />
          </div>
          <button 
            class="btn btn-primary btn-sm"
            @click="resetToDefault"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <div 
        v-for="month in monthsInRange" 
        :key="`${month.year}-${month.month}`"
        class="bg-base-100 rounded-lg p-4 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">{{ month.name }} {{ month.year }}</h2>
          <div v-if="month.isCurrent" class="badge badge-primary badge-sm">Current</div>
        </div>
        <CalendarMonth 
          :year="month.year" 
          :month="month.month" 
          :events="month.events"
          :categories="categories"
          :startDate="new Date(fromDate)"
          :endDate="new Date(toDate)"
          @dayClick="showDayDetails"
        />
      </div>
    </div>
    
    <!-- Legend -->
    <div class="mt-8 bg-base-100 rounded-lg p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">Category Legend</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="category in categories" :key="category.id" class="flex items-center space-x-2">
          <div 
            class="w-4 h-4 rounded-full" 
            :style="{ backgroundColor: category.color }"
          ></div>
          <span class="text-sm">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- Day Details Modal -->
    <dialog class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4">
          {{ selectedDay ? formatSelectedDate(selectedDay) : '' }}
        </h3>
        
        <div v-if="selectedDay" class="space-y-4">
          <div class="text-sm text-base-content/70 mb-4">
            {{ selectedDay.dayEvents.length }} event{{ selectedDay.dayEvents.length !== 1 ? 's' : '' }} scheduled
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="categoryInfo in selectedDay.categoryPercentages" 
              :key="categoryInfo.id"
              class="flex items-center space-x-3"
            >
              <div class="flex items-center space-x-2 w-24">
                <span class="text-sm font-medium">{{ categoryInfo.percentage }}%</span>
              </div>
              <div class="flex-1 flex items-center space-x-2">
                <div
                  class="h-3 rounded-full"
                  :style="{ 
                    backgroundColor: categoryInfo.color,
                    width: `${categoryInfo.percentage}%`,
                    minWidth: '12px'
                  }"
                ></div>
                <span class="text-sm">{{ categoryInfo.name }}</span>
              </div>
              <div class="text-xs text-base-content/70">
                {{ categoryInfo.count }} event{{ categoryInfo.count !== 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="closeModal">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCalendarStore } from "@/stores/calendars";
import { useCategoryStore, type Category } from "@/stores/categories";
import CalendarMonth from "./CalendarMonth.vue";

const calendarStore = useCalendarStore();
const categoryStore = useCategoryStore();

const showModal = ref(false);
const selectedDay = ref<any>(null);
const allEvents = ref<any[]>([]);

// Date range controls
const now = new Date();
const fromDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1)));
const toDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0)));

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthsInRange = computed(() => {
  const start = new Date(fromDate.value);
  const end = new Date(toDate.value);
  const months = [];
  
  // Start from the first day of the month containing the start date
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const isCurrent = year === currentYear && month === currentMonth;
    
    // Check if this month overlaps with our date range
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    
    // Only include months that actually overlap with the selected range
    if (monthEnd >= start && monthStart <= end) {
      // Filter events for this month within the date range
      const monthEvents = allEvents.value.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        return eventDate >= Math.max(monthStart, start) && 
               eventDate <= Math.min(monthEnd, end);
      });
      
      months.push({
        year,
        month,
        name: current.toLocaleDateString('en-US', { month: 'long' }),
        isCurrent,
        events: monthEvents
      });
    }
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
});

const continuousCalendarRows = computed(() => {
  const start = new Date(fromDate.value);
  const end = new Date(toDate.value);
  const today = new Date();
  
  // Find the Sunday of the week containing the start date
  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() - start.getDay());
  
  // Generate all days from start of first week to end date
  const allCells = [];
  const current = new Date(startOfWeek);
  
  while (current <= end) {
    const isCurrentMonth = current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear();
    const isToday = current.toDateString() === today.toDateString();
    const isVisible = current >= start && current <= end;
    
    // Get events for this day
    const dayEvents = allEvents.value.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === current.toDateString();
    });
    
    // Calculate category percentages
    const categoryPercentages = calculateCategoryPercentages(dayEvents);
    
    allCells.push({
      date: current.getDate(),
      fullDate: current.toISOString().split('T')[0],
      isCurrentMonth,
      isVisible,
      isToday,
      dayEvents,
      categoryPercentages
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  // Group into rows of 7 and filter out rows with no visible cells
  const rows = [];
  for (let i = 0; i < allCells.length; i += 7) {
    const row = allCells.slice(i, i + 7);
    const hasVisibleCells = row.some(cell => cell.isVisible);
    
    if (hasVisibleCells) {
      // Pad row to 7 cells if needed
      while (row.length < 7) {
        row.push({
          date: '',
          fullDate: '',
          isCurrentMonth: false,
          isVisible: false,
          isToday: false,
          dayEvents: [],
          categoryPercentages: []
        });
      }
      rows.push(row);
    }
  }
  
  return rows;
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
    const category = categories.find(cat => cat.id === categoryId);
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

function categorizeEvent(event: any) {
  const eventText = (event.summary + ' ' + (event.description || '')).toLowerCase();
  
  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (eventText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Default to first category if no match
  return categories[0] || { id: 'default', name: 'Other', color: '#64748b', keywords: [] };
}

const { categories } = categoryStore;

onMounted(async () => {
  await loadEvents();
});

async function loadEvents() {
  const calendars = await calendarStore.getCalendars();
  const enabledCalendars = calendars.filter(cal => cal.isEnabled);
  
  const events: any[] = [];
  
  for (const calendar of enabledCalendars) {
    const calendarEvents = await calendarStore.getEvents(calendar.id);
    events.push(...calendarEvents);
  }
  
  allEvents.value = events;
}

function updateDateRange() {
  // Events are automatically filtered by the computed property
}

function resetToDefault() {
  const now = new Date();
  fromDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1));
  toDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0));
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
  
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
}

function showDayDetails(dayCell: any) {
  selectedDay.value = dayCell;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedDay.value = null;
}

function formatSelectedDate(dayCell: any) {
  // Create date based on the current calendar context
  const year = dayCell.isCurrentMonth === false ? 
    (currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value) :
    currentYear.value;
  const month = dayCell.isCurrentMonth === false ?
    (currentMonth.value === 11 ? 0 : currentMonth.value + 1) :
    currentMonth.value;
  
  const date = new Date(year, month, dayCell.date);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
</script>