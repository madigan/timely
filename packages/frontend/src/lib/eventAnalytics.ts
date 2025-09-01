/**
 * Event Analytics Library
 *
 * This library contains complex event analysis logic that can be unit tested.
 * It handles category analysis, performance calculations, and event processing.
 */

import type { Category } from "@/stores/categories"
import { calculateEventDuration, calculatePercentage, categorizeEvent } from "@/utils/events"

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
}

export interface CategoryAnalytics {
  id: string
  name: string
  color: string
  target: number
  actualPercentage: number
  eventCount: number
  hours: number
}

export interface CategoryStats {
  [categoryId: string]: {
    hours: number
    count: number
    category: Category
  }
}

export interface EventsInDateRange {
  events: CalendarEvent[]
  startDate: Date
  endDate: Date
}

/**
 * Calculate category statistics for a set of events
 */
export function calculateCategoryStats(
  events: CalendarEvent[],
  categories: Category[]
): CategoryStats {
  const stats: CategoryStats = {}

  // Initialize category stats
  categories.forEach((category) => {
    stats[category.id] = {
      hours: 0,
      count: 0,
      category,
    }
  })

  // Process each event
  events.forEach((event) => {
    const category = categorizeEvent(event, categories)
    if (category && stats[category.id]) {
      const hours = calculateEventDuration(event)
      stats[category.id].hours += hours
      stats[category.id].count += 1
    }
  })

  return stats
}

/**
 * Convert category stats to analytics with percentages
 */
export function calculateCategoryAnalytics(
  categoryStats: CategoryStats,
  totalHours: number
): CategoryAnalytics[] {
  return Object.values(categoryStats)
    .filter((stat) => stat.count > 0)
    .map((stat) => ({
      id: stat.category.id,
      name: stat.category.name,
      color: stat.category.color,
      target: stat.category.target,
      actualPercentage: calculatePercentage(stat.hours, totalHours),
      eventCount: stat.count,
      hours: stat.hours,
    }))
    .sort((a, b) => b.hours - a.hours)
}

/**
 * Get total hours from category stats
 */
export function getTotalHours(categoryStats: CategoryStats): number {
  return Object.values(categoryStats).reduce((sum, stat) => sum + stat.hours, 0)
}

/**
 * Filter events within a date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventDateStr = event.start.dateTime || event.start.date
    if (!eventDateStr) return false

    const eventDate = new Date(eventDateStr)
    const eventDateStr2 = eventDate.toISOString().split("T")[0]
    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    return eventDateStr2 >= startDateStr && eventDateStr2 <= endDateStr
  })
}

/**
 * Calculate performance score for a category
 */
export function calculatePerformanceScore(
  actualPercentage: number,
  targetPercentage: number
): "excellent" | "warning" | "poor" {
  const ratio = actualPercentage / targetPercentage

  if (ratio >= 0.8) return "excellent"
  if (ratio >= 0.5) return "warning"
  return "poor"
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(events: CalendarEvent[], targetDate: Date): CalendarEvent[] {
  const targetDateStr = targetDate.toDateString()

  return events.filter((event) => {
    const eventDateStr = event.start.dateTime || event.start.date
    if (!eventDateStr) return false

    const eventDate = new Date(eventDateStr)
    return eventDate.toDateString() === targetDateStr
  })
}

/**
 * Calculate comprehensive analytics for a set of events and categories
 */
export function calculateComprehensiveAnalytics(
  events: CalendarEvent[],
  categories: Category[]
): {
  categoryAnalytics: CategoryAnalytics[]
  totalHours: number
  categoryStats: CategoryStats
} {
  const categoryStats = calculateCategoryStats(events, categories)
  const totalHours = getTotalHours(categoryStats)
  const categoryAnalytics = calculateCategoryAnalytics(categoryStats, totalHours)

  return {
    categoryAnalytics,
    totalHours,
    categoryStats,
  }
}

/**
 * Group category results and handle "Other" category for display limits
 */
export function groupCategoryResults(
  categoryResults: Array<{
    id: string
    name: string
    color: string
    count: number
    hours: number
    percentage: number
  }>,
  maxCategories: number,
  topCategoriesToShow: number
): Array<{
  id: string
  name: string
  color: string
  count: number
  hours: number
  percentage: number
}> {
  if (categoryResults.length <= maxCategories) {
    return categoryResults
  }

  const topCategories = categoryResults.slice(0, topCategoriesToShow)
  const remainder = categoryResults.slice(topCategoriesToShow)

  const otherHours = remainder.reduce((sum, cat) => sum + cat.hours, 0)
  const otherCount = remainder.reduce((sum, cat) => sum + cat.count, 0)
  const totalHours = categoryResults.reduce((sum, cat) => sum + cat.hours, 0)
  const otherPercentage = calculatePercentage(otherHours, totalHours)

  const other = {
    id: "other",
    name: "Other",
    color: "#64748b",
    count: otherCount,
    hours: otherHours,
    percentage: otherPercentage,
  }

  return [...topCategories, other]
}
