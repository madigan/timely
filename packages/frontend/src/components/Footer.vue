<script setup>
const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer footer-center p-8 bg-base-300 text-base-content">
    <div>
      <p>&copy; {{year}} Timely. Built with Vue 3, Tailwind CSS, and DaisyUI.</p>
    </div>
  </footer>
</template>
