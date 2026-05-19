<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  title: string
  color?: string
  showBack?: boolean
  showHelp?: boolean
}>(), {
  color: '#61438a',
  showBack: true,
  showHelp: false,
})

const emit = defineEmits<{ help: [] }>()
const router = useRouter()
</script>

<template>
  <header
    class="flex items-center justify-between px-4 py-2 shrink-0"
    :style="{ backgroundColor: color }"
  >
    <button
      v-if="showBack"
      class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors"
      @click="router.back()"
      aria-label="Kembali"
    >
      <span class="material-symbols-outlined text-xl">arrow_back</span>
    </button>
    <div v-else class="w-10" />

    <h1 class="font-display font-bold text-white text-lg text-center flex-1 px-2">{{ title }}</h1>

    <button
      v-if="showHelp"
      class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white active:bg-white/30 transition-colors"
      @click="emit('help')"
      aria-label="Bantuan"
    >
      <span class="material-symbols-outlined text-xl">help</span>
    </button>
    <div v-else class="w-10" />
  </header>
</template>
