/**
 * Unit tests for eventAnalytics library
 */

import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Category } from "@/stores/categories"
import {
  type CalendarEvent,
  type CategoryStats,
  calculateCategoryAnalytics,
  calculateCategoryStats,
  calculateComprehensiveAnalytics,
  calculatePerformanceScore,
  filterEventsByDateRange,
  getEventsForDay,
  getTotalHours,
  groupCategoryResults,
} from "../eventAnalytics"

// Mock the utils/events module
vi.mock("@/utils/events", () => ({
  categorizeEvent: vi.fn(),
  calculateEventDuration: vi.fn(),
  calculatePercentage: vi.fn(),
}))

import { calculateEventDuration, calculatePercentage, categorizeEvent } from "@/utils/events"

describe("eventAnalytics", () => {
  const mockCategories: Category[] = [
    {
      id: "work",
      name: "Work",
      color: "#3b82f6",
      keywords: ["meeting", "standup"],
      target: 40,
    },
    {
      id: "personal",
      name: "Personal",
      color: "#10b981",
      keywords: ["gym", "doctor"],
      target: 20,
    },
  ]

  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      summary: "Daily standup meeting",
      start: { dateTime: "2024-01-15T09:00:00Z" },
      end: { dateTime: "2024-01-15T09:30:00Z" },
    },
    {
      id: "2",
      summary: "Gym workout",
      start: { dateTime: "2024-01-15T18:00:00Z" },
      end: { dateTime: "2024-01-15T19:00:00Z" },
    },
    {
      id: "3",
      summary: "Doctor appointment",
      start: { dateTime: "2024-01-16T14:00:00Z" },
      end: { dateTime: "2024-01-16T15:00:00Z" },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock implementations
    ;(categorizeEvent as any).mockImplementation((event: CalendarEvent, categories: Category[]) => {
      if (event.summary.includes("meeting") || event.summary.includes("standup")) {
        return categories.find((c) => c.id === "work")
      }
      if (event.summary.includes("gym") || event.summary.includes("doctor")) {
        return categories.find((c) => c.id === "personal")
      }
      return null
    })

    ;(calculateEventDuration as any).mockImplementation((event: CalendarEvent) => {
      const start = new Date(event.start.dateTime || event.start.date!)
      const end = new Date(event.end.dateTime || event.end.date!)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    })

    ;(calculatePercentage as any).mockImplementation((value: number, total: number) => {
      return total > 0 ? Math.round((value / total) * 100) : 0
    })
  })

  describe("calculateCategoryStats", () => {
    it("should initialize stats for all categories", () => {
      const result = calculateCategoryStats([], mockCategories)

      expect(result).toHaveProperty("work")
      expect(result).toHaveProperty("personal")
      expect(result.work.hours).toBe(0)
      expect(result.work.count).toBe(0)
      expect(result.personal.hours).toBe(0)
      expect(result.personal.count).toBe(0)
    })

    it("should calculate stats correctly for events", () => {
      const result = calculateCategoryStats(mockEvents, mockCategories)

      expect(categorizeEvent).toHaveBeenCalledTimes(3)
      expect(calculateEventDuration).toHaveBeenCalledTimes(3)

      expect(result.work.count).toBe(1)
      expect(result.personal.count).toBe(2)
      expect(result.work.hours).toBe(0.5) // 30 minutes
      expect(result.personal.hours).toBe(2) // 1 hour + 1 hour
    })

    it("should ignore events that do not match any category", () => {
      const eventsWithUnmatched = [
        ...mockEvents,
        {
          id: "4",
          summary: "Random event",
          start: { dateTime: "2024-01-17T10:00:00Z" },
          end: { dateTime: "2024-01-17T11:00:00Z" },
        },
      ]

      const result = calculateCategoryStats(eventsWithUnmatched, mockCategories)

      // Should still only count the matched events
      expect(result.work.count).toBe(1)
      expect(result.personal.count).toBe(2)
    })
  })

  describe("calculateCategoryAnalytics", () => {
    it("should convert stats to analytics with percentages", () => {
      const mockStats: CategoryStats = {
        work: { hours: 4, count: 2, category: mockCategories[0] },
        personal: { hours: 1, count: 1, category: mockCategories[1] },
      }
      const totalHours = 5

      const result = calculateCategoryAnalytics(mockStats, totalHours)

      expect(calculatePercentage).toHaveBeenCalledWith(4, 5)
      expect(calculatePercentage).toHaveBeenCalledWith(1, 5)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe("work")
      expect(result[0].hours).toBe(4)
      expect(result[0].eventCount).toBe(2)
      expect(result[1].id).toBe("personal")
    })

    it("should filter out categories with no events", () => {
      const mockStats: CategoryStats = {
        work: { hours: 4, count: 2, category: mockCategories[0] },
        personal: { hours: 0, count: 0, category: mockCategories[1] },
      }

      const result = calculateCategoryAnalytics(mockStats, 4)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("work")
    })

    it("should sort by hours descending", () => {
      const mockStats: CategoryStats = {
        work: { hours: 2, count: 1, category: mockCategories[0] },
        personal: { hours: 4, count: 2, category: mockCategories[1] },
      }

      const result = calculateCategoryAnalytics(mockStats, 6)

      expect(result[0].id).toBe("personal")
      expect(result[1].id).toBe("work")
    })
  })

  describe("getTotalHours", () => {
    it("should calculate total hours from stats", () => {
      const mockStats: CategoryStats = {
        work: { hours: 4, count: 2, category: mockCategories[0] },
        personal: { hours: 1.5, count: 1, category: mockCategories[1] },
      }

      const result = getTotalHours(mockStats)

      expect(result).toBe(5.5)
    })

    it("should return 0 for empty stats", () => {
      const result = getTotalHours({})
      expect(result).toBe(0)
    })
  })

  describe("filterEventsByDateRange", () => {
    it("should filter events within date range", () => {
      const startDate = new Date("2024-01-15")
      const endDate = new Date("2024-01-15")

      const result = filterEventsByDateRange(mockEvents, startDate, endDate)

      expect(result).toHaveLength(2) // Events on 2024-01-15
      expect(result.map((e) => e.id)).toEqual(["1", "2"])
    })

    it("should handle events without dateTime", () => {
      const eventsWithoutDateTime: CalendarEvent[] = [
        {
          id: "1",
          summary: "All day event",
          start: { date: "2024-01-15" },
          end: { date: "2024-01-15" },
        },
      ]

      const startDate = new Date("2024-01-15")
      const endDate = new Date("2024-01-15")

      const result = filterEventsByDateRange(eventsWithoutDateTime, startDate, endDate)

      expect(result).toHaveLength(1)
    })

    it("should filter out events with missing date info", () => {
      const invalidEvents: CalendarEvent[] = [
        {
          id: "1",
          summary: "Invalid event",
          start: {},
          end: {},
        },
      ]

      const startDate = new Date("2024-01-15")
      const endDate = new Date("2024-01-15")

      const result = filterEventsByDateRange(invalidEvents, startDate, endDate)

      expect(result).toHaveLength(0)
    })
  })

  describe("calculatePerformanceScore", () => {
    it("should return excellent for >= 80% of target", () => {
      expect(calculatePerformanceScore(40, 50)).toBe("excellent") // 80%
      expect(calculatePerformanceScore(45, 50)).toBe("excellent") // 90%
    })

    it("should return warning for 50-79% of target", () => {
      expect(calculatePerformanceScore(25, 50)).toBe("warning") // 50%
      expect(calculatePerformanceScore(35, 50)).toBe("warning") // 70%
    })

    it("should return poor for < 50% of target", () => {
      expect(calculatePerformanceScore(20, 50)).toBe("poor") // 40%
      expect(calculatePerformanceScore(5, 50)).toBe("poor") // 10%
    })

    it("should handle zero target", () => {
      expect(calculatePerformanceScore(10, 0)).toBe("excellent") // Division by zero case
    })
  })

  describe("getEventsForDay", () => {
    it("should return events for specific day", () => {
      const targetDate = new Date("2024-01-15")

      const result = getEventsForDay(mockEvents, targetDate)

      expect(result).toHaveLength(2)
      expect(result.map((e) => e.id)).toEqual(["1", "2"])
    })

    it("should handle events without valid dates", () => {
      const invalidEvents: CalendarEvent[] = [
        {
          id: "1",
          summary: "Invalid event",
          start: {},
          end: {},
        },
      ]

      const targetDate = new Date("2024-01-15")

      const result = getEventsForDay(invalidEvents, targetDate)

      expect(result).toHaveLength(0)
    })
  })

  describe("calculateComprehensiveAnalytics", () => {
    it("should return complete analytics", () => {
      const result = calculateComprehensiveAnalytics(mockEvents, mockCategories)

      expect(result).toHaveProperty("categoryAnalytics")
      expect(result).toHaveProperty("totalHours")
      expect(result).toHaveProperty("categoryStats")

      expect(Array.isArray(result.categoryAnalytics)).toBe(true)
      expect(typeof result.totalHours).toBe("number")
      expect(typeof result.categoryStats).toBe("object")
    })
  })

  describe("groupCategoryResults", () => {
    const mockCategoryResults = [
      { id: "work", name: "Work", color: "#3b82f6", count: 5, hours: 10, percentage: 50 },
      { id: "personal", name: "Personal", color: "#10b981", count: 3, hours: 6, percentage: 30 },
      { id: "health", name: "Health", color: "#f59e0b", count: 2, hours: 2, percentage: 10 },
      { id: "social", name: "Social", color: "#ef4444", count: 1, hours: 2, percentage: 10 },
    ]

    it("should return all categories if under limit", () => {
      const result = groupCategoryResults(mockCategoryResults, 5, 3)

      expect(result).toHaveLength(4)
      expect(result.map((r) => r.id)).toEqual(["work", "personal", "health", "social"])
    })

    it("should group excess categories into Other", () => {
      ;(calculatePercentage as any).mockReturnValue(20) // Mock percentage for "Other"

      const result = groupCategoryResults(mockCategoryResults, 4, 3)

      expect(result).toHaveLength(4)
      expect(result.slice(0, 3).map((r) => r.id)).toEqual(["work", "personal", "health"])
      expect(result[3].id).toBe("other")
      expect(result[3].name).toBe("Other")
      expect(result[3].count).toBe(1) // Only 'social' category
      expect(result[3].hours).toBe(2)
    })

    it("should handle empty input", () => {
      const result = groupCategoryResults([], 4, 3)

      expect(result).toHaveLength(0)
    })
  })
})
