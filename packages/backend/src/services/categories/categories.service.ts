import { sql } from "../../db/database.ts";

export interface Category {
    id:string;
    name:string;
    color:string;
    keywords:string[];
    target: number;
}

// Default categories that new users receive
const DEFAULT_CATEGORIES = [
  {
    name: "Worship Services",
    color: "#3B82F6",
    keywords: [
      "worship",
      "service",
      "sunday",
      "mass",
      "sermon",
      "prayer meeting",
    ],
    target: 40,
  },
  {
    name: "Fellowship",
    color: "#10B981",
    keywords: [
      "fellowship",
      "social",
      "community",
      "potluck",
      "gathering",
      "small group",
    ],
    target: 25,
  },
  {
    name: "Community Outreach",
    color: "#F59E0B",
    keywords: [
      "outreach",
      "mission",
      "volunteer",
      "community service",
      "evangelism",
      "food bank",
    ],
    target: 20,
  },
  {
    name: "Education & Study",
    color: "#8B5CF6",
    keywords: [
      "bible study",
      "education",
      "class",
      "seminar",
      "training",
      "conference",
    ],
    target: 10,
  },
  {
    name: "Music & Arts",
    color: "#EC4899",
    keywords: ["music", "choir", "band", "art", "creative", "performance"],
    target: 5,
  },
 ];

// Initialize default categories for new user
export async function initializeUserCategories(userId: string): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    await sql`
      INSERT INTO categories (user_id, name, color, keywords, target)
      VALUES (${userId}, ${category.name}, ${category.color}, ${category.keywords}, ${category.target})
    `;
  }
}

export async function getCategoriesByUserId(userId:string):Promise<Category[]> {
    return await sql`
        SELECT id, name, color, keywords, target, created_at, updated_at
        FROM categories 
        WHERE user_id = ${userId}
        ORDER BY name
      `.then(results => results.map());
}