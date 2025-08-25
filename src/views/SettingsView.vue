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
          class="p-4 bg-base-200 rounded-lg"
        >
          <div class="flex items-center justify-between mb-3">
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
          
          <!-- Target Percentage Progress Bar -->
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-base-content/70 min-w-fit">Target:</span>
            <div class="flex items-center space-x-2 flex-1">
              <span class="text-xs text-base-content/60 min-w-fit">0%</span>
              <div class="flex-1 bg-base-300 rounded-full h-3 relative">
                <div
                  class="h-3 rounded-full transition-all duration-300 relative"
                  :style="{ 
                    width: category.target + '%',
                    backgroundColor: category.color 
                  }"
                >
                  <span 
                    class="absolute right-0 top-0 h-full flex items-center pr-2 text-xs font-medium text-white"
                    v-if="category.target > 15"
                  >
                    {{ category.target }}%
                  </span>
                </div>
                <span 
                  class="absolute top-0 h-full flex items-center text-xs font-medium"
                  :style="{ left: category.target + '%' }"
                  v-if="category.target <= 15"
                >
                  <span class="ml-1 text-base-content">{{ category.target }}%</span>
                </span>
              </div>
              <span class="text-xs text-base-content/60 min-w-fit">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Events Section -->
    <div class="bg-base-100 rounded-lg shadow-sm p-6 mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Important Events</h2>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-3">Enable</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              :checked="importantSettings.enabled"
              @change="importantEventsStore.toggleEnabled()"
            />
          </label>
        </div>
      </div>
      <p class="text-base-content/70 mb-6">
        Configure keywords to automatically identify and highlight important
        events at the beginning of each month
      </p>

      <div class="space-y-4">
        <!-- Keywords Management -->
        <div>
          <label class="block text-sm font-medium mb-2"
            >Important Keywords</label
          >
          <div class="flex gap-2 mb-3">
            <input
              v-model="newKeyword"
              type="text"
              placeholder="Enter keyword"
              class="input input-bordered flex-1"
              @keyup.enter="addKeyword"
              :disabled="!importantSettings.enabled"
            />
            <button
              class="btn btn-primary"
              @click="addKeyword"
              :disabled="!importantSettings.enabled || !newKeyword.trim()"
            >
              Add
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="keyword in importantSettings.keywords"
              :key="keyword"
              class="badge badge-outline gap-2"
              :class="{ 'opacity-50': !importantSettings.enabled }"
            >
              {{ keyword }}
              <button
                class="text-xs hover:text-error"
                @click="removeKeyword(keyword)"
                :disabled="!importantSettings.enabled"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Display Limit -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Maximum events to show per month:
            {{ importantSettings.displayLimit }}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            :value="importantSettings.displayLimit"
            @input="updateDisplayLimit($event)"
            class="range range-primary range-sm w-full"
            :disabled="!importantSettings.enabled"
          />
        </div>

        <!-- Reset Button -->
        <div class="pt-4 border-t border-base-300">
          <button
            class="btn btn-outline btn-sm"
            @click="resetImportantSettings"
            :disabled="!importantSettings.enabled"
          >
            Reset to Defaults
          </button>
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
import { useImportantEventsStore } from "@/stores/importantEvents";
import CategoryModal, {
  type CategoryFormData,
} from "@/components/CategoryModal.vue";

const calendarStore = useCalendarStore();
const settingsStore = useCategoryStore();
const importantEventsStore = useImportantEventsStore();

const calendars = ref<any[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingCategory = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

const { categories } = settingsStore;
const { settings: importantSettings } = importantEventsStore;

// Important events reactive variables
const newKeyword = ref("");

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

// Important Events Functions
function addKeyword() {
  if (newKeyword.value.trim()) {
    importantEventsStore.addKeyword(newKeyword.value.trim());
    newKeyword.value = "";
  }
}

function removeKeyword(keyword: string) {
  importantEventsStore.removeKeyword(keyword);
}

function updateDisplayLimit(event: Event) {
  const target = event.target as HTMLInputElement;
  importantEventsStore.setDisplayLimit(parseInt(target.value));
}

function resetImportantSettings() {
  importantEventsStore.resetToDefaults();
}
</script>
