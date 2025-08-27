import { Elysia, t } from 'elysia';
import { sql } from '../db/database.js';

// Default categories that new users receive
const DEFAULT_CATEGORIES = [
  {
    id: 'worship',
    name: 'Worship Services',
    color: '#3B82F6',
    keywords: ['worship', 'service', 'sunday', 'mass', 'sermon', 'prayer meeting'],
    target: 40
  },
  {
    id: 'fellowship',
    name: 'Fellowship',
    color: '#10B981',
    keywords: ['fellowship', 'social', 'community', 'potluck', 'gathering', 'small group'],
    target: 25
  },
  {
    id: 'outreach',
    name: 'Community Outreach',
    color: '#F59E0B',
    keywords: ['outreach', 'mission', 'volunteer', 'community service', 'evangelism', 'food bank'],
    target: 20
  },
  {
    id: 'education',
    name: 'Education & Study',
    color: '#8B5CF6',
    keywords: ['bible study', 'education', 'class', 'seminar', 'training', 'conference'],
    target: 10
  },
  {
    id: 'arts',
    name: 'Music & Arts',
    color: '#EC4899',
    keywords: ['music', 'choir', 'band', 'art', 'creative', 'performance'],
    target: 5
  }
];

// Category validation schema
const categorySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  color: t.RegExp(/^#[0-9A-Fa-f]{6}$/),
  keywords: t.Array(t.String()),
  target: t.Number({ minimum: 0, maximum: 100 })
});

// Get user ID from session cookie
async function getUserId(cookie: any): Promise<string | null> {
  const sessionId = cookie.session?.value;
  if (!sessionId) return null;
  
  try {
    const [session] = await sql`
      SELECT user_id FROM sessions 
      WHERE session_id = ${sessionId} AND expires_at > NOW()
    `;
    return session?.user_id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// Initialize default categories for new user
async function initializeUserCategories(userId: string): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    await sql`
      INSERT INTO categories (id, user_id, name, color, keywords, target)
      VALUES (${category.id}, ${userId}, ${category.name}, ${category.color}, ${category.keywords}, ${category.target})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export const categoryRoutes = new Elysia({ prefix: '/api/categories' })
  // Get all categories for authenticated user
  .get('/', async ({ cookie, set }) => {
    const sessionId = cookie.session?.value;
    if (!sessionId) {
      set.status = 401;
      return { error: 'No session cookie found' };
    }

    const userId = await getUserId(cookie);
    if (!userId) {
      set.status = 401;
      return { error: 'Invalid session' };
    }

    try {
      const categories = await sql`
        SELECT id, name, color, keywords, target, created_at, updated_at
        FROM categories 
        WHERE user_id = ${userId}
        ORDER BY name
      `;

      // If user has no categories, initialize with defaults
      if (categories.length === 0) {
        await initializeUserCategories(userId);
        const defaultCategories = await sql`
          SELECT id, name, color, keywords, target, created_at, updated_at
          FROM categories 
          WHERE user_id = ${userId}
          ORDER BY name
        `;
        return { categories: defaultCategories };
      }

      return { categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      set.status = 500;
      return { error: 'Failed to fetch categories' };
    }
  })

  // Create new category
  .post('/', async ({ body, cookie, set }) => {
    const userId = await getUserId(cookie);
    if (!userId) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    try {
      const [category] = await sql`
        INSERT INTO categories (user_id, name, color, keywords, target)
        VALUES (${userId}, ${body.name}, ${body.color}, ${body.keywords}, ${body.target})
        RETURNING id, name, color, keywords, target, created_at, updated_at
      `;

      set.status = 201;
      return { category };
    } catch (error) {
      console.error('Error creating category:', error);
      set.status = 500;
      return { error: 'Failed to create category' };
    }
  }, {
    body: categorySchema
  })

  // Update existing category
  .put('/:id', async ({ params, body, cookie, set }) => {
    const userId = await getUserId(cookie);
    if (!userId) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    try {
      const [category] = await sql`
        UPDATE categories 
        SET name = ${body.name}, 
            color = ${body.color}, 
            keywords = ${body.keywords}, 
            target = ${body.target},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${params.id} AND user_id = ${userId}
        RETURNING id, name, color, keywords, target, created_at, updated_at
      `;

      if (!category) {
        set.status = 404;
        return { error: 'Category not found' };
      }

      return { category };
    } catch (error) {
      console.error('Error updating category:', error);
      set.status = 500;
      return { error: 'Failed to update category' };
    }
  }, {
    body: categorySchema
  })

  // Delete category
  .delete('/:id', async ({ params, cookie, set }) => {
    const userId = await getUserId(cookie);
    if (!userId) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    try {
      const [deletedCategory] = await sql`
        DELETE FROM categories 
        WHERE id = ${params.id} AND user_id = ${userId}
        RETURNING id
      `;

      if (!deletedCategory) {
        set.status = 404;
        return { error: 'Category not found' };
      }

      set.status = 204;
      return {};
    } catch (error) {
      console.error('Error deleting category:', error);
      set.status = 500;
      return { error: 'Failed to delete category' };
    }
  });