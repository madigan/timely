import assert from "node:assert"
import { sql } from "../db/database.service.ts"

export interface Category {
  id: string
  name: string
  color: string
  keywords: string[]
  target: number
}

// Default categories that new users receive
const DEFAULT_CATEGORIES = [
  {
    name: "Worship Services",
    color: "#3B82F6",
    keywords: ["worship", "service", "sunday", "mass", "sermon", "prayer meeting"],
    target: 40,
  },
  {
    name: "Fellowship",
    color: "#10B981",
    keywords: ["fellowship", "social", "community", "potluck", "gathering", "small group"],
    target: 25,
  },
  {
    name: "Community Outreach",
    color: "#F59E0B",
    keywords: ["outreach", "mission", "volunteer", "community service", "evangelism", "food bank"],
    target: 20,
  },
  {
    name: "Education & Study",
    color: "#8B5CF6",
    keywords: ["bible study", "education", "class", "seminar", "training", "conference"],
    target: 10,
  },
  {
    name: "Music & Arts",
    color: "#EC4899",
    keywords: ["music", "choir", "band", "art", "creative", "performance"],
    target: 5,
  },
]

// Initialize default categories for new user
export async function initializeUserCategories(userId: string): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    try {
      // Convert JavaScript array to PostgreSQL array format
      const keywordsArray = `{${category.keywords.map((k) => `"${k}"`).join(",")}}`

      await sql`
        INSERT INTO categories (user_id, name, color, keywords, target)
        VALUES (${userId}, ${category.name}, ${category.color}, ${keywordsArray}, ${category.target})
      `
    } catch (error) {
      console.error("Error inserting category:", category.name, error)
      throw error
    }
  }
}

export async function getCategoriesByUserId(userId: string): Promise<Category[]> {
  return await sql`
        SELECT id, name, color, keywords, target, created_at, updated_at
        FROM categories 
        WHERE user_id = ${userId}
        ORDER BY name
      `
}

export async function deleteById(userId: string, categoryId: string): Promise<string> {
  const [deletedId] = await sql`
    DELETE FROM categories 
    WHERE id = ${categoryId} AND user_id = ${userId}
    RETURNING id
  `
  return deletedId
}

export async function updateCategory({
  id,
  name,
  color,
  keywords,
  target,
  userId,
}: {
  id: string
  name: string
  color: string
  keywords: string[]
  target: number
  userId: string
}) {
  const keywordsArray = `{${keywords.map((k: string) => `"${k}"`).join(",")}}`

  const [updatedCategory] = await sql`
    UPDATE categories 
    SET name = ${name}, 
      color = ${color}, 
      keywords = ${keywordsArray}, 
      target = ${target},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id, name, color, keywords, target, created_at, updated_at
  `

  return updatedCategory
}

export async function createCategory({
  userId,
  name,
  color,
  keywords,
  target,
}: {
  userId: string
  name: string
  color: string
  keywords: string[]
  target: number
}) {
  const keywordsArray = `{${keywords.map((k: string) => `"${k}"`).join(",")}}`
  const [category] = await sql`
        INSERT INTO categories (user_id, name, color, keywords, target)
        VALUES (${userId}, ${name}, ${color}, ${keywordsArray}, ${target})
        RETURNING id, name, color, keywords, target, created_at, updated_at
      `
  return category
}
