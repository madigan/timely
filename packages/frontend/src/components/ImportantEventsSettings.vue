<template>
  <div class="space-y-4">
    <!-- Enable/Disable Toggle -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Important Events</h3>
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
    
    <p class="text-base-content/70 text-sm">
      Configure keywords to automatically identify and highlight important
      events at the beginning of each month
    </p>

    <!-- Keywords Management -->
    <div>
      <label class="block text-sm font-medium mb-2">Important Keywords</label>
      <div class="flex gap-2 mb-3">
        <input
          v-model="newKeyword"
          type="text"
          placeholder="Enter keyword"
          class="input input-bordered input-sm flex-1"
          @keyup.enter="addKeyword"
          :disabled="!importantSettings.enabled"
        />
        <button
          class="btn btn-primary btn-sm"
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
        Maximum events to show per month: {{ importantSettings.displayLimit }}
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
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useImportantEventsStore } from "@/stores/importantEvents"

const importantEventsStore = useImportantEventsStore()
const { settings: importantSettings } = importantEventsStore

const newKeyword = ref("")

function addKeyword() {
  if (newKeyword.value.trim()) {
    importantEventsStore.addKeyword(newKeyword.value.trim())
    newKeyword.value = ""
  }
}

function removeKeyword(keyword: string) {
  importantEventsStore.removeKeyword(keyword)
}

function updateDisplayLimit(event: Event) {
  const target = event.target as HTMLInputElement
  importantEventsStore.setDisplayLimit(parseInt(target.value))
}

function resetImportantSettings() {
  importantEventsStore.resetToDefaults()
}
</script>