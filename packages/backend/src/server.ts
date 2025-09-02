import { cors } from "@elysiajs/cors"
import staticPlugin from "@elysiajs/static"
import { Elysia, file } from "elysia"
import { ENCRYPTION_KEY } from "./env.ts"
import { authRoutes } from "./services/auth/auth.routes.ts"
import { calendarRoutes } from "./services/calendar/calendar.routes.ts"
import { categoryRoutes } from "./services/categories/categories.routes.ts"
import healthRoutes from "./services/health/health.routes.ts"
import { importantEventsRoutes } from "./services/importantEvents/importantEvents.routes.ts"

const apis = new Elysia({ prefix: "/api" })
  .use(authRoutes)
  .use(healthRoutes)
  .use(calendarRoutes)
  .use(categoryRoutes)
  .use(importantEventsRoutes)

const server = new Elysia({
  cookie: {
    secrets: ENCRYPTION_KEY,
  },
})
  .use(cors())
  .onError(({ code, error, set, request }) => {
    console.error("Elysia Error:", {
      code,
      error,
      url: request.url,
    })

    if (code === "NOT_FOUND") {
      set.status = 404
      return { error: "Route not found" }
    }

    // If status is already set to 401, keep it and return appropriate error
    if (set.status === 401) {
      return { error: (error as any)?.message || "Unauthorized" }
    }

    set.status = 500
    return { error: "Internal server error" }
  })
  .use(apis)
  .get("/settings", () => file("../frontend/dist/index.html"))
  .get("/calendar", () => file("../frontend/dist/index.html"))
  .use(
    staticPlugin({
      assets: "../frontend/dist",
      prefix: "/",
      indexHTML: true
    })
  )

export default server
