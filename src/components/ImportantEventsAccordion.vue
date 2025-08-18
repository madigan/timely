<template>
  <div v-if="enabled && events.length > 0" class="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg print:bg-white print:border-gray-300">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-warning">⭐</span>
      <h3 class="text-sm font-semibold text-warning-content">Important Events This Month</h3>
    </div>
    <TransitionGroup 
      name="accordion-list"
      tag="div" 
      class="space-y-1"
      move-class="transition-transform duration-300 ease-out"
    >
      <div 
        v-for="event in events" 
        :key="event.id || event.summary"
        class="bg-base-100 border border-warning/20 rounded overflow-hidden print:border-gray-200"
      >
        <!-- Accordion Header -->
        <div 
          class="flex items-center justify-between text-xs px-2 py-1 cursor-pointer hover:bg-warning/10 transition-colors"
          @click="toggleEventExpansion(event.id || event.summary)"
        >
          <div class="flex items-center gap-2 flex-1">
            <span 
              class="text-warning transition-transform duration-200"
              :class="{ 'rotate-90': isEventExpanded(event.id || event.summary) }"
            >
              ▶
            </span>
            <span class="font-medium text-base-content flex-1" :title="event.summary">
              {{ shortenEventTitle(event.summary, 30) }}
            </span>
          </div>
          <span class="text-warning ml-2 whitespace-nowrap">
            {{ formatEventDateTime(event) }}
          </span>
        </div>
        
        <!-- Accordion Content -->
        <Transition 
          name="accordion"
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div 
            v-if="isEventExpanded(event.id || event.summary)"
            class="px-2 pb-2 pt-1 bg-warning/5 border-t border-warning/20 text-xs overflow-hidden"
          >
            <div v-if="event.location" class="mb-1">
              <span class="font-medium text-warning-content">📍 Location:</span>
              <span class="text-base-content/80 ml-1">{{ event.location }}</span>
            </div>
            <div v-if="event.description" class="text-base-content/80">
              <span class="font-medium text-warning-content">📋 Description: </span>
              <span class="mt-1 text-base-content/70 leading-relaxed">{{ event.description }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { formatEventDateTime, shortenEventTitle } from "@/utils/events";

interface Props {
  events: any[];
  enabled: boolean;
  monthKey: string;
}

interface Emits {
  (e: 'eventExpanded', eventId: string, monthKey: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state for expanded events (per accordion instance)
const expandedEvent = ref<string | null>(null);

function toggleEventExpansion(eventId: string) {
  if (expandedEvent.value === eventId) {
    // If this event is already expanded, collapse it
    expandedEvent.value = null;
  } else {
    // Expand this event (automatically collapses any other expanded event)
    expandedEvent.value = eventId;
  }
  
  // Emit event for parent component tracking if needed
  emit('eventExpanded', eventId, props.monthKey);
}

function isEventExpanded(eventId: string): boolean {
  return expandedEvent.value === eventId;
}
</script>