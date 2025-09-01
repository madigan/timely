import { Elysia, t } from 'elysia';
import { sql } from '../db/database.ts';
import { initializeUserCategories } from '../services/categories/categories.service.ts';
import { requireAuth } from './auth.ts';

// Category validation schema
const categorySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  color: t.RegExp(/^#[0-9A-Fa-f]{6}$/),
  keywords: t.Array(t.String()),
  target: t.Number({ minimum: 0, maximum: 100 })
});





export const categoryRoutes = new Elysia({ prefix: '/api/categories' })
  .use(requireAuth())
  // Get all categories for authenticated user
  .get('/', async ({ userId, set }) => {

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
  .post('/', async ({ body, userId, set }) => {

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
  .put('/:id', async ({ params, body, userId, set }) => {

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
  .delete('/:id', async ({ params, userId, set }) => {

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