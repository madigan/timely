import postgres from 'postgres';

// Database connection configuration
const databaseUrl = process.env.DATABASE_URL;

// For development without PostgreSQL server, use a default in-memory-like setup
const defaultTestConfig = 'postgres://test:test@localhost:5432/timely_test';

// Fallback to individual environment variables if DATABASE_URL is not set
const dbConfig = databaseUrl || process.env.NODE_ENV === 'test' ? 
  (databaseUrl || defaultTestConfig) : {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'timely',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  };

// Create PostgreSQL connection with connection pooling
export const sql = postgres(dbConfig, {
  // Connection pool settings
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  // For testing, allow connection failures
  onnotice: process.env.NODE_ENV === 'development' ? () => {} : undefined,
  // Transform column names from snake_case to camelCase
  transform: {
    column: {
      from: postgres.toCamel,
      to: postgres.toSnake
    }
  }
});

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create user_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS user_tokens (
        user_id TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expiry_date BIGINT,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        picture TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
    `;

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL database:', error);
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
  console.log('🔌 Closing PostgreSQL connection...');
  await sql.end();
});

process.on('SIGINT', async () => {
  console.log('🔌 Closing PostgreSQL connection...');
  await sql.end();
});