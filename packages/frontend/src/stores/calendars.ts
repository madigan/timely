import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";

export interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  isEnabled?: boolean;
  events?: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  description?: string;
}

// API helper function with authentication handling
async function apiCall(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include'
  });
  
  if (response.status === 401) {
    // User is not authenticated, redirect to login
    const authStore = useAuthStore();
    authStore.user = null;
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}

export const useCalendarStore = defineStore("calendar", () => {
  const calendars = ref<Calendar[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function getCalendars() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await apiCall('/api/calendars');
      calendars.value = response;
      return calendars.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch calendars';
      console.error('Failed to fetch calendars:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  async function getEvents(calendarId: string, timeMin?: string, timeMax?: string) {
    try {
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      
      const url = `/api/calendars/${calendarId}/events${params.toString() ? '?' + params.toString() : ''}`;
      const events = await apiCall(url);
      
      // Update the calendar's events in the local state
      const calendar = calendars.value.find(cal => cal.id === calendarId);
      if (calendar) {
        calendar.events = events;
      }
      
      return events;
    } catch (err) {
      console.error(`Failed to fetch events for calendar ${calendarId}:`, err);
      return [];
    }
  }

  // Get all events from all enabled calendars
  async function getAllEvents(timeMin?: string, timeMax?: string) {
    try {
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      
      const url = `/api/events${params.toString() ? '?' + params.toString() : ''}`;
      return await apiCall(url);
    } catch (err) {
      console.error('Failed to fetch all events:', err);
      return [];
    }
  }

  function toggleCalendar(calendarId: string) {
    const calendar = calendars.value.find(cal => cal.id === calendarId);
    if (calendar) {
      calendar.isEnabled = !calendar.isEnabled;
    }
  }

  function getEnabledCalendars() {
    return calendars.value.filter(cal => cal.isEnabled);
  }

  // Clear data on logout
  function clearData() {
    calendars.value = [];
    error.value = null;
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
  };
});