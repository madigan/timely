import { sql } from "../db/database.service.ts"

export interface ImportantEventSettings {
  id: string
  userId: string
  keywords: string[]
  enabled: boolean
  displayLimit: number
  createdAt: string
  updatedAt: string
}

export interface ImportantEventSettingsInput {
  keywords: string[]
  enabled: boolean
  displayLimit: number
}

// Default keywords for new users
const DEFAULT_KEYWORDS = [
  "important", 
  "urgent", 
  "critical", 
  "deadline", 
  "meeting", 
  "board", 
  "emergency"
]

/**
 * Get important event settings for a user
 */
export async function getImportantEventSettings(userId: string): Promise<ImportantEventSettings | null> {
  try {
    const rows = await sql`
      SELECT 
        id,
        user_id as "userId",
        keywords,
        enabled,
        display_limit as "displayLimit",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM important_event_settings 
      WHERE user_id = ${userId}
    `

    if (rows.length === 0) {
      return null
    }

    return rows[0] as ImportantEventSettings
  } catch (error) {
    console.error("Error getting important event settings:", error)
    throw error
  }
}

/**
 * Create default important event settings for a new user
 */
export async function createDefaultImportantEventSettings(userId: string): Promise<ImportantEventSettings> {
  try {
    const rows = await sql`
      INSERT INTO important_event_settings (user_id, keywords, enabled, display_limit)
      VALUES (
        ${userId},
        ${DEFAULT_KEYWORDS},
        true,
        3
      )
      RETURNING 
        id,
        user_id as "userId",
        keywords,
        enabled,
        display_limit as "displayLimit",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    return rows[0] as ImportantEventSettings
  } catch (error) {
    console.error("Error creating default important event settings:", error)
    throw error
  }
}

/**
 * Update important event settings for a user
 */
export async function updateImportantEventSettings(
  userId: string, 
  settings: ImportantEventSettingsInput
): Promise<ImportantEventSettings> {
  try {
    // Validate display limit
    if (settings.displayLimit < 1 || settings.displayLimit > 20) {
      throw new Error("Display limit must be between 1 and 20")
    }

    // Clean and validate keywords
    const cleanKeywords = settings.keywords
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0)
      .filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicates

    const rows = await sql`
      UPDATE important_event_settings 
      SET 
        keywords = ${cleanKeywords},
        enabled = ${settings.enabled},
        display_limit = ${settings.displayLimit},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING 
        id,
        user_id as "userId",
        keywords,
        enabled,
        display_limit as "displayLimit",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    if (rows.length === 0) {
      throw new Error("Settings not found for user")
    }

    return rows[0] as ImportantEventSettings
  } catch (error) {
    console.error("Error updating important event settings:", error)
    throw error
  }
}

/**
 * Get or create important event settings for a user
 */
export async function getOrCreateImportantEventSettings(userId: string): Promise<ImportantEventSettings> {
  try {
    let settings = await getImportantEventSettings(userId)
    
    if (!settings) {
      settings = await createDefaultImportantEventSettings(userId)
    }
    
    return settings
  } catch (error) {
    console.error("Error getting or creating important event settings:", error)
    throw error
  }
}

/**
 * Delete important event settings for a user (called during user deletion)
 */
export async function deleteImportantEventSettings(userId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM important_event_settings 
      WHERE user_id = ${userId}
    `
  } catch (error) {
    console.error("Error deleting important event settings:", error)
    throw error
  }
}