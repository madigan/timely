import { Elysia, t } from "elysia"
import {
  getOrCreateImportantEventSettings,
  type ImportantEventSettingsInput,
  updateImportantEventSettings,
} from "../services/importantEvents/importantEvents.service.ts"
import { requireAuth } from "./auth.routes.ts"

export const importantEventsRoutes = new Elysia({ prefix: "/important-events" })
  .use(requireAuth())
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
