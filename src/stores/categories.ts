import { defineStore } from "pinia";
import { ref } from "vue";

export interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
}

export const useCategoryStore = defineStore("settings", () => {
  const categories = ref<Category[]>([
    {
      id: "worship",
      name: "Worship Services",
      color: "#3B82F6",
      keywords: ["service", "worship", "communion", "baptism"],
    },
    {
      id: "fellowship",
      name: "Fellowship",
      color: "#10B981",
      keywords: ["fellowship", "meeting", "group", "breakfast", "ministry"],
    },
    {
      id: "outreach",
      name: "Community Outreach",
      color: "#F59E0B",
      keywords: ["outreach", "community", "pantry", "mission", "volunteer"],
    },
    {
      id: "education",
      name: "Education & Study",
      color: "#8B5CF6",
      keywords: ["bible", "study", "school", "training", "children"],
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
