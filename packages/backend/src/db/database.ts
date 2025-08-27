import { die } from "@timely/shared/utils";
import { SQL } from "bun";
import { readdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection configuration
const databaseUrl = process.env.DATABASE_URL || die("DATABASE_URL not populated.");

export const sql = new SQL(databaseUrl);

// Migration interface
interface Migration {
  name: string;
  up: (tx: any) => Promise<void>;
}

// Get all migration files from the migrations directory
async function getMigrationFiles(): Promise<string[]> {
  try {
    const migrationsDir = join(__dirname, '../../migrations');
    const files = await readdir(migrationsDir);
    return files
      .filter(file => file.endsWith('.ts'))
      .sort(); // Sort to ensure chronological order
  } catch (error) {
    console.warn('No migrations directory found or error reading migrations:', error);
    return [];
  }
}

// Get list of applied migrations from database
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await sql`SELECT name FROM migrations WHERE status = 'COMPLETED' ORDER BY name`;
    return result.map((row: { name: any; }) => row.name);
  } catch (error) {
    console.warn('Error fetching applied migrations:', error);
    return [];
  }
}

// Load and execute a specific migration file
async function loadMigration(migrationFile: string): Promise<Migration> {
  const migrationPath = join(__dirname, '../../migrations', migrationFile);
  const migration = await import(migrationPath);
  
  return {
    name: migrationFile.replace('.ts', ''),
    up: migration.up
  };
}

// Run all pending migrations
async function runMigrations(): Promise<void> {
  try {
    const migrationFiles = await getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();
    
    // Filter out already applied migrations
    const pendingMigrations = migrationFiles.filter(file => {
      const migrationName = file.replace('.ts', '');
      return !appliedMigrations.includes(migrationName);
    });

    if (pendingMigrations.length === 0) {
      console.log('📋 No pending migrations to run');
      return;
    }

    console.log(`🔄 Running ${pendingMigrations.length} pending migration(s)...`);

    // Execute each pending migration in a transaction
    for (const migrationFile of pendingMigrations) {
      const migration = await loadMigration(migrationFile);
      
      console.log(`⚡ Running migration: ${migration.name}`);
      
      await sql.transaction(async (tx) => {
        // Insert migration with IN_PROGRESS status to prevent parallel execution
        await tx`
          INSERT INTO migrations (name, status) 
          VALUES (${migration.name}, 'IN_PROGRESS')
        `;
        
        // Execute the migration
        await migration.up(tx);
        
        // Update migration status to COMPLETED
        await tx`
          UPDATE migrations 
          SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP 
          WHERE name = ${migration.name}
        `;
      });
      
      console.log(`✅ Completed migration: ${migration.name}`);
    }
    
    console.log(`🎉 Successfully applied ${pendingMigrations.length} migration(s)`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Get migration status (useful for CLI)
export async function getMigrationStatus(): Promise<{applied: string[], pending: string[]}> {
  const migrationFiles = await getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();
  
  const pending = migrationFiles.filter(file => {
    const migrationName = file.replace('.ts', '');
    return !appliedMigrations.includes(migrationName);
  }).map(file => file.replace('.ts', ''));
  
  return {
    applied: appliedMigrations,
    pending
  };
}

// Initialize database schema
export async function initializeDatabase() {

  
  try {
  // Create the migrations table
  await sql`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT check_migration_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED'))
    );
    `

    // Run pending migrations
    await runMigrations();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Cleanup expired sessions periodically
export async function cleanupExpiredSessions() {
  try {
    const result = await sql`
      DELETE FROM sessions 
      WHERE expires_at < CURRENT_TIMESTAMP
    `;
    
    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

// Initialize database on module load
initializeDatabase();

// Cleanup expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔌 Closing DB connection...');
  await sql.end();
});

process.on('SIGINT', async () => {
  console.log('🔌 Closing DB connection...');
  await sql.end();
});