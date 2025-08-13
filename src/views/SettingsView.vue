<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <!-- Calendar Toggles Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Calendar Visibility</h2>
      <p class="text-base-content/70 mb-6">
        Choose which calendars to display in your view
      </p>

      <div class="space-y-4">
        <div
          v-for="calendar in calendars"
          :key="calendar.id"
          class="flex items-center justify-between p-4 bg-base-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="font-medium">{{ calendar.summary }}</span>
            <span v-if="calendar.primary" class="badge badge-primary badge-sm"
              >Primary</span
            >
          </div>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            :checked="calendar.isEnabled"
            @change="calendarStore.toggleCalendar(calendar.id)"
          />
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Event Categories</h2>
        <button class="btn btn-primary btn-sm" @click="showAddModal = true">
          Add Category
        </button>
      </div>
      <p class="text-base-content/70 mb-6">
        Manage categories for automatic event classification
      </p>

      <div class="space-y-3">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between p-4 bg-base-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: category.color }"
            ></div>
            <div>
              <h3 class="font-medium">{{ category.name }}</h3>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="keyword in category.keywords"
                  :key="keyword"
                  class="badge badge-sm badge-outline"
                >
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              class="btn btn-ghost btn-sm"
              @click="editCategory(category)"
            >
              Edit
            </button>
            <button
              class="btn btn-ghost btn-sm text-error"
              @click="confirmDelete(category)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <CategoryModal
      :is-open="showAddModal || showEditModal"
      :editing-category="editingCategory"
      @close="closeModal"
      @save="saveCategory"
    />

    <!-- Delete Confirmation Modal -->
    <dialog class="modal" :class="{ 'modal-open': showDeleteModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirm Deletion</h3>
        <p class="py-4">
          Are you sure you want to delete the category "{{
            categoryToDelete?.name
          }}"? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-error" @click="deleteCategory">Delete</button>
        </div>
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
        @click="showDeleteModal = false"
      >
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCalendarStore } from "@/stores/calendars";
import { useCategoryStore, type Category } from "@/stores/categories";
import CategoryModal, {
  type CategoryFormData,
} from "@/components/CategoryModal.vue";

const calendarStore = useCalendarStore();
const settingsStore = useCategoryStore();

const calendars = ref<any[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingCategory = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

const { categories } = settingsStore;

onMounted(async () => {
  calendars.value = await calendarStore.getCalendars();
});

function editCategory(category: Category) {
  editingCategory.value = category;
  showEditModal.value = true;
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category;
  showDeleteModal.value = true;
}

function deleteCategory() {
  if (categoryToDelete.value) {
    settingsStore.deleteCategory(categoryToDelete.value.id);
    showDeleteModal.value = false;
    categoryToDelete.value = null;
  }
}

function saveCategory(data: CategoryFormData) {
  if (editingCategory.value) {
    settingsStore.updateCategory(editingCategory.value.id, data);
  } else {
    settingsStore.addCategory(data);
  }
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  editingCategory.value = null;
}
</script>
