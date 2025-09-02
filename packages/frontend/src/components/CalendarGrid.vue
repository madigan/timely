<template>
  <div
    class="p-8 print:p-0 not-print:max-w-7xl print:w-screen h-full mx-auto"
  >
    <!-- Full Loading State -->
    <CalendarGridSkeleton v-if="isInitialLoading" />
    
    <!-- Loaded Content -->
    <div v-else>
      <div class="mb-8 print:hidden">
      <h1 class="text-3xl font-bold mb-4">Calendar Overview</h1>
      <p class="text-base-content/70 mb-6">
        View your church events across enabled calendars
      </p>

      <!-- Date Range Controls -->
      <div class="bg-base-100 rounded-lg p-4 shadow-sm">
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
          <button class="btn btn-primary btn-sm" @click="resetToDefault">
            Reset to Default
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-4 print:space-y-0">
      <div
        v-for="month in monthsInRange"
        :key="`${month.year}-${month.month}`"
        class="bg-base-100 rounded-lg p-4 shadow-sm print:shadow-none print:border-0 print:p-3 calendar-month-container"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">
            {{ month.name }} {{ month.year }}
          </h2>
        </div>

        <!-- Top Section: Important Events + Category Overview -->
        <div
          class="flex flex-col lg:flex-row gap-4 mb-4 print:hidden lg:items-stretch"
        >
          <!-- Important Events Section -->
          <div class="flex-1 flex" v-if="importantSettings.enabled">
            <div class="flex-1">
              <ImportantEventsPanel
                :events="month.importantEvents"
                :month-key="`${month.year}-${month.month}`"
                :is-loading="isEventsLoading"
                @event-expanded="onEventExpanded"
                class="h-full"
              />
            </div>
          </div>

          <!-- Monthly Stats Panel -->
          <div class="flex-1">
            <MonthlyStatsPanel
              v-if="
                categoryStore.categories.length > 0 || isEventsLoading || isCategoriesLoading
              "
              :category-analytics="month.categoryAnalytics"
              :is-loading="isEventsLoading || isCategoriesLoading"
            />
            <div
              v-else
              class="bg-base-200/50 rounded-lg p-4 border border-base-300 h-full flex items-center justify-center"
            >
              <div class="text-sm text-base-content/50">
                Loading categories...
              </div>
            </div>
          </div>
        </div>

        <CalendarMonth
          :year="month.year"
          :month="month.month"
          :events="month.events"
          :categories="categoryStore.categories"
          :startDate="new Date(fromDate)"
          :endDate="new Date(toDate)"
          :is-loading="isEventsLoading || isCategoriesLoading"
          @dayClick="showDayDetails"
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-8 bg-base-100 rounded-lg p-6 shadow-sm print:hidden">
      <h3 class="text-lg font-semibold mb-4">Category Legend</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="category in categoryStore.categories"
          :key="category.id"
          class="flex items-center space-x-2"
        >
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
          {{ selectedDay ? formatSelectedDate(selectedDay) : "" }}
        </h3>

        <div v-if="selectedDay" class="space-y-4">
          <div class="text-sm text-base-content/70 mb-4">
            {{ selectedDay.dayEvents.length }} event{{
              selectedDay.dayEvents.length !== 1 ? "s" : ""
            }}
            scheduled
          </div>

          <div class="space-y-3">
            <div
              v-for="categoryInfo in selectedDay.categoryPercentages"
              :key="categoryInfo.id"
              class="flex items-center space-x-3"
            >
              <div class="flex items-center space-x-2 w-24">
                <span class="text-sm font-medium"
                  >{{ categoryInfo.percentage }}%</span
                >
              </div>
              <div class="flex-1 flex items-center space-x-2">
                <div
                  class="h-3 rounded-full"
                  :style="{
                    backgroundColor: categoryInfo.color,
                    width: `${categoryInfo.percentage}%`,
                    minWidth: '12px',
                  }"
                ></div>
                <span class="text-sm">{{ categoryInfo.name }}</span>
              </div>
              <div class="text-xs text-base-content/70">
                {{ categoryInfo.count }} event{{
                  categoryInfo.count !== 1 ? "s" : ""
                }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useCalendarStore } from "@/stores/calendars"
