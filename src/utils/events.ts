/**
 * Utility functions for event processing and classification
 */

/**
 * Check if an event should be considered important based on keywords
 * @param event - The event object with summary and description
 * @param keywords - Array of keywords to match against
 * @returns true if the event contains any of the important keywords
 */
export function isImportantEvent(event: any, keywords: string[]): boolean {
  if (!event || !keywords || keywords.length === 0) {
    return false;
  }

  // Combine event title and description for keyword matching
  const eventText = (
    (event.summary || '') + ' ' + 
    (event.description || '')
  ).toLowerCase();

  // Check if any important keyword is found in the event text
  return keywords.some(keyword => 
    eventText.includes(keyword.toLowerCase())
  );
}

/**
 * Filter events to find only important ones
 * @param events - Array of events to filter
 * @param keywords - Array of keywords that indicate importance
 * @param limit - Maximum number of important events to return (optional)
 * @returns Array of important events, limited by the limit parameter
 */
export function filterImportantEvents(
  events: any[], 
  keywords: string[], 
  limit?: number
): any[] {
  const importantEvents = events.filter(event => 
    isImportantEvent(event, keywords)
  );

  // Sort by start date (earliest first)
  importantEvents.sort((a, b) => {
    const dateA = new Date(a.start?.dateTime || a.start?.date || 0);
    const dateB = new Date(b.start?.dateTime || b.start?.date || 0);
    return dateA.getTime() - dateB.getTime();
  });

  // Apply limit if specified
  return limit ? importantEvents.slice(0, limit) : importantEvents;
}

/**
 * Format event date and time for display
 * @param event - The event object
 * @returns Formatted date and time string
 */
export function formatEventDateTime(event: any): string {
  const eventDate = new Date(event.start?.dateTime || event.start?.date);
  
  // If it's an all-day event (only date, no time)
  if (event.start?.date && !event.start?.dateTime) {
    return eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Event with specific time
  return eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get a shortened version of event title for display
 * @param title - The event title
 * @param maxLength - Maximum length of the shortened title
 * @returns Shortened title with ellipsis if needed
 */
export function shortenEventTitle(title: string, maxLength: number = 40): string {
  if (!title) return '';
  return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
}