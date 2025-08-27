#!/usr/bin/env bun

import { die } from "@timely/shared/utils";
import { SQL } from "bun";
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create separate database connection for migrations
const databaseUrl = process.env.DATABASE_URL || die("DATABASE_URL not populated.");
const sql = new SQL(databaseUrl);

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
    // Ensure migrations table exists first
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    const result = await sql`SELECT name FROM migrations ORDER BY name`;
    return result.map(row => row.name);
  } catch (error) {
    console.warn('Error fetching applied migrations:', error);
    return [];
  }
}

// Get and display migration status
async function getMigrationStatus(): Promise<void> {
  try {
    console.log('🔍 Checking migration status...\n');
    
    const migrationFiles = await getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();
    
    const allMigrations = migrationFiles.map(file => file.replace('.ts', ''));
    const pendingMigrations = allMigrations.filter(name => !appliedMigrations.includes(name));
    
    // Display applied migrations
    if (appliedMigrations.length > 0) {
      console.log('✅ Applied migrations:');
      appliedMigrations.forEach(name => {
        console.log(`   ${name}`);
      });
      console.log('');
    } else {
      console.log('📋 No migrations have been applied yet\n');
    }
    
    // Display pending migrations
    if (pendingMigrations.length > 0) {
      console.log('⏳ Pending migrations:');
      pendingMigrations.forEach(name => {
        console.log(`   ${name}`);
      });
      console.log('');
    } else {
      console.log('🎉 All migrations are up to date\n');
    }
    
    // Summary
    console.log(`📊 Summary: ${appliedMigrations.length} applied, ${pendingMigrations.length} pending, ${allMigrations.length} total`);
    
  } catch (error) {
    console.error('❌ Failed to get migration status:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run status check if this script is executed directly
if (import.meta.main) {
  await getMigrationStatus();
}