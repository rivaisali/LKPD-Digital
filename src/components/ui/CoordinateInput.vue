<script setup lang="ts">
defineProps<{ label?: string; color?: string }>()
const x = defineModel<string>('x', { default: '' })
const y = defineModel<string>('y', { default: '' })
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <span class="font-body text-gray-600 text-sm">{{ label ?? 'Jawabanmu:' }}</span>
    <span class="font-display text-gray-700">(</span>
    <input
      v-model="x"
      type="number"
      inputmode="numeric"
      placeholder="x"
      class="w-14 h-10 border-2 rounded-xl text-center font-display font-semibold text-base outline-none transition-colors"
      :style="{ borderColor: x ? (color || '#7C3AED') : '#E5E7EB' }"
    />
    <span class="font-display text-gray-700">,</span>
    <input
      v-model="y"
      type="number"
      inputmode="numeric"
      placeholder="y"
      class="w-14 h-10 border-2 rounded-xl text-center font-display font-semibold text-base outline-none transition-colors"
      :style="{ borderColor: y ? (color || '#7C3AED') : '#E5E7EB' }"
    />
    <span class="font-display text-gray-700">)</span>
  </div>
</template>
