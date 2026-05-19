<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const page = ref(0)
const slideDir = ref<'left' | 'right'>('left')

const pages = [
  {
    image: '/images/cerita1.jpg',
    text: 'Nita membantu ibunya menyulam kain karawo. Ia memperhatikan bahwa motif-motif pada kain memiliki pola pergerakan tertentu.',
    callout: 'Ayo bantu Nita memahami rahasia di balik keindahan motif karawo!',
  },
  {
    image: '/images/cerita2.webp',
    text: '"Bu, kenapa motif ini seperti bergeser ke kanan?" tanya Nita sambil menunjuk pola bunga pada kain karawo.',
    callout: 'Ibunya tersenyum, "Itu namanya translasi, Nita. Motifnya berpindah tanpa berubah bentuk!"',
  },
  {
    image: '/images/cerita3.jpeg',
    text: '"Hebat sekali, Bu!" seru Nita dengan penuh semangat.',
    callout: 'Motif Karawo menyimpan banyak rahasia matematika — translasi, refleksi, rotasi, dan dilatasi. Yuk, kita pelajari bersama-sama!',
  },
]

function nextPage() {
  if (page.value < pages.length - 1) {
    slideDir.value = 'left'
    page.value++
  } else {
    router.push('/home')
  }
}

function prevPage() {
  if (page.value > 0) {
    slideDir.value = 'right'
    page.value--
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
        <div class="relative w-full overflow-hidden" style="height: 220px;">
          <Transition :name="slideDir === 'left' ? 'slide-left' : 'slide-right'" mode="out-in">
            <img
              :key="page"
              :src="pages[page].image"
              :alt="`Cerita halaman ${page + 1}`"
              class="w-full h-full object-cover absolute inset-0"
            />
          </Transition>
        </div>
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
          @click="prevPage"
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

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from  { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to    { transform: translateX(-100%); opacity: 0; }
.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0; }
</style>
