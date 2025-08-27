import { encryptToken, decryptToken } from "./oauth.js";
import { sql } from '../db/database.js';

export interface UserTokens {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
  email: string;
  name: string;
  picture: string;
}

// Store encrypted tokens for a user
export async function storeUserTokens(tokens: UserTokens): Promise<void> {
  try {
    const encryptedAccessToken = encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken ? encryptToken(tokens.refreshToken) : null;
    
    await sql`
      INSERT INTO user_tokens 
      (user_id, access_token, refresh_token, expiry_date, email, name, picture, updated_at)
      VALUES (
        ${tokens.userId},
        ${encryptedAccessToken},
        ${encryptedRefreshToken},
        ${tokens.expiryDate || null},
        ${tokens.email},
        ${tokens.name},
        ${tokens.picture},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expiry_date = EXCLUDED.expiry_date,
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error storing user tokens:', error);
    throw error;
  }
}

// Retrieve and decrypt tokens for a user
export async function getUserTokens(userId: string): Promise<UserTokens | null> {
  try {
    const rows = await sql`
      SELECT user_id, access_token, refresh_token, expiry_date, email, name, picture
      FROM user_tokens 
      WHERE user_id = ${userId}
    `;
    
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    
    return {
      userId: row.userId,
      accessToken: decryptToken(row.accessToken),
      refreshToken: row.refreshToken ? decryptToken(row.refreshToken) : undefined,
      expiryDate: row.expiryDate || undefined,
      email: row.email,
      name: row.name,
      picture: row.picture,
    };
  } catch (error) {
    console.error('Error retrieving user tokens:', error);
    return null;
  }
}

// Delete tokens for a user (logout)
export async function deleteUserTokens(userId: string): Promise<void> {
  try {
    // Use a transaction to ensure both operations complete together
    await sql.begin(async sql => {
      await sql`DELETE FROM user_tokens WHERE user_id = ${userId}`;
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
    });
  } catch (error) {
    console.error('Error deleting user tokens:', error);
  }
}

// Check if tokens need refresh (expire within 5 minutes)
export function needsRefresh(expiryDate?: number): boolean {
  if (!expiryDate) return true;
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  return expiryDate < fiveMinutesFromNow;
}

// Generate session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create a new session
export async function createSession(userId: string): Promise<string> {
  try {
    const sessionId = generateSessionId();
    
    await sql`
      INSERT INTO sessions (session_id, user_id, expires_at)
      VALUES (
        ${sessionId}, 
        ${userId}, 
        CURRENT_TIMESTAMP + INTERVAL '30 days'
      )
    `;
    
    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Get user ID from session
export async function getSessionUserId(sessionId: string): Promise<string | null> {
  try {
    const rows = await sql`
      SELECT user_id FROM sessions 
      WHERE session_id = ${sessionId} 
        AND expires_at > CURRENT_TIMESTAMP
    `;
    
    return rows.length > 0 ? rows[0].userId : null;
  } catch (error) {
    console.error('Error getting session user ID:', error);
    return null;
  }
}

// Delete a session
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM sessions 
      WHERE session_id = ${sessionId}
    `;
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}