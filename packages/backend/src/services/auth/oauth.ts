import crypto from "crypto"
import { OAuth2Client } from "google-auth-library"
import { google } from "googleapis"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "./auth.env"

// Encryption key for token storage
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")

export const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

// Google Calendar API scopes
export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
]

// Token encryption/decryption using modern crypto API
const ALGORITHM = "aes-256-cbc"

export function encryptToken(token: string): string {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16)
    let key: Buffer

    // Handle different key formats
    if (ENCRYPTION_KEY.length === 64) {
      // 32 bytes in hex format (correct)
      key = Buffer.from(ENCRYPTION_KEY, "hex")
    } else {
      // Fallback: use key as-is and pad/truncate to 32 bytes
      key = Buffer.alloc(32)
      Buffer.from(ENCRYPTION_KEY).copy(key)
    }

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(token, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Prepend IV to encrypted data (separated by ':')
    return `${iv.toString("hex")}:${encrypted}`
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt token")
  }
}

export function decryptToken(encryptedToken: string): string {
  try {
    const parts = encryptedToken.split(":")
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted token format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const encryptedData = parts[1]
    let key: Buffer

    // Handle different key formats (same as encrypt)
    if (ENCRYPTION_KEY.length === 64) {
      key = Buffer.from(ENCRYPTION_KEY, "hex")
    } else {
      key = Buffer.alloc(32)
      Buffer.from(ENCRYPTION_KEY).copy(key)
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt token")
  }
}

// Generate secure state for CSRF protection
export function generateCSRFState(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Create Google Calendar API client
export function createCalendarClient(accessToken: string) {
  const authClient = new OAuth2Client()
  authClient.setCredentials({ access_token: accessToken })
  return google.calendar({ version: "v3", auth: authClient })
}

// Get user info from Google
export async function getUserInfo(accessToken: string) {
  const authClient = new OAuth2Client()
  authClient.setCredentials({ access_token: accessToken })

  const oauth2 = google.oauth2({ version: "v2", auth: authClient })
  const response = await oauth2.userinfo.get()

  return {
    id: response.data.id!,
    email: response.data.email!,
    name: response.data.name!,
    picture: response.data.picture!,
  }
}
