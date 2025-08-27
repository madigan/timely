import { TransactionSQL } from "bun";

/**
 * Initial database creation with migration status tracking.
 */
export async function up(tx: TransactionSQL) {
  // Create users table
  await tx`
    CREATE TABLE users (
    id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date BIGINT,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    picture TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  // Create sessions table
  await tx`
        CREATE TABLE sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
        )`;

  // Create categories table
  await tx`
    CREATE TABLE categories (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
      keywords TEXT[] NOT NULL DEFAULT '{}',
      target INTEGER NOT NULL CHECK (target >= 0 AND target <= 100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  // Create indexes for better performance
  await tx`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
`;

  await tx`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
`;

  await tx`
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)
`;
}
