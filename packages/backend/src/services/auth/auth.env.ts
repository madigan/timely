import { die } from "@timely/shared"

export const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || die("GOOGLE_CLIENT_ID is not defined.")
export const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || die("GOOGLE_CLIENT_SECRET is not defined.")
export const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || die("GOOGLE_REDIRECT_URI not provided.")
