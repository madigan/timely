<template>
  <div id="features" class="py-20 bg-base-200">
    <div class="max-w-6xl mx-auto px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-base-content mb-4">
          Perfect for Church Communities
        </h2>
        <p class="text-xl text-base-content/70 max-w-2xl mx-auto">
          Designed specifically for pastors and church administrators who need efficient calendar management.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📅</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Smart Calendar Integration</h3>
          <p class="text-base-content/70">
            Connect multiple church calendars and manage them all in one unified view.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🏷️</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Automatic Categorization</h3>
          <p class="text-base-content/70">
            Events are automatically sorted into worship, fellowship, outreach, and education categories.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📊</span>
          </div>
          <h3 class="text-xl font-bold mb-3">Visual Insights</h3>
          <p class="text-base-content/70">
            See at a glance how your church activities are distributed across different ministries.
          </p>
        </div>
      </div>
      
      <div class="bg-base-100 rounded-lg p-8">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 class="text-2xl font-bold mb-4">Built for Ministry Leaders</h3>
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
                <span>Manage worship services, Bible studies, and prayer meetings</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                <span>Track youth ministry, women's ministry, and men's groups</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-accent rounded-full mr-3"></span>
                <span>Organize community outreach and mission activities</span>
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-warning rounded-full mr-3"></span>
                <span>Schedule volunteer training and leadership meetings</span>
              </li>
            </ul>
          </div>
          
          <div class="mockup-code">
            <pre data-prefix="$"><code>church-main: 85 events</code></pre>
            <pre data-prefix=">" class="text-primary"><code>youth-ministry: 45 events</code></pre>
            <pre data-prefix=">" class="text-secondary"><code>worship-team: 62 events</code></pre>
            <pre data-prefix=">" class="text-accent"><code>community-outreach: 38 events</code></pre>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <button class="btn btn-primary btn-lg" @click="$emit('getStarted')">
          Start Managing Your Church Calendar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Emits = (e: "getStarted") => void

defineEmits<Emits>()
</script>