import { type Category, useCategoryStore } from "@/stores/categories"
import { useImportantEventsStore } from "@/stores/importantEvents"
import { useAuthStore } from "@/stores/auth"
import { useToastStore } from "@/stores/toast"
import { filterImportantEvents } from "@/utils/events"
import CalendarMonth from "./CalendarMonth.vue"
import ImportantEventsPanel from "./ImportantEventsPanel.vue"
import MonthlyStatsPanel from "./MonthlyStatsPanel.vue"
import CalendarGridSkeleton from "./skeletons/CalendarGridSkeleton.vue"

const calendarStore = useCalendarStore()
const categoryStore = useCategoryStore()
const importantEventsStore = useImportantEventsStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const showModal = ref(false)
const selectedDay = ref<any>(null)
const allEvents = ref<any[]>([])

// Date range controls
const now = new Date()
const fromDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1)))
const toDate = ref(formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0)))

const monthsInRange = computed(() => {
  const start = new Date(fromDate.value)
  const end = new Date(toDate.value)
  const months = []

  // Start from the first day of the month containing the start date
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Use string comparison for consistent date handling
  const startDateStr = start.toISOString().split("T")[0]
  const endDateStr = end.toISOString().split("T")[0]

  while (current <= end) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const isCurrent = year === currentYear && month === currentMonth

    // Check if this month overlaps with our date range
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    const monthStartStr = monthStart.toISOString().split("T")[0]
    const monthEndStr = monthEnd.toISOString().split("T")[0]

    // Only include months that actually overlap with the selected range
    if (monthEndStr >= startDateStr && monthStartStr <= endDateStr) {
      // Filter events for this month within the date range
      const monthEvents = allEvents.value.filter((event) => {
        const eventDate = new Date(event.start.dateTime || event.start.date)
        const eventDateStr = eventDate.toISOString().split("T")[0]
        // Check if event is within the date range AND within this specific month
        return (
          eventDateStr >= startDateStr &&
          eventDateStr <= endDateStr &&
          eventDateStr >= monthStartStr &&
          eventDateStr <= monthEndStr
        )
      })

      // Get important events for this month
      const importantEvents = importantSettings.enabled
        ? filterImportantEvents(
            monthEvents,
            importantSettings.keywords,
            importantSettings.displayLimit
          )
        : []

      // Calculate category analytics for this month
      const categoryAnalytics = calculateMonthCategoryAnalytics(monthEvents)

      months.push({
        year,
        month,
        name: current.toLocaleDateString("en-US", { month: "long" }),
        isCurrent,
        events: monthEvents,
        importantEvents,
        categoryAnalytics,
      })
    }

    current.setMonth(current.getMonth() + 1)
  }

  return months
})

// Use reactive reference directly - don't destructure to maintain reactivity
// const { categories } = categoryStore // This breaks reactivity!
const { settings: importantSettings } = importantEventsStore

// Local loading state to ensure skeleton shows during initial load
const isInitiallyLoading = ref(true)

// Loading states
const isInitialLoading = computed(() => 
  isInitiallyLoading.value || calendarStore.isLoading || categoryStore.loading || importantEventsStore.isLoading
)
const isEventsLoading = computed(() => calendarStore.isLoading)
const isCategoriesLoading = computed(() => categoryStore.loading)

