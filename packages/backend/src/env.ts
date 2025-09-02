import { die } from "@timely/shared/utils"

export function isDevelopment() {
  return process.env.NODE_ENV === "development"
}

export function isProduction() {
  return !isDevelopment()
}

// Server Config
export const PORT = process.env.PORT || 3000

// OAuth Config
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || die("ENCRYPTION_KEY must be defined.")
export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || die("GOOGLE_CLIENT_ID is not defined.")
export const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || die("GOOGLE_CLIENT_SECRET is not defined.")
export const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || die("GOOGLE_REDIRECT_URI not provided.")

// Database Config
export const DATABASE_URL = process.env.DATABASE_URL || die("DATABASE_URL not populated.")
