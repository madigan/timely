<template>
  <dialog class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{ editingCategory ? "Edit Category" : "Add New Category" }}
      </h3>

      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="label">
            <span class="label-text">Category Name</span>
          </label>
          <input
            type="text"
            class="input input-bordered w-full"
            v-model="form.name"
            required
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Color</span>
          </label>
          <input
            type="color"
            class="input input-bordered w-full h-12"
            v-model="form.color"
          />
        </div>

        <div>
          <label class="label">
            <span class="label-text">Keywords</span>
          </label>
          <div class="flex space-x-2 mb-2">
            <input
              type="text"
              class="input input-bordered flex-1"
              v-model="newKeyword"
              placeholder="Add keyword"
              @keydown.enter.prevent="addKeyword"
            />
            <button type="button" class="btn btn-outline" @click="addKeyword">
              Add
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(keyword, index) in form.keywords"
              :key="index"
              class="badge badge-primary gap-2"
            >
              {{ keyword }}
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                @click="removeKeyword(index)"
              >
                ✕
              </button>
            </span>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn" @click="handleClose">Cancel</button>
          <button type="submit" class="btn btn-primary">
            {{ editingCategory ? "Update" : "Create" }}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" @click="handleClose">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Category } from "@/stores/categories";

export interface CategoryFormData {
  name: string;
  color: string;
  keywords: string[];
}

interface Props {
  isOpen: boolean;
  editingCategory?: Category | null;
}

interface Emits {
  (e: "close"): void;
  (e: "save", data: CategoryFormData): void;
}

const props = withDefaults(defineProps<Props>(), {
  editingCategory: null,
});

const emit = defineEmits<Emits>();

const newKeyword = ref("");
const form = ref<CategoryFormData>({
  name: "",
  color: "#3B82F6",
  keywords: [],
});

// Watch for changes to editingCategory to populate form
watch(
  () => props.editingCategory,
  (category) => {
    if (category) {
      form.value = {
        name: category.name,
        color: category.color,
        keywords: [...category.keywords],
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Watch for modal close to reset form
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      newKeyword.value = "";
    }
  }
);

function addKeyword() {
  const keyword = newKeyword.value.trim();
  if (keyword && !form.value.keywords.includes(keyword)) {
    form.value.keywords.push(keyword);
    newKeyword.value = "";
  }
}

function removeKeyword(index: number) {
  form.value.keywords.splice(index, 1);
}

function handleSave() {
  emit("save", { ...form.value });
  handleClose();
}

function handleClose() {
  emit("close");
  resetForm();
}

function resetForm() {
  form.value = {
    name: "",
    color: "#3B82F6",
    keywords: [],
  };
  newKeyword.value = "";
}
</script>
