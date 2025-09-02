## Fix Instructions for Calendar Skeleton Loading Issue

### Problem
The skeleton loading state disappears prematurely because `getAllEvents()` in the calendar store doesn't manage the loading state, while `getCalendars()` does.

### Root Cause
In `packages/frontend/src/stores/calendars.ts`, the `getAllEvents()` function (lines 95-107) lacks loading state management, causing the skeleton to hide before all data is loaded.

### Solution
Modify the `getAllEvents()` function in `packages/frontend/src/stores/calendars.ts` to properly manage the `isLoading` state:

```typescript
// Get all events from all enabled calendars
async function getAllEvents(timeMin?: string, timeMax?: string) {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    if (timeMin) params.append("timeMin", timeMin)
    if (timeMax) params.append("timeMax", timeMax)

    const url = `/api/events${params.toString() ? "?" + params.toString() : ""}`
    const result = await apiCall(url)
    return result
  } catch (err) {
    console.error("Failed to fetch all events:", err)
    return []
  } finally {
    isLoading.value = false
  }
}
```

### Key Changes
1. Add `isLoading.value = true` at the start
2. Wrap the API call in try/catch
3. Add `isLoading.value = false` in the finally block

### Testing
After applying the fix:
1. Clear browser cache
2. Load the calendar page
3. Verify skeleton shows during the entire loading process
4. Confirm skeleton disappears only after all calendar data is loaded

### Alternative Approach (if needed)
If the above causes issues with independent calls to `getCalendars()` and `getAllEvents()`, consider adding a separate loading state for events:

```typescript
const isEventsLoading = ref(false)

// Then modify getAllEvents to use isEventsLoading instead of isLoading
```

And update the CalendarGrid component to include this new loading state in its `isInitialLoading` computed property.