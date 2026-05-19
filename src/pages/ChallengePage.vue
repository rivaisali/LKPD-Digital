<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { challengeData } from '@/data/lkpd-activities'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#7C3AED'

const answerX = ref('')
const answerY = ref('')
const attempts = ref(0)
const usedHint = ref(false)
const hintIndex = ref(-1)
const showFeedback = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const isFinished = ref(false)
// Langkah yang terungkap saat petunjuk ditekan
const revealedSteps = ref(0)

progressStore.setActivityInProgress('challenge')

function checkAnswer() {
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, challengeData.correctAnswer)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value)
    feedbackCorrect.value = true
    feedbackMessage.value = challengeData.conceptFeedback
    progressStore.setActivityScore('challenge', score, attempts.value)
  } else {
    feedbackCorrect.value = false
    feedbackMessage.value = attempts.value === 1
      ? 'Belum tepat. Selesaikan langkah per langkah!'
      : `Jawaban yang benar adalah (${challengeData.correctAnswer.x}, ${challengeData.correctAnswer.y}). Perhatikan setiap langkah transformasinya.`
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    isFinished.value = true
  }
}

function showNextHint() {
  usedHint.value = true
  if (hintIndex.value < challengeData.hints.length - 1) {
    hintIndex.value++
    // Ungkap langkah sesuai petunjuk
    revealedSteps.value = Math.min(revealedSteps.value + 1, challengeData.steps.length)
  }
}
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Tantangan Akhir" :color="COLOR" />

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4 py-4">

      <!-- Header tantangan -->
      <div class="flex items-center gap-3 bg-primary/10 rounded-2xl p-4 mb-4">
        <div class="text-3xl">🏆</div>
        <div>
          <h2 class="font-display font-bold text-primary text-base">Soal Tantangan HOTS</h2>
          <p class="font-body text-primary/70 text-xs">Gabungkan semua transformasi!</p>
        </div>
      </div>

      <!-- Voice over Nita -->
      <div class="flex items-start gap-3 mb-4">
        <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg">👧</div>
        <div class="bg-primary/10 rounded-2xl rounded-tl-none p-3 flex-1">
          <p class="font-body text-primary text-xs leading-snug italic">
            "Sekarang saatnya tantangan! Aku ingin membuat pola karawo baru, tetapi aku membutuhkan bantuanmu. Semangat ya!"
          </p>
        </div>
      </div>

      <!-- Soal -->
      <div class="bg-white rounded-3xl p-4 mb-4 shadow-sm">
        <p class="font-body text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{ challengeData.stimulusText }}</p>
      </div>

      <!-- Langkah-langkah (terungkap bertahap) -->
      <div class="mb-4">
        <p class="font-body text-gray-500 text-xs mb-2 font-semibold uppercase tracking-wide">Langkah Penyelesaian:</p>
        <div class="space-y-2">
          <div
            v-for="(step, i) in challengeData.steps"
            :key="i"
            class="flex items-start gap-3 bg-white rounded-2xl p-3 shadow-sm transition-all"
            :class="i < revealedSteps ? 'opacity-100' : 'opacity-30'"
          >
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" :style="{ backgroundColor: step.color + '20' }">
              <span class="font-display font-bold text-sm" :style="{ color: step.color }">{{ i + 1 }}</span>
            </div>
            <div class="flex-1">
              <p class="font-display font-semibold text-gray-700 text-sm">{{ step.label }}</p>
              <p v-if="i < revealedSteps" class="font-body text-gray-500 text-xs mt-0.5 leading-snug">{{ step.detail }}</p>
              <div
                v-if="i < revealedSteps"
                class="mt-1.5 inline-block bg-gray-100 rounded-lg px-2 py-0.5"
              >
                <span class="font-display font-bold text-xs text-gray-700">
                  → ({{ step.result.x }}, {{ step.result.y }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Petunjuk teks -->
      <Transition name="slide-fade">
        <div v-if="hintIndex >= 0" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-4 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug whitespace-pre-line">{{ challengeData.hints[hintIndex] }}</p>
        </div>
      </Transition>

      <!-- Input jawaban akhir -->
      <div class="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <p class="font-display font-semibold text-gray-700 text-sm text-center mb-3">Jawaban akhir:</p>
        <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
      </div>

      <div class="flex gap-3 pb-6">
        <button
          class="flex-1 py-3.5 rounded-2xl border-2 border-primary text-primary font-display font-semibold text-sm active:scale-95 transition-transform"
          @click="showNextHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl bg-primary text-white font-display font-semibold text-sm active:scale-95 transition-transform shadow-lg shadow-primary/25"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="text-7xl mb-4 animate-bounce-in">🏆</div>
      <h2 class="font-display font-bold text-3xl text-primary mb-2">Luar Biasa!</h2>
      <p class="font-body text-gray-500 text-center text-sm mb-4">
        "Terima kasih sudah belajar bersamaku! Tetap semangat belajar dan cintai budaya daerah kita."
      </p>
      <!-- Ringkasan langkah -->
      <div class="bg-white rounded-2xl p-4 w-full mb-5 text-left shadow-sm">
        <p class="font-display font-semibold text-gray-600 text-xs mb-3 uppercase tracking-wide">Pembahasan:</p>
        <div class="space-y-2">
          <div v-for="(step, i) in challengeData.steps" :key="i" class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" :style="{ backgroundColor: step.color }">{{ i + 1 }}</div>
            <span class="font-body text-gray-600 text-xs flex-1">{{ step.detail }}</span>
            <span class="font-display font-bold text-xs text-gray-700">({{ step.result.x }}, {{ step.result.y }})</span>
          </div>
        </div>
      </div>
      <button
        class="w-full py-4 rounded-2xl bg-primary text-white font-display font-semibold text-base shadow-lg shadow-primary/30 active:scale-95 transition-transform mb-3"
        @click="router.push('/result')"
      >Lihat Hasil Belajar</button>
      <button
        class="w-full py-4 rounded-2xl border-2 border-primary text-primary font-display font-semibold text-base active:scale-95 transition-transform"
        @click="router.push('/home')"
      >Kembali ke Beranda</button>
    </div>

    <FeedbackModal
      :show="showFeedback"
      :is-correct="feedbackCorrect"
      :message="feedbackMessage"
      :next-label="feedbackCorrect ? 'Lihat Hasil!' : 'Coba Lagi'"
      @next="onFeedbackNext"
    />
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-8px); }
</style>
