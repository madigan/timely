import { cors } from "@elysiajs/cors"
import { die } from "@timely/shared"
import { Elysia } from "elysia"
import { authRoutes } from "./routes/auth.routes.ts"
import { calendarRoutes } from "./routes/calendar.routes.ts"
import { categoryRoutes } from "./routes/categories.routes.ts"
import { importantEventsRoutes } from "./routes/importantEvents.routes.ts"

const PORT = process.env.PORT || 3000
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || die("ENCRYPTION_KEY must be defined.")

const _app = new Elysia({
  cookie: {
    secrets: ENCRYPTION_KEY,
  },
})
  .onError(({ code, error, set, request }) => {
    console.error("Elysia Error:", {
      code,
      error: error.message,
      stack: error.stack,
      url: request.url,
    })

    if (code === "NOT_FOUND") {
      set.status = 404
      return { error: "Route not found" }
    }

    set.status = 500
    return { error: "Internal server error" }
  })
  .use(
    cors({
      credentials: true,
      origin: true, // Allow all origins in development
    })
  )
  // Health check endpoint
  .get("/api/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
  }))
  // Manual route for root to serve index.html
  .get("/", () => Bun.file("static/index.html"))
  // Manual route for settings to serve index.html (SPA routing)
  .get("/settings", () => Bun.file("static/index.html"))
  // Manual routes for assets - more specific approach
  .get("/assets/:filename", ({ params, set }) => {
    try {
      console.log("Serving asset:", params.filename)
      const file = Bun.file(`static/assets/${params.filename}`)
      return file
    } catch (error) {
      console.error("Error serving asset:", error)
      set.status = 404
      return { error: "Asset not found" }
    }
  })
  .get("/favicon.ico", () => Bun.file("static/favicon.ico"))
  // Authentication routes (no auth required for these)
  .use(authRoutes)
  // Protected API routes
  .use(calendarRoutes)
  // Categories API routes
  .use(categoryRoutes)
  // Important Events API routes
  .use(importantEventsRoutes)
  // SPA fallback - serve index.html for non-API routes
  .get("/*", ({ path, set }) => {
    // Don't catch API or auth routes
    if (path.startsWith("/api") || path.startsWith("/auth") || path.startsWith("/assets")) {
      set.status = 404
      return { error: "Not found" }
    }
    // Serve index.html for SPA routes
    return Bun.file("static/index.html")
  })
  .listen(PORT, () => {
    console.log(`🚀 Timely server is running on http://localhost:${PORT}`)
    console.log(`📁 Serving static files from: ${process.cwd()}/static`)
  })
