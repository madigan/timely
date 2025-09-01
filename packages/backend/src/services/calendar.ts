import type { calendar_v3 } from "googleapis"
import { oauth2Client, createCalendarClient } from "./auth/oauth.ts"
import { getUserTokens, storeUserTokens, needsRefresh } from "./auth/tokens.ts"

export interface CalendarListItem {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
  isEnabled: boolean
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

// Refresh access token if needed
async function refreshTokenIfNeeded(userId: string): Promise<boolean> {
  const tokens = await getUserTokens(userId)
  if (!tokens) return false

  // If no expiry date, assume token is still valid (newly issued tokens might not have expiry_date)
  if (!tokens.expiryDate) {
    return true
  }

  const shouldRefresh = needsRefresh(tokens.expiryDate)
  if (shouldRefresh && tokens.refreshToken) {
    try {
      oauth2Client.setCredentials({
        refresh_token: tokens.refreshToken,
      })

      const { credentials } = await oauth2Client.refreshAccessToken()

      // Update stored tokens
      await storeUserTokens({
        ...tokens,
        accessToken: credentials.access_token!,
        expiryDate: credentials.expiry_date || undefined,
      })

      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  } else if (shouldRefresh && !tokens.refreshToken) {
    return false
  }

  return true
}

// Get user's calendar list
export async function getUserCalendars(userId: string): Promise<CalendarListItem[]> {
  const refreshed = await refreshTokenIfNeeded(userId)
  if (!refreshed) throw new Error("Token refresh failed")

  const tokens = await getUserTokens(userId)
  if (!tokens) throw new Error("No tokens found")

  const calendar = createCalendarClient(tokens.accessToken)

  try {
    const response = await calendar.calendarList.list({
      minAccessRole: "reader",
      showHidden: false,
    })

    return (response.data.items || []).map((item: calendar_v3.Schema$CalendarListEntry) => ({
      id: item.id!,
      summary: item.summary!,
      primary: item.primary || false,
      backgroundColor: item.backgroundColor || "#1976D2",
      isEnabled: true, // Enable all calendars by default
    }))
  } catch (error) {
    console.error("Failed to fetch calendars:", error)
    throw new Error("Failed to fetch calendars")
  }
}

// Get events for a specific calendar
export async function getCalendarEvents(
  userId: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  const refreshed = await refreshTokenIfNeeded(userId)
  if (!refreshed) throw new Error("Token refresh failed")

  const tokens = await getUserTokens(userId)
  if (!tokens) throw new Error("No tokens found")

  const calendar = createCalendarClient(tokens.accessToken)

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500, // Reasonable limit
    })

    return (response.data.items || []).map((item: calendar_v3.Schema$Event) => ({
      id: item.id!,
      summary: item.summary || "No Title",
      start: {
        dateTime: item.start?.dateTime || undefined,
        date: item.start?.date || undefined,
      },
      end: {
        dateTime: item.end?.dateTime || undefined,
        date: item.end?.date || undefined,
      },
      location: item.location || undefined,
      description: item.description || undefined,
    }))
  } catch (error) {
    console.error("Failed to fetch events:", error)
    throw new Error("Failed to fetch calendar events")
  }
}

// Get user profile information
export async function getUserProfile(userId: string) {
  const tokens = await getUserTokens(userId)
  if (!tokens) throw new Error("No tokens found")

  try {
    return {
      id: tokens.userId,
      email: tokens.email,
      name: tokens.name,
      picture: tokens.picture,
      accessToken: "hidden", // Don't expose actual token
    }
  } catch (error) {
    console.error("Failed to get user profile:", error)
    throw new Error("Failed to get user profile")
  }
}
