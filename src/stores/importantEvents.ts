import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * Settings for identifying and displaying important events
 */
export interface ImportantEventSettings {
  /** Array of keywords used to identify important events */
  keywords: string[];
  /** Whether the important events feature is enabled */
  enabled: boolean;
  /** Maximum number of important events to display per month */
  displayLimit: number;
}

export const useImportantEventsStore = defineStore("importantEvents", () => {
  const settings = ref<ImportantEventSettings>({
    keywords: ["important", "urgent", "critical", "deadline", "meeting", "board", "emergency"],
    enabled: true,
    displayLimit: 5,
  });

  /**
   * Add a new keyword for identifying important events
   */
  function addKeyword(keyword: string) {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !settings.value.keywords.includes(trimmed)) {
      settings.value.keywords.push(trimmed);
    }
  }

  /**
   * Remove a keyword from the important events list
   */
  function removeKeyword(keyword: string) {
    const index = settings.value.keywords.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      settings.value.keywords.splice(index, 1);
    }
  }

  /**
   * Toggle whether important events feature is enabled
   */
  function toggleEnabled() {
    settings.value.enabled = !settings.value.enabled;
  }

  /**
   * Set the maximum number of important events to display per month
   */
  function setDisplayLimit(limit: number) {
    if (limit > 0 && limit <= 20) {
      settings.value.displayLimit = limit;
    }
  }

  /**
   * Reset settings to defaults
   */
  function resetToDefaults() {
    settings.value = {
      keywords: ["important", "urgent", "critical", "deadline", "meeting", "board", "emergency"],
      enabled: true,
      displayLimit: 5,
    };
  }

  return {
    settings,
    addKeyword,
    removeKeyword,
    toggleEnabled,
    setDisplayLimit,
    resetToDefaults,
  };
});