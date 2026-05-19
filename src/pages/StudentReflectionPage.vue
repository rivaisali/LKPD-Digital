<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import { saveReflection } from '@/db/db'

const router = useRouter()
const reflectionText = ref('')
const selectedFeeling = ref('')
const isSaving = ref(false)
const isDone = ref(false)

const feelings = [
  { emoji: '😄', label: 'Sangat Senang' },
  { emoji: '🙂', label: 'Senang' },
  { emoji: '😐', label: 'Biasa' },
  { emoji: '😕', label: 'Bingung' },
  { emoji: '😢', label: 'Sulit' },
]

async function submit() {
  if (!reflectionText.value.trim()) return
  isSaving.value = true
  await saveReflection({
    studentId: 1,
    text: reflectionText.value,
    feeling: selectedFeeling.value,
    createdAt: new Date().toISOString(),
  })
  isSaving.value = false
  isDone.value = true
}
</script>

<template>
  <div class="h-full flex flex-col bg-[#FFF7ED]">
    <TopBar title="Refleksi Belajar" />

    <div v-if="!isDone" class="flex-1 page-scroll hide-scrollbar px-5 py-5">
      <!-- Question header -->
      <div class="bg-primary rounded-3xl p-5 mb-5">
        <p class="font-display font-bold text-white text-lg mb-1">Bagaimana perasaanmu?</p>
        <p class="font-body text-white/70 text-sm">Setelah belajar transformasi geometri bersama Nita Karawo</p>
      </div>

      <!-- Feeling selector -->
      <div class="flex justify-between mb-5">
        <button
          v-for="f in feelings"
          :key="f.emoji"
          class="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95"
          :class="selectedFeeling === f.label ? 'bg-primary/10 ring-2 ring-primary' : 'bg-white'"
          @click="selectedFeeling = f.label"
        >
          <span class="text-3xl">{{ f.emoji }}</span>
          <span class="font-body text-xs text-gray-500 text-center leading-tight" style="max-width: 52px">{{ f.label }}</span>
        </button>
      </div>

      <!-- Reflection text -->
      <div class="mb-5">
        <p class="font-display font-semibold text-gray-700 text-sm mb-2">Apa yang kamu pelajari hari ini?</p>
        <textarea
          v-model="reflectionText"
          rows="4"
          class="w-full bg-white rounded-2xl p-4 font-body text-gray-700 text-sm resize-none outline-none border-2 border-transparent focus:border-primary transition-colors"
          placeholder="Ceritakan pengalamanmu belajar transformasi geometri melalui motif Karawo..."
        />
      </div>

      <button
        class="w-full py-4 rounded-2xl bg-primary text-white font-display font-semibold text-base shadow-lg shadow-primary/25 active:scale-95 transition-transform disabled:opacity-50"
        :disabled="!reflectionText.trim() || isSaving"
        @click="submit"
      >{{ isSaving ? 'Menyimpan...' : 'Simpan Refleksi' }}</button>
    </div>

    <!-- Done state -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6">
      <div class="text-7xl mb-4 animate-bounce-in">🌟</div>
      <h2 class="font-display font-bold text-2xl text-primary mb-2">Terima Kasih!</h2>
      <p class="font-body text-gray-500 text-center text-sm mb-8">
        Refleksimu telah disimpan. Terus belajar dan semangat berpetualang bersama Nita Karawo!
      </p>
      <button
        class="w-full py-4 rounded-2xl bg-primary text-white font-display font-semibold text-base shadow-lg shadow-primary/25 active:scale-95 transition-transform"
        @click="router.push('/home')"
      >Kembali ke Beranda</button>
    </div>
  </div>
</template>
