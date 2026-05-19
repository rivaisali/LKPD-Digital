<script setup lang="ts">
defineProps<{
  show: boolean
  isCorrect: boolean
  message: string
  nextLabel?: string
  fromPoint?: { label: string; x: number; y: number }
  toPoint?: { label: string; x: number; y: number }
}>()

const emit = defineEmits<{ next: [] }>()
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="absolute inset-0 z-50 flex items-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="emit('next')" />

      <!-- Sheet -->
      <div class="relative w-full bg-white rounded-t-3xl px-6 pt-8 pb-8 animate-slide-up">

        <!-- ── BENAR ── -->
        <template v-if="isCorrect">
          <!-- Icon lingkaran hijau solid -->
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 rounded-full bg-success flex items-center justify-center animate-bounce-in shadow-lg">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <!-- Judul -->
          <h2 class="font-display font-extrabold text-2xl text-on-surface text-center mb-2">Hebat!</h2>

          <!-- Pesan -->
          <p class="font-body text-on-surface-variant text-center text-base leading-relaxed mb-5">{{ message }}</p>

          <!-- Visual Sebelum → Sesudah -->
          <div v-if="fromPoint && toPoint" class="flex items-end justify-center gap-4 mb-6">
            <!-- Sebelum -->
            <div class="flex flex-col items-center gap-2">
              <div class="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex flex-col items-center gap-1 w-28 shadow-sm">
                <img src="/images/karawo-motif.png" class="w-10 h-10 object-contain" alt="motif" />
                <span class="font-display font-semibold text-xs text-on-surface text-center">
                  {{ fromPoint.label }} ({{ fromPoint.x }},{{ fromPoint.y }})
                </span>
              </div>
              <span class="font-body text-xs text-on-surface-variant">Sebelum</span>
            </div>

            <!-- Panah -->
            <div class="pb-6 shrink-0">
              <svg class="w-8 h-8 text-on-surface" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.22 19.03a.75.75 0 010-1.06l4.47-4.47H4a.75.75 0 010-1.5h13.69l-4.47-4.47a.75.75 0 111.06-1.06l5.75 5.75a.75.75 0 010 1.06l-5.75 5.75a.75.75 0 01-1.06 0z"/>
              </svg>
            </div>

            <!-- Sesudah -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex flex-col items-center gap-1 w-28">
                <span class="font-display font-semibold text-xs text-on-surface mb-1 text-center">
                  {{ toPoint.label }} ({{ toPoint.x }},{{ toPoint.y }})
                </span>
                <img src="/images/karawo-motif.png" class="w-12 h-12 object-contain" alt="motif" />
              </div>
              <span class="font-body text-xs text-on-surface-variant">Sesudah</span>
            </div>
          </div>

          <!-- Tombol -->
          <button
            class="w-full py-4 rounded-2xl font-display font-bold text-on-primary text-base bg-primary shadow-[0_4px_12px_rgba(97,67,138,0.3)] active:scale-95 transition-transform"
            @click="emit('next')"
          >{{ nextLabel ?? 'Lanjut ke Soal Berikutnya' }}</button>
        </template>

        <!-- ── SALAH ── -->
        <template v-else>
          <div class="flex justify-center mb-4">
            <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-bounce-in">
              <svg class="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h2 class="font-display font-bold text-2xl text-center text-red-500 mb-2">Coba Lagi!</h2>
          <p class="font-body text-on-surface-variant text-center text-sm mb-5 leading-relaxed">{{ message }}</p>

          <button
            class="w-full py-4 rounded-2xl font-display font-bold text-on-primary text-base bg-primary active:scale-95 transition-transform"
            @click="emit('next')"
          >{{ nextLabel ?? 'Coba Lagi' }}</button>
        </template>

      </div>
    </div>
  </Transition>
</template>


<style scoped>
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(100%); }
.modal-leave-to .relative { transform: translateY(100%); }
</style>
