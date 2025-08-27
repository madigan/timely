import { Elysia } from 'elysia';
import { requireAuth } from './auth.js';
import { getUserCalendars, getCalendarEvents } from '../services/calendar.js';

export const calendarRoutes = new Elysia({ prefix: '/api' })
  .use(requireAuth())
  
  .get('/calendars', async ({ userId, set }) => {
    try {
      const calendars = await getUserCalendars(userId);
      return calendars;
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
      set.status = 500;
      return { error: 'Failed to fetch calendars' };
    }
  })
  
  .get('/calendars/:id/events', async ({ params, query, userId, set }) => {
    try {
      const { id: calendarId } = params;
      const { timeMin, timeMax } = query as { timeMin?: string; timeMax?: string };
      
      const events = await getCalendarEvents(userId, calendarId, timeMin, timeMax);
      return events;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      set.status = 500;
      return { error: 'Failed to fetch calendar events' };
    }
  })
  
  .get('/events', async ({ query, userId, set }) => {
    try {
      const { timeMin, timeMax } = query as { timeMin?: string; timeMax?: string };
      
      // Get all calendars first
      const calendars = await getUserCalendars(userId);
      const enabledCalendars = calendars.filter(cal => cal.isEnabled);
      
      // Fetch events from all enabled calendars
      const allEvents = [];
      for (const calendar of enabledCalendars) {
        try {
          const events = await getCalendarEvents(userId, calendar.id, timeMin, timeMax);
          allEvents.push(...events);
        } catch (error) {
          console.error(`Failed to fetch events for calendar ${calendar.id}:`, error);
          // Continue with other calendars even if one fails
        }
      }
      
      // Sort events by start time
      allEvents.sort((a, b) => {
        const aStart = a.start.dateTime || a.start.date || '';
        const bStart = b.start.dateTime || b.start.date || '';
        return aStart.localeCompare(bStart);
      });
      
      return allEvents;
    } catch (error) {
      console.error('Failed to fetch all events:', error);
      set.status = 500;
      return { error: 'Failed to fetch events' };
    }
  });