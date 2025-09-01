<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <!-- Calendar Visibility with Preview Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Calendar Visibility</h2>
      <p class="text-base-content/70 mb-6">
        Choose which calendars to display in your view. Expand each calendar to preview upcoming events.
      </p>

      <div class="space-y-2">
        <div
          v-for="calendar in calendars"
          :key="calendar.id"
          class="collapse collapse-arrow bg-base-200"
        >
          <!-- Calendar Header with Toggle -->
          <input 
            type="radio" 
            name="calendar-accordion"
            :value="calendar.id"
            class="peer" 
            @change="onAccordionChange(calendar.id, $event)"
            @click="onAccordionClick(calendar.id, $event)"
          />
          <div class="collapse-title flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="font-medium">{{ calendar.summary }}</span>
              <span v-if="calendar.primary" class="badge badge-primary badge-sm">
                Primary
              </span>
            </div>
            <div class="flex items-center space-x-2" @click.stop>
              <span class="text-sm text-base-content/70">
                {{ calendar.isEnabled ? 'Enabled' : 'Disabled' }}
              </span>
              <input
                type="checkbox"
                class="toggle toggle-primary toggle-sm"
                :checked="calendar.isEnabled"
                @change="calendarStore.toggleCalendar(calendar.id)"
              />
            </div>
          </div>
          
          <!-- Calendar Events Preview -->
          <div class="collapse-content">
            <div class="pt-2">
              <div v-if="loadingEvents[calendar.id]" class="text-center py-4">
                <span class="loading loading-spinner loading-sm"></span>
                <span class="ml-2 text-sm text-base-content/70">Loading events...</span>
              </div>
              
              <div v-else-if="calendarEvents[calendar.id]?.length === 0" class="text-center py-4">
                <span class="text-sm text-base-content/50">No upcoming events in the next 30 days</span>
              </div>
              
              <div v-else class="space-y-2">
                <div class="text-sm font-medium text-base-content/70 mb-3">
                  Upcoming events (next 30 days):
                </div>
                <div
                  v-for="event in calendarEvents[calendar.id]?.slice(0, 3)"
                  :key="event.id"
                  class="bg-base-100 rounded-lg p-2 border border-base-300"
                >
                  <div class="flex items-center justify-between">
                    <div class="font-medium text-sm flex-1 mr-2">{{ event.summary }}</div>
                    <div class="text-xs text-base-content/60 flex-shrink-0">
                      {{ formatEventDate(event) }}
                    </div>
                  </div>
                  <div v-if="event.location" class="text-xs text-base-content/50 mt-1">
                    📍 {{ event.location }}
                  </div>
                </div>
                <div v-if="(calendarEvents[calendar.id]?.length || 0) > 3" class="text-xs text-base-content/50 text-center pt-2">
                  ... and {{ (calendarEvents[calendar.id]?.length || 0) - 3 }} more events
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6">
      <CategorySettings
        :categories="categories"
        @add-category="showAddModal = true"
        @edit-category="editCategory"
        @delete-category="confirmDelete"
      />
    </div>

    <!-- Important Events Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6 mt-8">
      <ImportantEventsSettings />
    </div>

    <!-- Add/Edit Category Modal -->
    <CategoryModal
      :is-open="showAddModal || showEditModal"
      :editing-category="editingCategory"
      @close="closeModal"
      @save="saveCategory"
    />

    <!-- Delete Confirmation Modal -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Deletion</h3>
        <p class="py-4">
          Are you sure you want to delete the category "{{
            categoryToDelete?.name
          }}"? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-error" @click="deleteCategory">Delete</button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="showDeleteModal = false"
      >
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { onMounted, reactive, ref } from "vue"
import CategoryModal, { type CategoryFormData } from "@/components/CategoryModal.vue"
import CategorySettings from "@/components/CategorySettings.vue"
import ImportantEventsSettings from "@/components/ImportantEventsSettings.vue"
import { type CalendarEvent, useCalendarStore } from "@/stores/calendars"
import { type Category, useCategoryStore } from "@/stores/categories"

const calendarStore = useCalendarStore()
const settingsStore = useCategoryStore()

const calendars = ref<any[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

// Event preview state
const calendarEvents = reactive<Record<string, CalendarEvent[]>>({})
const loadingEvents = reactive<Record<string, boolean>>({})
const expandedCalendarId = ref<string | null>(null)

const { categories } = storeToRefs(settingsStore)

onMounted(async () => {
  calendars.value = await calendarStore.getCalendars()
})

function onAccordionChange(calendarId: string, event: Event) {
  const target = event.target as HTMLInputElement

  // Radio button was selected - expand this section
  if (target.checked) {
    expandedCalendarId.value = calendarId

    // Load events if we haven't loaded them yet
    if (!calendarEvents[calendarId]) {
      loadCalendarEvents(calendarId)
    }
  }
}

function onAccordionClick(calendarId: string, event: Event) {
  const target = event.target as HTMLInputElement

  // If clicking on an already checked radio button, uncheck it to allow collapsing
  if (expandedCalendarId.value === calendarId && target.checked) {
    // Small delay to allow the change event to fire first
    setTimeout(() => {
      target.checked = false
      expandedCalendarId.value = null
    }, 0)
  }
}

async function loadCalendarEvents(calendarId: string) {
  if (loadingEvents[calendarId] || calendarEvents[calendarId]) {
    return // Already loading or loaded
  }

  loadingEvents[calendarId] = true

  try {
    // Calculate date range: today to 30 days from now
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const timeMin = now.toISOString()
    const timeMax = thirtyDaysFromNow.toISOString()

    const events = await calendarStore.getEvents(calendarId, timeMin, timeMax)
    calendarEvents[calendarId] = events || []
  } catch (error) {
    console.error("Failed to load calendar events:", error)
    calendarEvents[calendarId] = []
  } finally {
    loadingEvents[calendarId] = false
  }
}

function formatEventDate(event: CalendarEvent): string {
  const start = event.start.dateTime || event.start.date
  const end = event.end.dateTime || event.end.date

  if (!start) return ""

  try {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null

    // Check if it's an all-day event
    if (event.start.date && !event.start.dateTime) {
      return startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }

    // Time-based event
    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }

    const dateFormat: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    }

    const dateStr = startDate.toLocaleDateString("en-US", dateFormat)
    const startTimeStr = startDate.toLocaleTimeString("en-US", timeFormat)

    if (endDate && endDate.toDateString() === startDate.toDateString()) {
      // Same day, show end time
      const endTimeStr = endDate.toLocaleTimeString("en-US", timeFormat)
      return `${dateStr}, ${startTimeStr} - ${endTimeStr}`
    }

    return `${dateStr}, ${startTimeStr}`
  } catch (error) {
    console.error("Error formatting event date:", error)
    return start
  }
}

function editCategory(category: Category) {
  editingCategory.value = category
  showEditModal.value = true
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

function deleteCategory() {
  if (categoryToDelete.value) {
    settingsStore.deleteCategory(categoryToDelete.value.id)
    showDeleteModal.value = false
    categoryToDelete.value = null
  }
}

function saveCategory(data: CategoryFormData) {
  if (editingCategory.value) {
    settingsStore.updateCategory(editingCategory.value.id, data)
  } else {
    settingsStore.addCategory(data)
  }
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingCategory.value = null
}
</script>
