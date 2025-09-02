import { defineStore } from "pinia"
import { ref } from "vue"
import { useToastStore } from "./toast"

/**
 * Settings for identifying and displaying important events
 */
export interface ImportantEventSettings {
  /** Array of keywords used to identify important events */
  keywords: string[]
  /** Whether the important events feature is enabled */
  enabled: boolean
  /** Maximum number of important events to display per month */
  displayLimit: number
}

interface ImportantEventSettingsResponse {
  id: string
  userId: string
  keywords: string[]
  enabled: boolean
  displayLimit: number
  createdAt: string
  updatedAt: string
}

export const useImportantEventsStore = defineStore("importantEvents", () => {
  const settings = ref<ImportantEventSettings>({
    keywords: ["important", "urgent", "critical", "deadline", "meeting", "board", "emergency"],
    enabled: true,
    displayLimit: 3,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  /**
   * Load settings from the API
   */
  async function loadSettings(): Promise<void> {
    if (initialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch("/api/important-events/settings", {
        credentials: "include",
      })

      if (response.ok) {
        const data: ImportantEventSettingsResponse = await response.json()
        settings.value = {
          keywords: data.keywords,
          enabled: data.enabled,
          displayLimit: data.displayLimit,
        }
        initialized.value = true
      } else {
        throw new Error(`Failed to load settings: ${response.statusText}`)
      }
    } catch (err) {
      const toastStore = useToastStore()
      console.error("Error loading important event settings:", err)
      error.value = err instanceof Error ? err.message : "Failed to load settings"
      
      // Show user-friendly error message
      toastStore.showToast("Failed to load important events settings. Using defaults.", "warning")
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save settings to the API
   */
  async function saveSettings(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch("/api/important-events/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings.value),
      })

      if (response.ok) {
        const data: ImportantEventSettingsResponse = await response.json()
        // Update local settings with server response to ensure consistency
        settings.value = {
          keywords: data.keywords,
          enabled: data.enabled,
          displayLimit: data.displayLimit,
        }
      } else {
        throw new Error(`Failed to save settings: ${response.statusText}`)
      }
    } catch (err) {
      const toastStore = useToastStore()
      console.error("Error saving important event settings:", err)
      error.value = err instanceof Error ? err.message : "Failed to save settings"
      toastStore.showToast("Failed to save important events settings. Please try again.", "error")
      throw err // Re-throw so UI can handle the error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Add a new keyword for identifying important events
   */
  async function addKeyword(keyword: string): Promise<void> {
    const trimmed = keyword.trim().toLowerCase()
    if (trimmed && !settings.value.keywords.includes(trimmed)) {
      settings.value.keywords.push(trimmed)
      await saveSettings()
    }
  }

  /**
   * Remove a keyword from the important events list
   */
  async function removeKeyword(keyword: string): Promise<void> {
    const index = settings.value.keywords.indexOf(keyword.toLowerCase())
    if (index !== -1) {
      settings.value.keywords.splice(index, 1)
      await saveSettings()
    }
  }

  /**
   * Toggle whether important events feature is enabled
   */
  async function toggleEnabled(): Promise<void> {
    settings.value.enabled = !settings.value.enabled
    await saveSettings()
  }

  /**
   * Set the maximum number of important events to display per month
   */
  async function setDisplayLimit(limit: number): Promise<void> {
    if (limit > 0 && limit <= 20) {
      settings.value.displayLimit = limit
      await saveSettings()
    }
  }

  /**
   * Reset settings to defaults
   */
  async function resetToDefaults(): Promise<void> {
    settings.value = {
      keywords: ["important", "urgent", "critical", "deadline", "meeting", "board", "emergency"],
      enabled: true,
      displayLimit: 3,
    }
    await saveSettings()
  }

  return {
    settings,
    isLoading,
    error,
    initialized,
    loadSettings,
    addKeyword,
    removeKeyword,
    toggleEnabled,
    setDisplayLimit,
    resetToDefaults,
  }
})
