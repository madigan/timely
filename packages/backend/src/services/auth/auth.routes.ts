import { Elysia } from "elysia"
import { isProduction } from "../../env.ts"
import { getUserProfile } from "../calendar/calendar.service.ts"
import requireAuth from "./auth.middleware.ts"
import { CALENDAR_SCOPES, generateCSRFState, getUserInfo, oauth2Client } from "./auth.service.ts"
import {
  createSession,
  deleteSession,
  deleteUserTokens,
  getSessionUserId,
  storeUserTokens,
} from "./tokens.service.ts"

// CSRF state storage (in production, use Redis)
const csrfStates = new Map<string, number>() // state -> timestamp

const userRoutes = new Elysia({ prefix: "/" })

export const authRoutes = new Elysia({ prefix: "/auth" })
  .get("/google", ({ redirect, cookie }) => {
    const state = generateCSRFState()

    // Store CSRF state with timestamp (expires in 10 minutes)
    csrfStates.set(state, Date.now() + 10 * 60 * 1000)

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: CALENDAR_SCOPES,
      state,
      prompt: "consent", // Ensures refresh token
      include_granted_scopes: true,
    })

    // Set oauth_state cookie using ElysiaJS built-in reactive cookies
    cookie.oauth_state.value = state
    cookie.oauth_state.httpOnly = true
    cookie.oauth_state.secure = isProduction()
    cookie.oauth_state.sameSite = "lax" // Allow cookie to be sent on OAuth redirects
    cookie.oauth_state.maxAge = 600 // 10 minutes

    // Use Elysia's built-in redirect
    return redirect(authUrl)
  })
  .get("/google/callback", async ({ query, headers, redirect, set, cookie }) => {
    const { code, state, error } = query as { code?: string; state?: string; error?: string }

    // Handle OAuth errors
    if (error) {
      const redirectUrl = `/?error=${encodeURIComponent(error)}`
      set.headers["content-type"] = "text/html"
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting...</body></html>`
    }

    if (!code || !state) {
      const redirectUrl = "/?error=missing_parameters"
      set.headers["content-type"] = "text/html"
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting...</body></html>`
    }

    // Verify CSRF state using ElysiaJS reactive cookies
    const storedState = cookie.oauth_state.value
    console.log("OAuth Callback Debug:", {
      receivedState: state,
      storedState: storedState,
      cookiesReceived: Object.keys(cookie),
      allCookies: headers.cookie,
    })

    const stateIsValid = storedState === state

    if (!stateIsValid) {
      console.error("OAuth state validation failed:", {
        received: state,
        stored: storedState,
        match: stateIsValid,
      })
      const redirectUrl = "/?error=invalid_state"
      set.headers["content-type"] = "text/html"
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting...</body></html>`
    }

    // Check if state has expired
    const stateTimestamp = csrfStates.get(state)
    if (!stateTimestamp || Date.now() > stateTimestamp) {
      csrfStates.delete(state)
      const redirectUrl = "/?error=expired_state"
      set.headers["content-type"] = "text/html"
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting...</body></html>`
    }

    // Clean up used state
    csrfStates.delete(state)

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code)

      if (!tokens.access_token) {
        const redirectUrl = "/?error=no_access_token"
        set.headers["content-type"] = "text/html"
        return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting...</body></html>`
      }

      // Get user info
      const userInfo = await getUserInfo(tokens.access_token)

      // Store encrypted tokens
      await storeUserTokens({
        userId: userInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date || undefined,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      })

      // Create session
      const sessionId = await createSession(userInfo.id)

      // Set session cookie using ElysiaJS built-in reactive cookies
      cookie.session.value = sessionId
      cookie.session.httpOnly = true
      cookie.session.secure = isProduction()
      cookie.session.sameSite = "lax"
      cookie.session.maxAge = 30 * 24 * 60 * 60 // 30 days

      // Clear oauth_state cookie
      cookie.oauth_state.remove()

      // Use Elysia redirect
      return redirect("/")
    } catch (error) {
      console.error("❌ OAuth callback error:", error)
      const redirectUrl = "/?error=oauth_failed"
      set.headers["content-type"] = "text/html"
      return `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Error occurred. Redirecting...</body></html>`
    }
  })
  .post("/logout", async ({ cookie }) => {
    const sessionId = cookie.session.value

    if (sessionId) {
      const userId = await getSessionUserId(sessionId)

      if (userId) {
        // Delete stored tokens
        await deleteUserTokens(userId)
        // Delete session
        await deleteSession(sessionId)
      }
    }

    // Clear session cookie
    cookie.session.remove()
    return { success: true }
  })
  .derive(requireAuth("USERS"))
  .get("/profile", async ({ userId, set }) => {
    try {
      const profile = await getUserProfile(userId)
      return profile
    } catch (error) {
      console.error("[Auth]", "Failed to get profile:", error)
      set.status = 500
      return { error: "Failed to get profile" }
    }
  })
