<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const guideItems = [
  {
    step: 1,
    icon: 'menu_book',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    stepColor: 'text-primary',
    text: 'Baca cerita dengan saksama.',
  },
  {
    step: 2,
    icon: 'visibility',
    iconBg: 'bg-secondary-container/40',
    iconColor: 'text-on-secondary-container',
    stepColor: 'text-secondary',
    text: 'Amati motif pada setiap aktivitas.',
  },
  {
    step: 3,
    icon: 'edit',
    iconBg: 'bg-primary-fixed-dim/40',
    iconColor: 'text-primary',
    stepColor: 'text-primary',
    text: 'Jawab pertanyaan dengan benar.',
  },
  {
    step: 4,
    icon: 'lightbulb',
    iconBg: 'bg-secondary-container/30',
    iconColor: 'text-on-secondary-container',
    stepColor: 'text-secondary',
    text: 'Gunakan petunjuk jika kamu kesulitan.',
  },
  {
    step: 5,
    icon: 'star',
    iconBg: 'bg-[#fde68a]',
    iconColor: 'text-[#b45309]',
    stepColor: 'text-[#b45309]',
    text: 'Kumpulkan bintang dan selesaikan tantangan!',
  },
]
</script>

<template>
  <div class="h-full flex flex-col dot-pattern-bg">
    <!-- Top App Bar -->
    <header class="flex justify-between items-center w-full px-6 py-2 bg-surface border-b border-outline-variant/30 sticky top-0 z-50 shrink-0">
      <button
        class="w-12 h-12 flex items-center justify-center rounded-full text-primary hover:bg-surface-container transition-colors"
        @click="router.back()"
        aria-label="Kembali"
      >
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
      </button>
      <h1 class="font-display font-bold text-xl text-on-surface">Petunjuk Penggunaan</h1>
      <div class="w-12" />
    </header>

    <!-- Steps -->
    <div class="flex-1 page-scroll hide-scrollbar px-6 py-5 flex flex-col gap-3">
      <div
        v-for="item in guideItems"
        :key="item.step"
        class="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm"
      >
        <div class="w-12 h-12 shrink-0 rounded-full flex items-center justify-center" :class="item.iconBg">
          <span class="material-symbols-outlined" :class="item.iconColor" style="font-variation-settings: 'FILL' 1;">{{ item.icon }}</span>
        </div>
        <div>
          <span class="font-display font-semibold text-xs mb-1 block" :class="item.stepColor">Langkah {{ item.step }}</span>
          <p class="font-body text-sm text-on-surface leading-snug">{{ item.text }}</p>
        </div>
      </div>

      <!-- Nita speech bubble -->
      <div class="mt-auto pt-4 flex items-end gap-4">
        <NitaSmall class="w-24 h-24 shrink-0 translate-y-3" />
        <div class="bg-surface-container-lowest p-4 rounded-2xl rounded-bl-none border border-outline-variant/30 shadow-md relative flex-1 mb-4">
          <p class="font-body text-sm text-on-surface leading-relaxed">Selamat belajar dan jangan lupa bersenang-senang!</p>
        </div>
      </div>
    </div>

    <!-- Bottom action -->
    <div class="px-6 py-5 bg-surface border-t border-outline-variant/20 shrink-0">
      <button
        class="w-full bg-primary text-on-primary py-4 rounded-full font-display font-semibold text-sm shadow-[0_4px_12px_rgba(97,67,138,0.2)] active:scale-95 transition-all"
        @click="router.push('/home')"
      >
        Mulai
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'

const NitaSmall = defineComponent({
  setup() {
    return () => h('svg', { viewBox: '0 0 100 120', fill: 'none' }, [
      h('ellipse', { cx: 50, cy: 50, rx: 28, ry: 32, fill: '#FDDCB5' }),
      h('ellipse', { cx: 50, cy: 28, rx: 30, ry: 22, fill: '#61438a' }),
      h('ellipse', { cx: 50, cy: 90, rx: 32, ry: 28, fill: '#61438a' }),
      h('circle', { cx: 40, cy: 47, r: 4, fill: '#1F2937' }),
      h('circle', { cx: 60, cy: 47, r: 4, fill: '#1F2937' }),
      h('circle', { cx: 41.5, cy: 45.5, r: 1.5, fill: 'white' }),
      h('circle', { cx: 61.5, cy: 45.5, r: 1.5, fill: 'white' }),
      h('path', { d: 'M42 60 Q50 68 58 60', stroke: '#c0392b', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
      h('ellipse', { cx: 34, cy: 46, rx: 5, ry: 4, fill: '#F9A8D4', opacity: 0.6 }),
      h('ellipse', { cx: 66, cy: 46, rx: 5, ry: 4, fill: '#F9A8D4', opacity: 0.6 }),
      h('g', { transform: 'translate(68, 24)' }, [
        h('circle', { cx: 0, cy: -5, r: 3.5, fill: '#ec6585' }),
        h('circle', { cx: 5, cy: 0, r: 3.5, fill: '#f79624' }),
        h('circle', { cx: 0, cy: 5, r: 3.5, fill: '#ec6585' }),
        h('circle', { cx: -5, cy: 0, r: 3.5, fill: '#f79624' }),
        h('circle', { cx: 0, cy: 0, r: 3.5, fill: '#ffe5e5' }),
      ]),
    ])
  },
})

export { NitaSmall }
</script>
