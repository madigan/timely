<template>
  <div
    class="p-8 print:p-0 not-print:max-w-7xl print:w-screen h-full mx-auto"
  >
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
                @event-expanded="onEventExpanded"
                @open-settings="openImportantEventsSettings"
                class="h-full"
              />
            </div>
          </div>

          <!-- Monthly Stats Panel -->
          <div class="flex-1">
            <MonthlyStatsPanel
              v-if="
                month.categoryAnalytics.length > 0 || month.events.length > 0
              "
              :category-analytics="month.categoryAnalytics"
              @open-settings="openCategorySettings"
            />
            <div
              v-else
              class="bg-base-200/50 rounded-lg p-4 border border-base-300 h-full flex items-center justify-center"
            >
              <div class="text-sm text-base-content/50">
                No events in this timeframe
              </div>
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
        <div
          v-for="category in categories"
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

    <!-- Important Events Settings Modal -->
    <dialog class="modal" :class="{ 'modal-open': showImportantEventsModal }">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Important Events Settings</h3>
        <ImportantEventsSettings />
        <div class="modal-action">
          <button class="btn" @click="closeImportantEventsModal">Close</button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeImportantEventsModal"
      >
        <button>close</button>
      </form>
    </dialog>

    <!-- Category Settings Modal -->
    <dialog class="modal" :class="{ 'modal-open': showCategorySettingsModal }">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">Category Settings</h3>
        <CategorySettings
          :categories="categories"
          @add-category="showAddCategoryModal = true"
          @edit-category="editCategory"
          @delete-category="confirmDeleteCategory"
        />
        <div class="modal-action">
          <button class="btn" @click="closeCategorySettingsModal">Close</button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="closeCategorySettingsModal"
      >
        <button>close</button>
      </form>
    </dialog>

    <!-- Add/Edit Category Modal -->
    <CategoryModal
      :is-open="showAddCategoryModal || showEditCategoryModal"
      :editing-category="editingCategory"
      @close="closeCategoryModal"
      @save="saveCategory"
    />

    <!-- Delete Category Confirmation Modal -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteCategoryModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Deletion</h3>
        <p class="py-4">
          Are you sure you want to delete the category "{{
            categoryToDelete?.name
          }}"? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn" @click="showDeleteCategoryModal = false">
            Cancel
          </button>
          <button class="btn btn-error" @click="deleteCategory">Delete</button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="showDeleteCategoryModal = false"
      >
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useCalendarStore } from "@/stores/calendars"
import { type Category, useCategoryStore } from "@/stores/categories"
import { useImportantEventsStore } from "@/stores/importantEvents"
import { filterImportantEvents } from "@/utils/events"
import CalendarMonth from "./CalendarMonth.vue"
import CategoryModal, { type CategoryFormData } from "./CategoryModal.vue"
import CategorySettings from "./CategorySettings.vue"
import ImportantEventsPanel from "./ImportantEventsPanel.vue"
import ImportantEventsSettings from "./ImportantEventsSettings.vue"
import MonthlyStatsPanel from "./MonthlyStatsPanel.vue"

const calendarStore = useCalendarStore()
const categoryStore = useCategoryStore()
const importantEventsStore = useImportantEventsStore()

const showModal = ref(false)
const showImportantEventsModal = ref(false)
const showCategorySettingsModal = ref(false)
const showAddCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const showDeleteCategoryModal = ref(false)
const editingCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)
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

const { categories } = categoryStore
const { settings: importantSettings } = importantEventsStore

onMounted(async () => {
  await loadEvents()
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

function resetToDefault() {
  const now = new Date()
  fromDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
  toDate.value = formatDateForInput(new Date(now.getFullYear(), now.getMonth() + 2, 0))
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0]
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startStr = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const endStr = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return `${startStr} - ${endStr}`
}

function showDayDetails(dayCell: any) {
  selectedDay.value = dayCell
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedDay.value = null
}

function openImportantEventsSettings() {
  showImportantEventsModal.value = true
}

function closeImportantEventsModal() {
  showImportantEventsModal.value = false
}

function openCategorySettings() {
  showCategorySettingsModal.value = true
}

function closeCategorySettingsModal() {
  showCategorySettingsModal.value = false
}

function editCategory(category: Category) {
  editingCategory.value = category
  showEditCategoryModal.value = true
}

function confirmDeleteCategory(category: Category) {
  categoryToDelete.value = category
  showDeleteCategoryModal.value = true
}

function deleteCategory() {
  if (categoryToDelete.value) {
    categoryStore.deleteCategory(categoryToDelete.value.id)
    showDeleteCategoryModal.value = false
    categoryToDelete.value = null
  }
}

function saveCategory(data: CategoryFormData) {
  if (editingCategory.value) {
    categoryStore.updateCategory(editingCategory.value.id, data)
  } else {
    categoryStore.addCategory(data)
  }
  closeCategoryModal()
}

function closeCategoryModal() {
  showAddCategoryModal.value = false
  showEditCategoryModal.value = false
  editingCategory.value = null
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

function onEventExpanded(eventId: string, monthKey: string) {
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
  categories.forEach((category) => {
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

  // Calculate compact analytics data - only show categories with events
  return categories
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
    .filter((cat) => cat.eventCount > 0) // Only show categories with events
    .sort((a, b) => b.target - a.target) // Sort by target percentage (descending)
}

function categorizeEvent(event: any): Category | null {
  const eventText = ((event.summary || "") + " " + (event.description || "")).toLowerCase()

  // Find the first category whose keywords match the event
  for (const category of categories) {
    if (category.keywords.some((keyword) => eventText.includes(keyword.toLowerCase()))) {
      return category
    }
  }

  return null
}
</script>
