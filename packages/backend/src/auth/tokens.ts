import { encryptToken, decryptToken } from './oauth.js';
import fs from 'fs/promises';
import path from 'path';

// Simple file-based token storage (in production, use Redis or database)
const TOKENS_DIR = path.join(process.cwd(), 'data', 'tokens');

// Ensure tokens directory exists
async function ensureTokensDir() {
  try {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

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
  await ensureTokensDir();
  
  const encryptedTokens = {
    ...tokens,
    accessToken: encryptToken(tokens.accessToken),
    refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : undefined
  };
  
  const filePath = path.join(TOKENS_DIR, `${tokens.userId}.json`);
  await fs.writeFile(filePath, JSON.stringify(encryptedTokens, null, 2));
}

// Retrieve and decrypt tokens for a user
export async function getUserTokens(userId: string): Promise<UserTokens | null> {
  try {
    await ensureTokensDir();
    const filePath = path.join(TOKENS_DIR, `${userId}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const encryptedTokens = JSON.parse(fileContent);
    
    return {
      ...encryptedTokens,
      accessToken: decryptToken(encryptedTokens.accessToken),
      refreshToken: encryptedTokens.refreshToken ? decryptToken(encryptedTokens.refreshToken) : undefined
    };
  } catch (error) {
    return null;
  }
}

// Delete tokens for a user (logout)
export async function deleteUserTokens(userId: string): Promise<void> {
  try {
    await ensureTokensDir();
    const filePath = path.join(TOKENS_DIR, `${userId}.json`);
    await fs.unlink(filePath);
  } catch (error) {
    // File doesn't exist or already deleted
  }
}

// Check if tokens need refresh (expire within 5 minutes)
export function needsRefresh(expiryDate?: number): boolean {
  if (!expiryDate) return true;
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return expiryDate < fiveMinutesFromNow;
}

// Generate session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Simple in-memory session storage (in production, use Redis)
export const sessions = new Map<string, string>(); // sessionId -> userId

export function createSession(userId: string): string {
  const sessionId = generateSessionId();
  sessions.set(sessionId, userId);
  return sessionId;
}

export function getSessionUserId(sessionId: string): string | null {
  return sessions.get(sessionId) || null;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}