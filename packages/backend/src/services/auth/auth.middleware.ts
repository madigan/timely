import Elysia from "elysia"
import { getSessionUserId } from "./tokens.service"

export const deriveUserId = new Elysia().derive({ as: "global" }, async ({ set, cookie }) => {
  const sessionId = cookie.session.value
  if (sessionId) {
    const userId = await getSessionUserId(sessionId)
    if (!userId) {
      set.status = 401
      throw new Error("Invalid session")
    }

    return { userId }
  }
  return {}
})

export const authGuard = {}

export default function requireAuth(tag: string) {
  return async ({ set, cookie }) => {
    console.debug("[Auth]", "requireAuth", tag)
    const sessionId = cookie.session.value

    if (!sessionId) {
      set.status = 401
      throw new Error("Not authenticated")
    }

    const userId = await getSessionUserId(sessionId)
    if (!userId) {
      set.status = 401
      throw new Error("Invalid session")
    }

    return { userId }
  }
}
