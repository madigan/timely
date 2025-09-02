import { Elysia, t } from "elysia"
import requireAuth from "../auth/auth.middleware.ts"
import {
  getOrCreateImportantEventSettings,
  updateImportantEventSettings,
} from "./importantEvents.service.ts"

export const importantEventsRoutes = new Elysia({ prefix: "/important-events" })
  .derive(requireAuth("IMPORTANT EVENTS"))
  .get("/settings", async ({ userId }) => {
    try {
      const settings = await getOrCreateImportantEventSettings(userId)
      return settings
    } catch (error) {
      console.error("[ImportantEvents]", "Failed to get settings:", error)
      throw new Error("Failed to get important event settings")
    }
  })
  .put(
    "/settings",
    async ({ body, userId }) => {
      try {
        const settings = await updateImportantEventSettings(userId, body)
        return settings
      } catch (error) {
        console.error("[ImportantEvents]", "Failed to update settings:", error)
        if (error instanceof Error) {
          throw new Error(`Failed to update settings: ${error.message}`)
        }
        throw new Error("Failed to update important event settings")
      }
    },
    {
      body: t.Object({
        keywords: t.Array(t.String()),
        enabled: t.Boolean(),
        displayLimit: t.Number({ minimum: 1, maximum: 20 }),
      }),
    }
  )
