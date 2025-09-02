<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="importantEventsStore.isLoading" class="text-center py-4">
      <div class="loading loading-spinner loading-md"></div>
      <p class="mt-2 text-sm text-base-content/70">Loading settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="importantEventsStore.error" class="alert alert-error mb-4">
      <span>{{ importantEventsStore.error }}</span>
    </div>

    <!-- Settings Content -->
    <div v-else>
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
              @change="handleToggleEnabled"
              :disabled="isUpdating"
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
            @keyup.enter="handleAddKeyword"
            :disabled="!importantSettings.enabled || isUpdating"
          />
          <button
            class="btn btn-primary btn-sm"
            @click="handleAddKeyword"
            :disabled="!importantSettings.enabled || !newKeyword.trim() || isUpdating"
          >
            <span v-if="isUpdating" class="loading loading-spinner loading-xs"></span>
            Add
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="keyword in importantSettings.keywords"
            :key="keyword"
            class="badge badge-outline gap-2"
            :class="{ 'opacity-50': !importantSettings.enabled || isUpdating }"
          >
            {{ keyword }}
            <button
              class="text-xs hover:text-error"
              @click="handleRemoveKeyword(keyword)"
              :disabled="!importantSettings.enabled || isUpdating"
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
          max="20"
          :value="importantSettings.displayLimit"
          @input="handleUpdateDisplayLimit($event)"
          class="range range-primary range-sm w-full"
          :disabled="!importantSettings.enabled || isUpdating"
        />
      </div>

      <!-- Reset Button -->
      <div class="pt-4 border-t border-base-300">
        <button
          class="btn btn-outline btn-sm"
          @click="handleResetSettings"
          :disabled="!importantSettings.enabled || isUpdating"
        >
          <span v-if="isUpdating" class="loading loading-spinner loading-xs mr-2"></span>
          Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { onMounted, ref } from "vue"
import { useImportantEventsStore } from "@/stores/importantEvents"
import { useToastStore } from "@/stores/toast"

const importantEventsStore = useImportantEventsStore()
const { settings: importantSettings } = storeToRefs(importantEventsStore)
const toastStore = useToastStore()

const newKeyword = ref("")
const isUpdating = ref(false)

// Load settings on component mount
onMounted(async () => {
  try {
    await importantEventsStore.loadSettings()
  } catch (error) {
    console.error("Failed to load important event settings:", error)
  }
})

async function handleToggleEnabled() {
  isUpdating.value = true
  try {
    await importantEventsStore.toggleEnabled()
    toastStore.showToast("Settings updated successfully", "success")
  } catch (error) {
    toastStore.showToast("Failed to update settings", "error")
    console.error("Toggle enabled error:", error)
  } finally {
    isUpdating.value = false
  }
}

async function handleAddKeyword() {
  if (newKeyword.value.trim()) {
    isUpdating.value = true
    try {
      await importantEventsStore.addKeyword(newKeyword.value.trim())
      newKeyword.value = ""
      toastStore.showToast("Keyword added successfully", "success")
    } catch (error) {
      toastStore.showToast("Failed to add keyword", "error")
      console.error("Add keyword error:", error)
    } finally {
      isUpdating.value = false
    }
  }
}

async function handleRemoveKeyword(keyword: string) {
  isUpdating.value = true
  try {
    await importantEventsStore.removeKeyword(keyword)
    toastStore.showToast("Keyword removed successfully", "success")
  } catch (error) {
    toastStore.showToast("Failed to remove keyword", "error")
    console.error("Remove keyword error:", error)
  } finally {
    isUpdating.value = false
  }
}

async function handleUpdateDisplayLimit(event: Event) {
  const target = event.target as HTMLInputElement
  const limit = parseInt(target.value)

  isUpdating.value = true
  try {
    await importantEventsStore.setDisplayLimit(limit)
    toastStore.showToast("Display limit updated successfully", "success")
  } catch (error) {
    toastStore.showToast("Failed to update display limit", "error")
    console.error("Update display limit error:", error)
  } finally {
    isUpdating.value = false
  }
}

async function handleResetSettings() {
  isUpdating.value = true
  try {
    await importantEventsStore.resetToDefaults()
    toastStore.showToast("Settings reset to defaults", "success")
  } catch (error) {
    toastStore.showToast("Failed to reset settings", "error")
    console.error("Reset settings error:", error)
  } finally {
    isUpdating.value = false
  }
}
</script>