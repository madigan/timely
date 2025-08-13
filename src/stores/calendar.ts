import { defineStore } from "pinia";

export interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
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

export const useCalendarStore = defineStore("calendar", () => {
  async function getCalendars() {}
  async function getEvents(calendarId: string) {}
  return {
    getCalendars,
    getEvents,
  };
});
