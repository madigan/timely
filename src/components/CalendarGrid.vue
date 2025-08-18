<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4 print:text-2xl print:mb-2">Calendar Overview</h1>
      <p class="text-base-content/70 mb-6 print:hidden">View your church events across enabled calendars</p>
      
      <!-- Print-only date range display -->
      <div class="hidden print:block mb-4">
        <p class="text-lg font-medium">{{ formatDateRange(fromDate, toDate) }}</p>
      </div>
      
      <!-- Date Range Controls -->
      <div class="bg-base-100 rounded-lg p-4 shadow-sm print:hidden">
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">From:</label>
            <input 
              type="date" 
              class="input input-bordered input-sm"
              v-model="fromDate"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium">To:</label>
            <input 
              type="date" 
              class="input input-bordered input-sm"
              v-model="toDate"
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
    
    <div class="space-y-4 print:space-y-2">
      <div 
        v-for="month in monthsInRange" 
        :key="`${month.year}-${month.month}`"
        class="bg-base-100 rounded-lg p-4 shadow-sm print:shadow-none print:border print:border-gray-300 print:p-3 calendar-month-container"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">{{ month.name }} {{ month.year }}</h2>
          <div v-if="month.isCurrent" class="badge badge-primary badge-sm">Current</div>
        </div>
        
        <!-- Important Events Section -->
        <div v-if="importantSettings.enabled && month.importantEvents.length > 0" class="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg print:bg-white print:border-gray-300">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-orange-600">⭐</span>
            <h3 class="text-sm font-semibold text-orange-800">Important Events This Month</h3>
          </div>
          <div class="space-y-1">
            <div 
              v-for="event in month.importantEvents" 
              :key="event.id || event.summary"
              class="flex items-start justify-between text-xs bg-white border border-orange-100 rounded px-2 py-1 print:border-gray-200"
            >
              <span class="font-medium text-orange-900 flex-1" :title="event.summary">
                {{ shortenEventTitle(event.summary, 35) }}
              </span>
              <span class="text-orange-600 ml-2 whitespace-nowrap">
                {{ formatEventDateTime(event) }}
              </span>
            </div>
          </div>
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
    <div class="mt-8 bg-base-100 rounded-lg p-6 shadow-sm print:hidden">
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
import { useImportantEventsStore } from "@/stores/importantEvents";
import { filterImportantEvents, formatEventDateTime, shortenEventTitle } from "@/utils/events";
import CalendarMonth from "./CalendarMonth.vue";

const calendarStore = useCalendarStore();
const categoryStore = useCategoryStore();
const importantEventsStore = useImportantEventsStore();

const showModal = ref(false);
const selectedDay = ref<any>(null);
const allEvents = ref<any[]>([]);

// Date range controls
const now = new Date();
const fromDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1)));
const toDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0)));


const monthsInRange = computed(() => {
  const start = new Date(fromDate.value);
  const end = new Date(toDate.value);
  const months = [];
  
  // Start from the first day of the month containing the start date
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Use string comparison for consistent date handling
  const startDateStr = start.toISOString().split('T')[0];
  const endDateStr = end.toISOString().split('T')[0];
  
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const isCurrent = year === currentYear && month === currentMonth;
    
    // Check if this month overlaps with our date range
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];
    
    // Only include months that actually overlap with the selected range
    if (monthEndStr >= startDateStr && monthStartStr <= endDateStr) {
      // Filter events for this month within the date range
      const monthEvents = allEvents.value.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr >= startDateStr && eventDateStr <= endDateStr;
      });
      
      // Get important events for this month
      const importantEvents = importantSettings.enabled ? 
        filterImportantEvents(monthEvents, importantSettings.keywords, importantSettings.displayLimit) : 
        [];
      
      months.push({
        year,
        month,
        name: current.toLocaleDateString('en-US', { month: 'long' }),
        isCurrent,
        events: monthEvents,
        importantEvents
      });
    }
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
});

const { categories } = categoryStore;
const { settings: importantSettings } = importantEventsStore;

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
  // Find the month that contains this day cell
  for (const month of monthsInRange.value) {
    const monthStart = new Date(month.year, month.month, 1);
    const monthEnd = new Date(month.year, month.month + 1, 0);
    const cellDate = new Date(month.year, month.month, dayCell.date);
    
    if (cellDate >= monthStart && cellDate <= monthEnd) {
      return cellDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }
  
  // Fallback: use current date context
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const date = new Date(currentYear, currentMonth, dayCell.date);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
</script>