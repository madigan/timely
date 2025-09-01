// Common types shared between frontend and backend
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  status: "success" | "error"
  timestamp?: string
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

export interface Category {
  id: string
  name: string
  color: string
  keywords: string[]
  target: number // percentage (0-100)
}

export interface Calendar {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
  isEnabled?: boolean
  events?: CalendarEvent[]
}
