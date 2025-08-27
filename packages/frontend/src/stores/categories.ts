import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * Represents a category for organizing and tracking church events
 */
export interface Category {
  /** 
   * Unique identifier for the category
   * @example "worship", "fellowship", "outreach"
   */
  id: string;
  
  /** 
   * Human-readable display name for the category
   * @example "Worship Services", "Community Outreach", "Bible Study"
   */
  name: string;
  
  /** 
   * Color for visual representation as a CSS hex color value
   * @example "#3B82F6", "#10B981", "#F59E0B"
   */
  color: string;
  
  /** 
   * Array of keywords used for automatic event categorization
   * Events containing these keywords in their title or description will be assigned to this category
   * @example ["service", "worship", "communion"], ["bible", "study", "training"]
   */
  keywords: string[];
  
  /** 
   * Target percentage (0-100) of time that should be dedicated to this category
   * Used for ministry planning and progress tracking
   * @example 40 (for 40%), 25 (for 25%)
   */
  target: number;
}

export const useCategoryStore = defineStore("settings", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // API base URL
  const API_BASE = '/api';

  // Fetch categories from API
  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      
      const data = await response.json();
      categories.value = data.categories;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      console.error('Error fetching categories:', err);
    } finally {
      loading.value = false;
    }
  }

  async function addCategory(category: Omit<Category, "id">) {
    error.value = null;
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(category)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create category: ${response.statusText}`);
      }
      
      const data = await response.json();
      categories.value.push(data.category);
      return data.category.id;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create category';
      console.error('Error creating category:', err);
      throw err;
    }
  }

  async function updateCategory(id: string, updates: Partial<Omit<Category, "id">>) {
    error.value = null;
    
    // Find the current category for optimistic update
    const index = categories.value.findIndex((c) => c.id === id);
    if (index === -1) return;
    
    const originalCategory = { ...categories.value[index] };
    
    // Optimistic update
    categories.value[index] = { ...categories.value[index], ...updates };
    
    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...originalCategory, ...updates })
      });
      
      if (!response.ok) {
        // Revert optimistic update on failure
        categories.value[index] = originalCategory;
        throw new Error(`Failed to update category: ${response.statusText}`);
      }
      
      const data = await response.json();
      categories.value[index] = data.category;
    } catch (err) {
      // Revert optimistic update on error
      categories.value[index] = originalCategory;
      error.value = err instanceof Error ? err.message : 'Failed to update category';
      console.error('Error updating category:', err);
      throw err;
    }
  }

  async function deleteCategory(id: string) {
    error.value = null;
    
    // Find the category for optimistic delete
    const index = categories.value.findIndex((c) => c.id === id);
    if (index === -1) return;
    
    const deletedCategory = categories.value[index];
    
    // Optimistic delete
    categories.value.splice(index, 1);
    
    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Revert optimistic delete on failure
        categories.value.splice(index, 0, deletedCategory);
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }
    } catch (err) {
      // Revert optimistic delete on error
      categories.value.splice(index, 0, deletedCategory);
      error.value = err instanceof Error ? err.message : 'Failed to delete category';
      console.error('Error deleting category:', err);
      throw err;
    }
  }

  // Initialize categories on store creation
  fetchCategories();

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
