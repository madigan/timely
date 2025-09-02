import { defineStore } from "pinia"
import { ref } from "vue"
import { useAuthStore } from "./auth"
import { useToastStore } from "./toast"

export interface Calendar {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
  isEnabled?: boolean
  events?: CalendarEvent[]
}

export interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  location?: string
  description?: string
}

// API helper function with authentication handling
async function apiCall(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  })

  if (response.status === 401) {
    // User is not authenticated, redirect to login
    const authStore = useAuthStore()
    authStore.user = null
    throw new Error("Authentication required")
  }

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`)
  }

  return response.json()
}

export const useCalendarStore = defineStore("calendar", () => {
  const calendars = ref<Calendar[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function getCalendars() {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiCall("/api/calendars")
      calendars.value = response
      return calendars.value
    } catch (err) {
      const toastStore = useToastStore()
      error.value = err instanceof Error ? err.message : "Failed to fetch calendars"
      console.error("Failed to fetch calendars:", err)

      // Show user-friendly error message
      if (err instanceof Error && err.message === "Authentication required") {
        toastStore.showToast("Please sign in to access your calendars", "warning")
      } else {
        toastStore.showToast("Failed to load calendars. Please check your connection.", "error")
      }

      return []
    } finally {
      isLoading.value = false
    }
  }

  async function getEvents(calendarId: string, timeMin?: string, timeMax?: string) {
    try {
      const params = new URLSearchParams()
      if (timeMin) params.append("timeMin", timeMin)
      if (timeMax) params.append("timeMax", timeMax)

      const url = `/api/calendars/${calendarId}/events${params.toString() ? "?" + params.toString() : ""}`
      const events = await apiCall(url)

      // Update the calendar's events in the local state
      const calendar = calendars.value.find((cal) => cal.id === calendarId)
      if (calendar) {
        calendar.events = events
      }

      return events
    } catch (err) {
      const toastStore = useToastStore()
      console.error(`Failed to fetch events for calendar ${calendarId}:`, err)

      // Show user-friendly error message
      if (err instanceof Error && err.message === "Authentication required") {
        toastStore.showToast("Please sign in to access calendar events", "warning")
      } else {
        toastStore.showToast("Failed to load calendar events. Please try again.", "error")
      }

      return []
    }
  }

  // Get all events from all enabled calendars
  async function getAllEvents(timeMin?: string, timeMax?: string) {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (timeMin) params.append("timeMin", timeMin)
      if (timeMax) params.append("timeMax", timeMax)

      const url = `/api/calendars/events${params.toString() ? "?" + params.toString() : ""}`
      const result = await apiCall(url)
      return result
    } catch (err) {
      const toastStore = useToastStore()
      console.error("Failed to fetch all events:", err)

      // Show user-friendly error message
      if (err instanceof Error && err.message === "Authentication required") {
        toastStore.showToast("Please sign in to access events", "warning")
      } else {
        toastStore.showToast("Failed to load events. Please check your connection.", "error")
      }

      return []
    } finally {
      isLoading.value = false
    }
  }

  function toggleCalendar(calendarId: string) {
    const calendar = calendars.value.find((cal) => cal.id === calendarId)
    if (calendar) {
      calendar.isEnabled = !calendar.isEnabled
    }
  }

  function getEnabledCalendars() {
    return calendars.value.filter((cal) => cal.isEnabled)
  }

  // Clear data on logout
  function clearData() {
    calendars.value = []
    error.value = null
  }

  return {
    calendars,
    isLoading,
    error,
    getCalendars,
    getEvents,
    getAllEvents,
    toggleCalendar,
    getEnabledCalendars,
    clearData,
  }
})
