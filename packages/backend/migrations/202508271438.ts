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

  // Create indexes for better performance
  await tx`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
`;

  await tx`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
`;
}
