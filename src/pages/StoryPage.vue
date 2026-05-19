<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const page = ref(0)

const pages = [
  {
    text: 'Nita membantu ibunya menyulam kain karawo. Ia memperhatikan bahwa motif-motif pada kain memiliki pola pergerakan tertentu.',
    callout: 'Ayo bantu Nita memahami rahasia di balik keindahan motif karawo!',
  },
  {
    text: '"Bu, kenapa motif ini seperti bergeser ke kanan?" tanya Nita sambil menunjuk pola bunga pada kain karawo.',
    callout: 'Ibunya tersenyum, "Itu namanya translasi, Nita. Motifnya berpindah tanpa berubah bentuk!"',
  },
  {
    text: '"Hebat sekali, Bu!" seru Nita dengan penuh semangat.',
    callout: 'Motif Karawo menyimpan banyak rahasia matematika — translasi, refleksi, rotasi, dan dilatasi. Yuk, kita pelajari bersama-sama!',
  },
]

function nextPage() {
  if (page.value < pages.length - 1) {
    page.value++
  } else {
    router.push('/home')
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <!-- Top App Bar -->
    <header class="bg-surface border-b border-outline-variant/40 sticky top-0 z-50 shrink-0">
      <div class="flex justify-between items-center px-6 py-2 h-16">
        <button
          class="text-on-surface-variant hover:bg-surface-container rounded-full p-2 flex items-center justify-center transition-colors"
          @click="router.back()"
        >
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="font-display font-bold text-xl text-primary flex-1 text-center">Cerita Nita</h1>
        <div class="w-10" />
      </div>
    </header>

    <!-- Scrollable main content -->
    <div class="flex-1 page-scroll hide-scrollbar flex flex-col px-6 py-5 gap-5 pb-28">
      <!-- Illustration card -->
      <div class="w-full rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-surface-variant bg-surface-container-lowest">
        <StoryIllustration :page="page" />
        <!-- Page dots -->
        <div class="flex justify-center gap-2 py-3">
          <div
            v-for="(_, i) in pages"
            :key="i"
            class="rounded-full transition-all"
            :style="{
              width: i === page ? '20px' : '6px',
              height: '6px',
              backgroundColor: i === page ? '#61438a' : '#ccc3d1'
            }"
          />
        </div>
      </div>

      <!-- Story text card -->
      <div class="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-variant relative">
        <!-- Decorative badge -->
        <div class="absolute -top-5 -left-3 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-sm border-2 border-surface-container-lowest">
          <span class="material-symbols-outlined text-on-primary-container text-sm" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <p class="font-body text-base text-on-surface leading-relaxed mb-3 mt-1">{{ pages[page].text }}</p>
        <p class="font-display font-bold text-sm text-primary leading-relaxed">{{ pages[page].callout }}</p>
      </div>
    </div>

    <!-- Fixed bottom action -->
    <div class="fixed bottom-0 left-0 w-full bg-surface shadow-[0_-4px_12px_rgba(0,0,0,0.05)] py-5 px-6 flex justify-center z-50">
      <div class="flex gap-3 w-full max-w-107.5">
        <button
          v-if="page > 0"
          class="flex-1 border-2 border-primary text-primary py-4 rounded-2xl font-display font-semibold text-sm active:scale-95 transition-transform"
          @click="page--"
        >Sebelumnya</button>
        <button
          class="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-display font-semibold text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          @click="nextPage"
        >
          {{ page < pages.length - 1 ? 'Lanjutkan' : 'Mulai Belajar!' }}
          <span v-if="page < pages.length - 1" class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'

const StoryIllustration = defineComponent({
  props: { page: { type: Number, default: 0 } },
  setup(props) {
    return () => {
      const bgColors = ['#f4e6ff', '#fff0dd', '#fde8ef']
      const bg = bgColors[props.page] ?? '#f4e6ff'
      return h('svg', { viewBox: '0 0 430 240', class: 'w-full', style: 'height: 200px' }, [
        h('rect', { width: 430, height: 240, fill: bg }),
        // Karawo pattern overlay
        h('g', { opacity: 0.15 }, [
          ...Array.from({ length: 6 }, (_, i) =>
            h('rect', {
              key: `r${i}`,
              x: i * 72 + 10,
              y: 10,
              width: 52,
              height: 52,
              rx: 4,
              fill: '#61438a',
            })
          ),
          ...Array.from({ length: 6 }, (_, i) =>
            h('rect', {
              key: `r2${i}`,
              x: i * 72 + 36,
              y: 110,
              width: 52,
              height: 52,
              rx: 4,
              fill: '#61438a',
            })
          ),
        ]),
        // Nita figure
        h('g', { transform: 'translate(90, 30)' }, [
          h('ellipse', { cx: 55, cy: 62, rx: 26, ry: 30, fill: '#FDDCB5' }),
          h('ellipse', { cx: 55, cy: 40, rx: 28, ry: 20, fill: '#61438a' }),
          h('ellipse', { cx: 55, cy: 102, rx: 30, ry: 24, fill: '#61438a' }),
          h('circle', { cx: 45, cy: 60, r: 4, fill: '#1F2937' }),
          h('circle', { cx: 65, cy: 60, r: 4, fill: '#1F2937' }),
          h('path', { d: 'M47 74 Q55 82 63 74', stroke: '#c0392b', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }),
          h('ellipse', { cx: 38, cy: 58, rx: 5, ry: 4, fill: '#F9A8D4', opacity: 0.6 }),
          h('ellipse', { cx: 72, cy: 58, rx: 5, ry: 4, fill: '#F9A8D4', opacity: 0.6 }),
        ]),
        // Mother figure
        h('g', { transform: 'translate(220, 20)' }, [
          h('ellipse', { cx: 55, cy: 68, rx: 28, ry: 33, fill: '#D6B896' }),
          h('ellipse', { cx: 55, cy: 42, rx: 30, ry: 22, fill: '#4a454f' }),
          h('ellipse', { cx: 55, cy: 110, rx: 33, ry: 28, fill: '#ec6585' }),
          h('circle', { cx: 45, cy: 62, r: 4, fill: '#1F2937' }),
          h('circle', { cx: 65, cy: 62, r: 4, fill: '#1F2937' }),
          h('path', { d: 'M47 78 Q55 86 63 78', stroke: '#4a454f', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
        ]),
        // Karawo fabric
        h('rect', { x: 140, y: 155, width: 150, height: 55, rx: 6, fill: '#ffe5e5', stroke: '#ec6585', 'stroke-width': 1.5 }),
        h('g', { opacity: 0.6 }, [
          ...Array.from({ length: 4 }, (_, i) =>
            h('circle', { key: i, cx: 160 + i * 34, cy: 176, r: 8, fill: '#61438a' })
          ),
          ...Array.from({ length: 3 }, (_, i) =>
            h('circle', { key: `b${i}`, cx: 177 + i * 34, cy: 194, r: 8, fill: '#f79624', opacity: 0.8 })
          ),
        ]),
      ])
    }
  },
})

export { StoryIllustration }
</script>
