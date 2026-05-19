<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/layout/BottomNav.vue'
import { useProgressStore } from '@/stores/useProgressStore'
import { useStudentStore } from '@/stores/useStudentStore'
import { activities } from '@/data/activities'

const router = useRouter()
const progressStore = useProgressStore()
const studentStore = useStudentStore()

const totalScore = computed(() => progressStore.totalScore)
</script>

<template>
  <div class="h-full flex flex-col bg-background relative overflow-hidden">
     <!-- Header -->
    <header class="w-full px-6 py-2 flex justify-between items-center bg-surface-container-lowest shrink-0 border-b border-outline-variant/30 relative overflow-hidden">
      <img
        src="/images/pattern-card.svg"
        class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
        style="height: 18px; object-fit: cover; object-position: left center; opacity: 0.1;"
        aria-hidden="true"
      />
      <button class="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      <!-- Star / Score badge -->
      <div class="flex items-center gap-2 bg-[#fff8e1] px-4 py-2 rounded-full border border-[#ffe082] shadow-sm">
        <span class="material-symbols-outlined text-[#ffb300] text-xl" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="font-display font-bold text-sm text-on-surface">{{ totalScore }}</span>
      </div>
    </header>

    <!-- Scrollable content -->
    <div class="flex-1 page-scroll hide-scrollbar px-6 py-5 flex flex-col gap-8">
      <!-- Welcome Banner -->
      <div class="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex gap-4 items-center relative overflow-hidden">
        <img
          src="/images/pattern-card.svg"
          class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
          style="height: 26px; object-fit: cover; object-position: left center; opacity: 0.3;"
          aria-hidden="true"
        />
        <div class="flex-1">
          <h1 class="font-display font-bold text-xl text-on-surface mb-1">Halo, {{ studentStore.name }}!</h1>
          <p class="font-body text-sm text-on-surface-variant leading-relaxed">
            Hari ini kita akan belajar transformasi geometri melalui motif karawo. Siap berpetualang?
          </p>
        </div>
        <div class="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-surface-container-high shadow-sm">
          <img src="/images/nita.png" alt="Nita" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Activity Selection -->
      <section class="flex flex-col gap-4">
        <h2 class="font-display font-bold text-xl text-on-surface">Pilih Aktivitas</h2>
        <div class="grid grid-cols-2 gap-4">
          <button
            v-for="activity in activities"
            :key="activity.id"
            class="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-white active:scale-[0.97] transition-transform duration-200 aspect-square relative overflow-hidden"
            :style="{ backgroundColor: activity.color, boxShadow: `0 4px 12px ${activity.color}50` }"
            @click="router.push(activity.route)"
          >
            <img
              src="/images/pattern-card.svg"
              class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
              style="height: 30px; object-fit: cover; object-position: left center; opacity: 0.22;"
              aria-hidden="true"
            />
            <!-- Completion badge -->
            <div
              v-if="progressStore.progress[activity.id as keyof typeof progressStore.progress]?.status === 'completed'"
              class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-white text-sm" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <!-- Score badge -->
            <div
              v-else-if="progressStore.progress[activity.id as keyof typeof progressStore.progress]?.score > 0"
              class="absolute top-2 right-2 bg-white/25 rounded-full px-2 py-0.5"
            >
              <span class="font-display font-bold text-xs text-white">
                {{ progressStore.progress[activity.id as keyof typeof progressStore.progress]?.score }}/20
              </span>
            </div>

            <span class="material-symbols-outlined text-[48px]">{{ activity.icon }}</span>
            <div class="text-center">
              <span class="block font-display font-bold text-lg leading-tight">{{ activity.label }}</span>
              <span class="block font-body text-xs mt-0.5 opacity-90">({{ activity.sublabel }})</span>
            </div>
          </button>
        </div>
      </section>

      <!-- Tantangan Akhir -->
      <button
        class="w-full bg-challenge rounded-2xl p-4 flex items-center justify-center gap-3 text-white active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(111,91,157,0.3)] relative overflow-hidden"
        :class="progressStore.allActivitiesCompleted ? 'opacity-100' : 'opacity-70'"
        @click="router.push('/challenge')"
      >
        <img
          src="/images/pattern-card.svg"
          class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
          style="height: 28px; object-fit: cover; object-position: left center; opacity: 0.25;"
          aria-hidden="true"
        />
        <span class="material-symbols-outlined text-star-yellow text-3xl" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
        <div class="text-left">
          <span class="block font-display font-bold text-lg leading-tight">Tantangan Akhir</span>
          <span class="block font-body text-xs text-white/80">
            {{ progressStore.allActivitiesCompleted ? 'Siap untuk tantangan!' : 'Selesaikan semua aktivitas dulu' }}
          </span>
        </div>
      </button>
    </div>

    <BottomNav />
  </div>
</template>
