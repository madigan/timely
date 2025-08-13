<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Calendar Overview</h1>
      <p class="text-base-content/70">View your church events across enabled calendars</p>
    </div>
    
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Current Month -->
      <div class="bg-base-100 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="badge badge-primary">Current</div>
        </div>
        <CalendarMonth 
          :year="currentYear" 
          :month="currentMonth" 
          :events="currentMonthEvents"
          :categories="categories"
        />
      </div>
      
      <!-- Next Month -->
      <div class="bg-base-100 rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">{{ nextMonthName }} {{ nextYear }}</h2>
          <div class="badge badge-secondary">Next</div>
        </div>
        <CalendarMonth 
          :year="nextYear" 
          :month="nextMonth" 
          :events="nextMonthEvents"
          :categories="categories"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCalendarStore } from "@/stores/calendars";
import { useCategoryStore, type Category } from "@/stores/categories";
import CalendarMonth from "./CalendarMonth.vue";

const calendarStore = useCalendarStore();
const categoryStore = useCategoryStore();

const currentMonthEvents = ref<any[]>([]);
const nextMonthEvents = ref<any[]>([]);

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth());

const nextMonth = computed(() => {
  return currentMonth.value === 11 ? 0 : currentMonth.value + 1;
});

const nextYear = computed(() => {
  return currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value;
});

const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US', { month: 'long' });
});

const nextMonthName = computed(() => {
  return new Date(nextYear.value, nextMonth.value).toLocaleDateString('en-US', { month: 'long' });
});

const { categories } = categoryStore;

onMounted(async () => {
  await loadEvents();
});

async function loadEvents() {
  const calendars = await calendarStore.getCalendars();
  const enabledCalendars = calendars.filter(cal => cal.isEnabled);
  
  let allEvents: any[] = [];
  
  for (const calendar of enabledCalendars) {
    const events = await calendarStore.getEvents(calendar.id);
    allEvents.push(...events);
  }
  
  // Filter events by month
  const currentMonthStart = new Date(currentYear.value, currentMonth.value, 1);
  const currentMonthEnd = new Date(currentYear.value, currentMonth.value + 1, 0);
  const nextMonthStart = new Date(nextYear.value, nextMonth.value, 1);
  const nextMonthEnd = new Date(nextYear.value, nextMonth.value + 1, 0);
  
  currentMonthEvents.value = allEvents.filter(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    return eventDate >= currentMonthStart && eventDate <= currentMonthEnd;
  });
  
  nextMonthEvents.value = allEvents.filter(event => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    return eventDate >= nextMonthStart && eventDate <= nextMonthEnd;
  });
}
</script>