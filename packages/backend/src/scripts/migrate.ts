#!/usr/bin/env bun

import { die } from "@timely/shared/utils"
import { SQL } from "bun"
import { readdir } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create separate database connection for migrations
const databaseUrl = process.env.DATABASE_URL || die("DATABASE_URL not populated.")
const sql = new SQL(databaseUrl)

// Migration interface
interface Migration {
  name: string
  up: (tx: any) => Promise<void>
}

// Get all migration files from the migrations directory
async function getMigrationFiles(): Promise<string[]> {
  try {
    const migrationsDir = join(__dirname, "../../migrations")
    const files = await readdir(migrationsDir)
    return files.filter((file) => file.endsWith(".ts")).sort() // Sort to ensure chronological order
  } catch (error) {
    console.warn("No migrations directory found or error reading migrations:", error)
    return []
  }
}

// Get list of applied migrations from database
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await sql`SELECT name FROM migrations ORDER BY name`
    return result.map((row) => row.name)
  } catch (error) {
    console.warn("Error fetching applied migrations:", error)
    return []
  }
}

// Load and execute a specific migration file
async function loadMigration(migrationFile: string): Promise<Migration> {
  const migrationPath = join(__dirname, "../../migrations", migrationFile)
  const migration = await import(migrationPath)

  return {
    name: migrationFile.replace(".ts", ""),
    up: migration.up,
  }
}

// Main migration runner function
async function runMigrations(): Promise<void> {
  try {
    // Ensure migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    const migrationFiles = await getMigrationFiles()
    const appliedMigrations = await getAppliedMigrations()

    // Filter out already applied migrations
    const pendingMigrations = migrationFiles.filter((file) => {
      const migrationName = file.replace(".ts", "")
      return !appliedMigrations.includes(migrationName)
    })

    if (pendingMigrations.length === 0) {
      console.log("📋 No pending migrations to run")
      return
    }

    console.log(`🔄 Running ${pendingMigrations.length} pending migration(s)...`)

    // Execute each pending migration in a transaction
    for (const migrationFile of pendingMigrations) {
      const migration = await loadMigration(migrationFile)

      console.log(`⚡ Running migration: ${migration.name}`)

      await sql.transaction(async (tx) => {
        // Execute the migration
        await migration.up(tx)

        // Record the migration as applied
        await tx`
          INSERT INTO migrations (name) 
          VALUES (${migration.name})
        `
      })

      console.log(`✅ Completed migration: ${migration.name}`)
    }

    console.log(`🎉 Successfully applied ${pendingMigrations.length} migration(s)`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

// Run migrations if this script is executed directly
if (import.meta.main) {
  await runMigrations()
}
