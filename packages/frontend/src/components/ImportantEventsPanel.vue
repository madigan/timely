<template>
  <div class="p-3 bg-info/10 border border-info/30 rounded-lg print:bg-white print:border-gray-300 h-full">
    <!-- Loading State -->
    <ImportantEventsSkeleton v-if="isLoading" />
    
    <!-- Loaded Content -->
    <div v-else>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-info">⭐</span>
          <h3 class="text-sm font-semibold text-info-content">Important Events</h3>
        </div>
        <button 
          class="btn btn-ghost btn-xs text-info hover:bg-info/20 print:hidden"
          @click="$emit('open-settings')"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      <div v-if="events.length === 0" class="flex items-center justify-center h-20 text-sm text-base-content/50">
        No important events in this timeframe.
      </div>
    
    <TransitionGroup v-else 
      name="accordion-list"
      tag="div" 
      class="space-y-1"
      move-class="transition-transform duration-300 ease-out"
    >
       <div 
         v-for="event in events" 
         :key="event.id || event.summary"
         class="bg-base-100 border border-info/20 rounded overflow-hidden print:border-gray-200"
       >
        <!-- Accordion Header -->
         <div 
           class="flex items-center justify-between text-xs px-2 py-1 cursor-pointer hover:bg-info/10 transition-colors"
           @click="toggleEventExpansion(event.id || event.summary)"
         >
          <div class="flex items-center gap-2 flex-1">
             <span 
               class="text-info transition-transform duration-200"
               :class="{ 'rotate-90': isEventExpanded(event.id || event.summary) }"
             >
              ▶
            </span>
            <span class="font-medium text-base-content flex-1" :title="event.summary">
              {{ shortenEventTitle(event.summary, 30) }}
            </span>
          </div>
           <span class="text-info ml-2 whitespace-nowrap">
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
            class="px-2 pb-2 pt-1 bg-info/5 border-t border-info/20 text-xs overflow-hidden"
          >
            <div v-if="event.location" class="mb-1">
               <span class="font-medium text-info-content">📍 Location:</span>
              <span class="text-base-content/80 ml-1">{{ event.location }}</span>
            </div>
            <div v-if="event.description" class="text-base-content/80">
               <span class="font-medium text-info-content">📋 Description: </span>
              <span class="mt-1 text-base-content/70 leading-relaxed">{{ event.description }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { formatEventDateTime, shortenEventTitle } from "@/utils/events"
import ImportantEventsSkeleton from "./skeletons/ImportantEventsSkeleton.vue"

interface Props {
  events: any[]
  monthKey: string
  isLoading?: boolean
}

interface Emits {
  (e: "eventExpanded", eventId: string, monthKey: string): void
  (e: "open-settings"): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state for expanded events (per accordion instance)
const expandedEvent = ref<string | null>(null)

function toggleEventExpansion(eventId: string) {
  if (expandedEvent.value === eventId) {
    // If this event is already expanded, collapse it
    expandedEvent.value = null
  } else {
    // Expand this event (automatically collapses any other expanded event)
    expandedEvent.value = eventId
  }

  // Emit event for parent component tracking if needed
  emit("eventExpanded", eventId, props.monthKey)
}

function isEventExpanded(eventId: string): boolean {
  return expandedEvent.value === eventId
}
</script>