<template>
  <div class="min-h-screen bg-gradient-to-br from-primary to-secondary">
    <!-- Navigation -->
    <div class="navbar bg-base-100/90 backdrop-blur-sm">
      <div class="navbar-start">
        <a class="btn btn-ghost text-xl">⏰ Timely</a>
      </div>
      <div class="navbar-end">
        <a class="btn btn-ghost">Features</a>
        <a class="btn btn-primary">Get Started</a>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero min-h-[80vh]">
      <div class="hero-content text-center">
        <div class="max-w-4xl">
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
            Visualize How You
            <span class="text-accent">Spend Time</span>
          </h1>
          
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Import your Google Calendar, categorize events, and get beautiful insights 
            into where your time really goes.
          </p>

          <!-- Interactive Demo Button -->
          <div class="mb-12">
            <button 
              @click="showDemo = !showDemo"
              class="btn btn-accent btn-lg">
              {{ showDemo ? 'Hide Demo' : 'See Demo' }}
            </button>
          </div>

          <!-- Demo Content Area -->
          <div v-if="showDemo" class="card bg-base-100/50 backdrop-blur-sm shadow-xl mb-12">
            <div class="card-body">
              <h3 class="card-title justify-center text-accent mb-4">✨ Demo Preview</h3>
              <div class="grid gap-4">
                <div class="stat bg-blue-50">
                  <div class="stat-title">Work</div>
                  <div class="stat-value text-blue-600">32h</div>
                  <div class="stat-desc">Meetings, coding, planning</div>
                </div>
                <div class="stat bg-green-50">
                  <div class="stat-title">Personal</div>
                  <div class="stat-value text-green-600">18h</div>
                  <div class="stat-desc">Exercise, hobbies, errands</div>
                </div>
                <div class="stat bg-purple-50">
                  <div class="stat-title">Social</div>
                  <div class="stat-value text-purple-600">12h</div>
                  <div class="stat-desc">Friends, family, events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="py-16 bg-base-100">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body items-center text-center">
              <div class="text-4xl mb-4">📅</div>
              <h3 class="card-title">Google Calendar Import</h3>
              <p>Seamlessly connect your Google Calendar and import all your events automatically.</p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-xl">
            <div class="card-body items-center text-center">
              <div class="text-4xl mb-4">🏷️</div>
              <h3 class="card-title">Smart Categorization</h3>
              <p>Organize events into meaningful categories like work, personal, fitness, and more.</p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-xl">
            <div class="card-body items-center text-center">
              <div class="text-4xl mb-4">📊</div>
              <h3 class="card-title">Beautiful Visualizations</h3>
              <p>Get insights through charts and graphs showing how you spend your time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Category Demo -->
    <div class="py-16 bg-base-200">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-8">Try Categorizing an Event</h2>
          
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="mb-4">
                <div class="text-sm opacity-70 mb-1">Sample Event:</div>
                <div class="font-semibold text-lg">Team Meeting - Project Review</div>
                <div class="opacity-70">10:00 AM - 11:00 AM</div>
              </div>

              <div class="mb-4">
                <label class="label">
                  <span class="label-text font-medium">Choose Category:</span>
                </label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    @click="categorize('work')"
                    class="btn btn-outline btn-info">
                    💼 Work
                  </button>
                  <button 
                    @click="categorize('personal')"
                    class="btn btn-outline btn-success">
                    🏠 Personal
                  </button>
                  <button 
                    @click="categorize('social')"
                    class="btn btn-outline btn-secondary">
                    👥 Social
                  </button>
                </div>
              </div>

              <div v-if="selectedCategory" class="alert alert-success">
                <span>{{ categoryEmojis[selectedCategory] }} Event categorized as "{{ selectedCategory }}"!</span>
                <div class="text-sm opacity-70 mt-1">
                  "Team Meeting" has been added to your {{ selectedCategory }} activities.
                </div>
              </div>
              <div v-else class="alert">
                <span>Select a category to see the result</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-8 bg-base-300 text-base-content">
      <div>
        <p>&copy; 2024 Timely. Built with Vue 3, Tailwind CSS, and DaisyUI.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDemo = ref(false)
const selectedCategory = ref('')

const categoryEmojis: Record<string, string> = {
  work: '💼',
  personal: '🏠', 
  social: '👥'
}

const categorize = (category: string) => {
  selectedCategory.value = category
}
</script>