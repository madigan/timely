<template>

</template>

<script setup lang="ts">
import { ref } from "vue";

const showDemo = ref(false);
const showLogin = ref(false);
const selectedCategory = ref("");

const categoryEmojis: Record<string, string> = {
  work: "💼",
  personal: "🏠",
  social: "👥",
};

const categorize = (category: string) => {
  selectedCategory.value = category;
};
</script>
