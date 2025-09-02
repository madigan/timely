import { cors } from "@elysiajs/cors"
import { Elysia, file } from "elysia"
import { existsSync } from "fs"
import path from "path"
import { ENCRYPTION_KEY } from "./env.ts"
import { authRoutes } from "./services/auth/auth.routes.ts"
import { calendarRoutes } from "./services/calendar/calendar.routes.ts"
import { categoryRoutes } from "./services/categories/categories.routes.ts"
import healthRoutes from "./services/health/health.routes.ts"
import { importantEventsRoutes } from "./services/importantEvents/importantEvents.routes.ts"

// Helper function to serve index.html for SPA routes
function serveIndexHtml() {
  const productionPath = "./static/index.html"
  const developmentPath = "../frontend/dist/index.html"
  
  const productionExists = existsSync(path.resolve(productionPath))
  const developmentExists = existsSync(path.resolve(developmentPath))
  
  console.log("Static file check:", {
    productionPath: path.resolve(productionPath),
    productionExists,
    developmentPath: path.resolve(developmentPath),
    developmentExists,
    cwd: process.cwd()
  })
  
  if (productionExists) {
    console.log("Serving from production path:", productionPath)
    return file(productionPath)
  } else if (developmentExists) {
    console.log("Serving from development path:", developmentPath)
    return file(developmentPath)
  } else {
    console.error("No index.html found in either location!")
    throw new Error("index.html not found")
  }
}

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
      pathname: new URL(request.url).pathname
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
  // Handle static assets explicitly
  .get("/assets/*", ({ request }) => {
    const pathname = new URL(request.url).pathname
    const assetPath = pathname.replace("/assets/", "")
    
    const productionPath = `./static/assets/${assetPath}`
    const developmentPath = `../frontend/dist/assets/${assetPath}`
    
    console.log("Asset request:", {
      pathname,
      assetPath,
      productionPath: path.resolve(productionPath),
      developmentPath: path.resolve(developmentPath),
      productionExists: existsSync(path.resolve(productionPath)),
      developmentExists: existsSync(path.resolve(developmentPath))
    })
    
    if (existsSync(path.resolve(productionPath))) {
      return file(productionPath)
    } else if (existsSync(path.resolve(developmentPath))) {
      return file(developmentPath)
    } else {
      throw new Error("Asset not found")
    }
  })
  // Handle favicon explicitly
  .get("/favicon.ico", () => {
    const productionPath = "./static/favicon.ico"
    const developmentPath = "../frontend/dist/favicon.ico"
    
    if (existsSync(path.resolve(productionPath))) {
      return file(productionPath)
    } else if (existsSync(path.resolve(developmentPath))) {
      return file(developmentPath)
    } else {
      throw new Error("Favicon not found")
    }
  })
  .get("/", serveIndexHtml)
  .get("/settings", serveIndexHtml)
  .get("/calendar", serveIndexHtml)
  // Catch-all route for SPA - this should be last
  .get("/*", ({ request }) => {
    const pathname = new URL(request.url).pathname
    console.log("Catch-all route hit for:", pathname)
    
    // Don't serve index.html for API routes or other static files
    if (pathname.startsWith("/api/") || pathname.includes(".")) {
      throw new Error("NOT_FOUND")
    }
    
    return serveIndexHtml()
  })

export default server
