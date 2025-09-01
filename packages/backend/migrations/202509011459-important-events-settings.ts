import type { TransactionSQL } from "bun"

/**
 * Create important_event_settings table for storing per-user important event keywords and preferences
 */
export async function up(tx: TransactionSQL) {
  // Create important_event_settings table
  await tx`
    CREATE TABLE important_event_settings (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      keywords TEXT[] NOT NULL DEFAULT '{}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      display_limit INTEGER NOT NULL DEFAULT 3 CHECK (display_limit >= 1 AND display_limit <= 20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`

  // Create index for better performance on user lookups
  await tx`
    CREATE INDEX IF NOT EXISTS idx_important_event_settings_user_id 
    ON important_event_settings(user_id)`

  // Create unique constraint to ensure one settings record per user
  await tx`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_important_event_settings_unique_user 
    ON important_event_settings(user_id)`
}