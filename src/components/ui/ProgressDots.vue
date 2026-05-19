<script setup lang="ts">
defineProps<{ total: number; current: number; color?: string }>()
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <div
      v-for="i in total"
      :key="i"
      class="rounded-full transition-all duration-300"
      :style="{
        width: i - 1 === current ? '24px' : '8px',
        height: '8px',
        backgroundColor: i - 1 === current ? (color || '#7C3AED') : '#D1D5DB',
      }"
    />
  </div>
</template>
