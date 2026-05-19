<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/useProgressStore'
import { getStarCount, getGrade } from '@/domain/scoring'
import { activities } from '@/data/activities'

const router = useRouter()
const progressStore = useProgressStore()

const showStars = ref(false)

const totalScore = computed(() => progressStore.totalScore)
const starCount = computed(() => getStarCount(totalScore.value))
const grade = computed(() => getGrade(totalScore.value))

const activityIcons: Record<string, string> = {
  translation: 'arrow_right_alt',
  reflection: 'flip',
  rotation: 'rotate_right',
  dilation: 'aspect_ratio',
}

onMounted(() => {
  setTimeout(() => { showStars.value = true }, 300)
})
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <!-- Header -->
    <header class="bg-primary text-on-primary flex justify-between items-center w-full px-6 py-4 shrink-0">
      <button
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        @click="router.push('/home')"
        aria-label="Kembali"
      >
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="font-display font-bold text-xl">Hasil Belajar</h1>
      <button
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        @click="progressStore.reset(); router.push('/home')"
        aria-label="Tutup"
      >
        <span class="material-symbols-outlined">close</span>
      </button>
    </header>

    <!-- Scrollable content -->
    <div class="flex-1 page-scroll hide-scrollbar px-6 py-5 flex flex-col gap-5">
      <!-- Celebration card -->
      <section class="flex flex-col items-center gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <!-- Dot pattern bg -->
        <div class="absolute inset-0 opacity-5 pointer-events-none" style="background-image: radial-gradient(circle at 2px 2px, #61438a 1px, transparent 0); background-size: 16px 16px;" />
        <!-- Stars -->
        <div class="flex gap-2 justify-center z-10">
          <span
            v-for="i in 3"
            :key="i"
            class="material-symbols-outlined drop-shadow-md transition-all duration-500"
            :class="[
              i === 2 ? 'text-5xl -translate-y-2' : 'text-4xl',
              showStars ? 'animate-star-pop' : 'opacity-0 scale-0',
              i <= starCount ? 'text-star-yellow' : 'text-surface-container-high'
            ]"
            :style="{ animationDelay: `${(i - 1) * 0.2}s`, fontVariationSettings: `'FILL' ${i <= starCount ? 1 : 0}` }"
          >star</span>
        </div>
        <!-- Grade label -->
        <h2 class="font-display font-extrabold text-4xl text-primary text-center z-10">{{ grade.label }}</h2>
        <!-- Score -->
        <div class="flex flex-col items-center z-10">
          <p class="font-display font-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-1">Skor Akhir</p>
          <div class="flex items-baseline gap-2">
            <span class="font-display font-extrabold text-5xl text-on-background leading-none">{{ totalScore }}</span>
            <span class="font-display font-bold text-xl text-on-surface-variant">/ 100</span>
          </div>
        </div>
      </section>

      <!-- Breakdown list -->
      <section class="flex flex-col gap-3">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: activity.color + '20', color: activity.color }"
            >
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">{{ activityIcons[activity.id] ?? 'star' }}</span>
            </div>
            <span class="font-body font-semibold text-base text-on-background">{{ activity.label }}</span>
          </div>
          <span
            class="font-display font-bold text-lg"
            :style="{ color: activity.color }"
          >
            {{ progressStore.progress[activity.id as keyof typeof progressStore.progress]?.score ?? 0 }}/20
          </span>
        </div>

        <!-- Tantangan Akhir -->
        <div class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
            </div>
            <span class="font-body font-semibold text-base text-on-background">Tantangan Akhir</span>
          </div>
          <span class="font-display font-bold text-lg text-primary">
            {{ progressStore.progress.challenge?.score ?? 0 }}/20
          </span>
        </div>
      </section>
    </div>

    <!-- Footer buttons -->
    <footer class="bg-surface-container-lowest px-6 py-5 flex gap-4 border-t border-outline-variant/30 shrink-0">
      <button
        class="flex-1 h-12 rounded-full border-2 border-primary text-primary font-display font-semibold text-sm flex items-center justify-center bg-white hover:bg-primary/5 active:scale-95 transition-all"
        @click="progressStore.reset(); router.push('/home')"
      >
        Ulangi
      </button>
      <button
        class="flex-1 h-12 rounded-full bg-primary text-on-primary font-display font-semibold text-sm flex items-center justify-center shadow-[0_4px_12px_rgba(97,67,138,0.3)] hover:bg-primary-light active:scale-95 transition-all"
        @click="router.push('/reflection')"
      >
        Selesai
      </button>
    </footer>
  </div>
</template>
