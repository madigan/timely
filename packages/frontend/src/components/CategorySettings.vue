<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Event Categories</h3>
      <button class="btn btn-primary btn-sm" @click="$emit('add-category')">
        Add Category
      </button>
    </div>
    
    <p class="text-base-content/70 text-sm">
      Manage categories for automatic event classification
    </p>

    <!-- Categories List -->
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
              <h4 class="font-medium">{{ category.name }}</h4>
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
              @click="$emit('edit-category', category)"
            >
              Edit
            </button>
            <button
              class="btn btn-ghost btn-sm text-error"
              @click="$emit('delete-category', category)"
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
</template>

<script setup lang="ts">
import type { Category } from "@/stores/categories";

interface Props {
  categories: Category[];
}

defineProps<Props>();

defineEmits<{
  'add-category': [];
  'edit-category': [category: Category];
  'delete-category': [category: Category];
}>();
</script>