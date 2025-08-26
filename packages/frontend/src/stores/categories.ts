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
  const categories = ref<Category[]>([
    {
      id: "worship",
      name: "Worship Services",
      color: "#3B82F6",
      keywords: ["service", "worship", "communion", "baptism"],
      target: 40,
    },
    {
      id: "fellowship",
      name: "Fellowship",
      color: "#10B981",
      keywords: ["fellowship", "meeting", "group", "breakfast", "ministry"],
      target: 25,
    },
    {
      id: "outreach",
      name: "Community Outreach",
      color: "#F59E0B",
      keywords: ["outreach", "community", "pantry", "mission", "volunteer"],
      target: 20,
    },
    {
      id: "education",
      name: "Education & Study",
      color: "#8B5CF6",
      keywords: ["bible", "study", "school", "training", "children"],
      target: 10,
    },
    {
      id: "music",
      name: "Music & Arts",
      color: "#EC4899",
      keywords: ["choir", "practice", "music", "arts", "concert", "rehearsal"],
      target: 5,
    },
  ]);

  function addCategory(category: Omit<Category, "id">) {
    const id = `category-${Date.now()}`;
    categories.value.push({ ...category, id });
    return id;
  }

  function updateCategory(id: string, updates: Partial<Omit<Category, "id">>) {
    const index = categories.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates };
    }
  }

  function deleteCategory(id: string) {
    const index = categories.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories.value.splice(index, 1);
    }
  }

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