onMounted(async () => {
  console.log("CalendarGrid mounting - starting data load...")
  
  // Wait for auth to be fully initialized first
  while (authStore.isLoading) {
    console.log("Waiting for auth to complete...")
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  console.log("Auth state:", { isLoggedIn: authStore.isLoggedIn(), user: authStore.user })
  console.log("Category state:", { count: categoryStore.categories.length, loading: categoryStore.loading })
  
  if (!authStore.isLoggedIn()) {
    console.log("User not authenticated, skipping data load")
    isInitiallyLoading.value = false
    return
  }
  
  try {
    // Load all necessary data after authentication
    await Promise.all([
      importantEventsStore.loadSettings(),
      categoryStore.fetchCategories(), // Explicitly load categories after auth
      loadEvents()
    ])
    console.log("CalendarGrid data loaded successfully")
    console.log("Final category count:", categoryStore.categories.length)
  } catch (error) {
    console.error("Error loading initial data:", error)
  } finally {
    isInitiallyLoading.value = false
  }
})

async function loadEvents() {
  // First load calendars to ensure they're available
  await calendarStore.getCalendars()

  // Get all events from enabled calendars for the current date range
  const startDate = new Date(fromDate.value)
  const endDate = new Date(toDate.value)

  const events = await calendarStore.getAllEvents(startDate.toISOString(), endDate.toISOString())

  allEvents.value = events
}


// Watch for date range changes and reload events
watch([fromDate, toDate], async () => {
  try {
    await loadEvents()
  } catch (error) {
    console.error("Error reloading events after date change:", error)
  }
})


function resetToDefault() {
  const now = new Date()
  fromDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
  toDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0))
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0]
}


function showDayDetails(dayCell: any) {
  selectedDay.value = dayCell
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedDay.value = null
}


function formatSelectedDate(dayCell: any) {
  // Find the month that contains this day cell
  for (const month of monthsInRange.value) {
    const monthStart = new Date(month.year, month.month, 1)
    const monthEnd = new Date(month.year, month.month + 1, 0)
    const cellDate = new Date(month.year, month.month, dayCell.date)

    if (cellDate >= monthStart && cellDate <= monthEnd) {
      return cellDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // Fallback: use current date context
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const date = new Date(currentYear, currentMonth, dayCell.date)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function onEventExpanded(_eventId: string, _monthKey: string) {
  // Optional: Handle event expansion if needed for analytics or other purposes
  // Currently not needed as the accordion component manages its own state
}

function calculateMonthCategoryAnalytics(monthEvents: any[]) {
  // Get total hours for all events in the month
  let totalHours = 0
  const categoryStats: {
    [key: string]: { hours: number; count: number; category: Category }
  } = {}

  // Initialize category stats
  categoryStore.categories.forEach((category) => {
    categoryStats[category.id] = {
      hours: 0,
      count: 0,
      category,
    }
  })

  // Calculate hours for each event
  monthEvents.forEach((event: any) => {
    const startTime = new Date(event.start.dateTime || event.start.date)
    const endTime = new Date(event.end.dateTime || event.end.date)
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    // Categorize event based on keywords
    const matchedCategory = categorizeEvent(event)
    if (matchedCategory) {
      categoryStats[matchedCategory.id].hours += hours
      categoryStats[matchedCategory.id].count += 1
    }

    totalHours += hours
  })

  // Calculate analytics data - show all categories to provide complete overview
  return categoryStore.categories
    .map((category) => {
      const stats = categoryStats[category.id]
      const actualPercentage = totalHours > 0 ? (stats.hours / totalHours) * 100 : 0

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        target: category.target,
        actualPercentage,
        eventCount: stats.count,
        hours: stats.hours,
      }
    })
    .sort((a, b) => b.target - a.target) // Sort by target percentage (descending)
}

function categorizeEvent(event: any): Category | null {
  const eventText = ((event.summary || "") + " " + (event.description || "")).toLowerCase()

  // Find the first category whose keywords match the event
  for (const category of categoryStore.categories) {
    if (category.keywords.some((keyword) => eventText.includes(keyword.toLowerCase()))) {
      return category
    }
  }

  return null
}
</script>
