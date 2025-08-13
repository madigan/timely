import { defineStore } from "pinia";
import { ref } from "vue";

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

function generateRandomEvents(calendarId: string, count: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const eventTypes = [
    { summary: "Sunday Service", location: "Main Sanctuary", description: "Weekly worship service with sermon and communion" },
    { summary: "Bible Study", location: "Fellowship Hall", description: "Weekly Bible study and discussion group" },
    { summary: "Prayer Meeting", location: "Prayer Room", description: "Community prayer and intercession time" },
    { summary: "Youth Group", location: "Youth Center", description: "Activities and fellowship for young people" },
    { summary: "Women's Ministry", location: "Conference Room", description: "Women's fellowship and study meeting" },
    { summary: "Men's Breakfast", location: "Fellowship Hall", description: "Monthly men's fellowship breakfast" },
    { summary: "Choir Practice", location: "Music Room", description: "Weekly choir rehearsal for Sunday service" },
    { summary: "Council Meeting", location: "Pastor's Office", description: "Church leadership and planning meeting" },
    { summary: "Communion Service", location: "Main Sanctuary", description: "Special communion and worship service" },
    { summary: "Community Outreach", location: "Community Center", description: "Local community service and outreach event" },
    { summary: "Baptism Service", location: "Main Sanctuary", description: "Baptism ceremony and celebration" },
    { summary: "Wedding Ceremony", location: "Main Sanctuary", description: "Wedding ceremony and celebration" },
    { summary: "Funeral Service", location: "Main Sanctuary", description: "Memorial service for departed member" },
    { summary: "Children's Ministry", location: "Children's Wing", description: "Sunday school and activities for children" },
    { summary: "Small Group Meeting", location: "Various Homes", description: "Home-based fellowship and study group" },
    { summary: "Volunteer Training", location: "Conference Room", description: "Training session for church volunteers" },
    { summary: "Mission Trip Planning", location: "Fellowship Hall", description: "Planning meeting for upcoming mission trip" },
    { summary: "Food Pantry", location: "Storage Room", description: "Community food distribution service" },
    { summary: "Senior Ministry", location: "Fellowship Hall", description: "Activities and fellowship for senior members" },
    { summary: "Vacation Bible School", location: "Various Rooms", description: "Summer program for children and families" }
  ];

  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const day = Math.floor(Math.random() * 31) + 1;
    const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
    const minute = Math.random() > 0.5 ? 0 : 30;
    const duration = Math.random() > 0.5 ? 1 : 2; // 1 or 2 hours

    const startDate = `2025-08-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    const endDate = `2025-08-${day.toString().padStart(2, '0')}T${(hour + duration).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

    events.push({
      id: `${calendarId}-event-${i + 1}`,
      summary: eventType.summary,
      start: { dateTime: startDate },
      end: { dateTime: endDate },
      location: eventType.location,
      description: eventType.description
    });
  }

  return events.sort((a, b) => a.start.dateTime!.localeCompare(b.start.dateTime!));
}

const dummyCalendars: Calendar[] = [
  {
    id: "church-main",
    summary: "Main Church Calendar",
    primary: true,
    backgroundColor: "#3B82F6",
    events: generateRandomEvents("church-main", 85)
  },
  {
    id: "youth-ministry",
    summary: "Youth Ministry",
    backgroundColor: "#10B981",
    events: generateRandomEvents("youth-ministry", 45)
  },
  {
    id: "worship-team",
    summary: "Worship & Music",
    backgroundColor: "#8B5CF6",
    events: generateRandomEvents("worship-team", 62)
  },
  {
    id: "community-outreach",
    summary: "Community Outreach",
    backgroundColor: "#F59E0B",
    events: generateRandomEvents("community-outreach", 38)
  }
];

export const useCalendarStore = defineStore("calendar", () => {
  const calendars = ref<Calendar[]>(dummyCalendars);

  async function getCalendars() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return calendars.value;
  }

  async function getEvents(calendarId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    const calendar = calendars.value.find(cal => cal.id === calendarId);
    return calendar?.events || [];
  }

  return {
    calendars,
    getCalendars,
    getEvents,
  };
});
