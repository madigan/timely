/**
 * Display and UI constants used across the application
 */

// Performance thresholds for analytics display
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 0.8,
  WARNING: 0.5,
  POOR: 0.0,
} as const

// UI display limits
export const DISPLAY_LIMITS = {
  MAX_CATEGORIES_PER_DAY: 4,
  TOP_CATEGORIES_TO_SHOW: 3,
  EVENT_TITLE_MAX_LENGTH: 30,
  IMPORTANT_EVENTS_LIMIT: 5,
} as const

// Decimal precision for hours display
export const PRECISION = {
  HOURS: 1,
  PERCENTAGE: 0,
} as const

// Calendar display constants
export const CALENDAR = {
  DAYS_IN_WEEK: 7,
  MAX_CALENDAR_ROWS: 6,
  GRID_COLUMNS: 8, // 7 days + 1 stats column
} as const
