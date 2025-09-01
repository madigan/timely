import { Elysia, t } from "elysia"
import {
  createCategory,
  deleteById,
  getCategoriesByUserId,
  updateCategory,
} from "../services/categories/categories.service.ts"
import { requireAuth } from "./auth.routes.ts"

// Category validation schema
const categorySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  color: t.RegExp(/^#[0-9A-Fa-f]{6}$/),
  keywords: t.Array(t.String()),
  target: t.Number({ minimum: 0, maximum: 100 }),
})

export const categoryRoutes = new Elysia({ prefix: "/api/categories" })
  .use(requireAuth())

  // Get all categories for authenticated user
  .get("/", async ({ userId, set }) => {
    try {
      const categories = await getCategoriesByUserId(userId)
      return { categories }
    } catch (error) {
      console.error("Error fetching categories:", error)
      set.status = 500
      return { error: "Failed to fetch categories" }
    }
  })

  // Create new category
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const [category] = await createCategory({
          userId,
          ...body,
        })

        set.status = 201
        return { category }
      } catch (error) {
        console.error("[Categories]", "Error creating category:", error)
        set.status = 500
        return { error: "Failed to create category" }
      }
    },
    {
      body: categorySchema,
    }
  )

  // Update existing category
  .put(
    "/:id",
    async ({ params, body, userId, set }) => {
      try {
        const [category] = await updateCategory({
          id: params.id,
          ...body,
          userId,
        })
        if (!category) {
          set.status = 404
          return { error: "Category not found" }
        }

        return { category }
      } catch (error) {
        console.error("Error updating category:", error)
        set.status = 500
        return { error: "Failed to update category" }
      }
    },
    {
      body: categorySchema,
    }
  )

  // Delete category
  .delete("/:id", async ({ params, userId, set }) => {
    try {
      const deletedId = await deleteById(userId, params.id)

      if (!deletedId) {
        set.status = 404
        return { error: "Category not found" }
      }

      set.status = 204
      return {}
    } catch (error) {
      console.error("Error deleting category:", error)
      set.status = 500
      return { error: "Failed to delete category" }
    }
  })
