<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { challengeData } from '@/data/lkpd-activities'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#6f5b9d'

const answerX      = ref('')
const answerY      = ref('')
const attempts     = ref(0)
const usedHint     = ref(false)
const showFeedback = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const isFinished   = ref(false)

// Berapa langkah yang sudah terungkap via hint (0 = belum ada, 3 = semua)
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
    revealedSteps.value   = challengeData.steps.length
    progressStore.setActivityScore('challenge', score, attempts.value)
    saveAnswer({
      activityId: 'challenge', questionId: 'challenge-final',
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value = false
    feedbackMessage.value = attempts.value >= 2
      ? `Jawaban yang benar adalah (${challengeData.correctAnswer.x}, ${challengeData.correctAnswer.y}). Perhatikan setiap langkah transformasinya.`
      : 'Belum tepat. Selesaikan langkah per langkah, mulai dari translasi!'
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    revealedSteps.value = challengeData.steps.length
    isFinished.value = true
  }
}

function showNextHint() {
  usedHint.value = true
  if (revealedSteps.value < challengeData.hints.length) {
    revealedSteps.value++
  }
}
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Tantangan Akhir" :color="COLOR" />

    <!-- ── SOAL ── -->
    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4 pb-4 pt-3">

      <!-- Header badge -->
      <div class="flex items-center gap-3 rounded-2xl p-4 mb-3" :style="{ backgroundColor: COLOR + '15' }">
        <span class="material-symbols-outlined text-3xl text-star-yellow" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
        <div>
          <h2 class="font-display font-bold text-base" :style="{ color: COLOR }">Soal Tantangan HOTS</h2>
          <p class="font-body text-xs text-on-surface-variant">Gabungkan semua transformasi geometri!</p>
        </div>
      </div>

      <!-- Nita voiceover -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
             :style="{ backgroundColor: COLOR + '20' }">👧</div>
        <div class="rounded-2xl rounded-tl-none p-3 flex-1" :style="{ backgroundColor: COLOR + '10' }">
          <p class="font-body text-xs leading-snug italic" :style="{ color: COLOR }">
            "Sekarang saatnya tantangan! Aku ingin membuat pola karawo baru, tetapi aku membutuhkan bantuanmu. Semangat ya!"
          </p>
        </div>
      </div>

      <!-- Soal / stimulus -->
      <div class="mb-3 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-5 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-sm">Soal</h2>
        </div>
        <div class="rounded-2xl p-4 border font-body text-gray-700 text-sm leading-relaxed"
             :style="{ backgroundColor: COLOR + '08', borderColor: COLOR + '30' }">
          Nita mencoba membuat desain sendiri. Ia mulai dari satu motif di titik
          <strong>P(1,1)</strong>, lalu melakukan beberapa langkah berikut:
          <ol class="mt-2 space-y-1 list-none">
            <li class="flex items-start gap-2">
              <span class="font-display font-bold text-xs w-4 shrink-0 mt-0.5" :style="{ color: COLOR }">1.</span>
              <span>Menggeser motif ke titik <strong>(3,2)</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-display font-bold text-xs w-4 shrink-0 mt-0.5" :style="{ color: COLOR }">2.</span>
              <span>Dicerminkan terhadap <strong>sumbu X</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="font-display font-bold text-xs w-4 shrink-0 mt-0.5" :style="{ color: COLOR }">3.</span>
              <span>Diputar <strong>90° searah jarum jam</strong> terhadap pusat (0,0)</span>
            </li>
          </ol>
          <p class="mt-3 font-display font-semibold text-sm" :style="{ color: COLOR }">
            Tentukan posisi akhir titik tersebut!
          </p>
        </div>
      </div>

      <!-- Langkah penyelesaian (terungkap bertahap) -->
      <div class="mb-3">
        <p class="font-display font-semibold text-gray-500 text-xs mb-2 uppercase tracking-wide">Langkah Penyelesaian:</p>
        <div class="space-y-2">
          <div
            v-for="(step, i) in challengeData.steps"
            :key="i"
            class="rounded-2xl p-3 border transition-all"
            :class="i < revealedSteps ? 'opacity-100' : 'opacity-30'"
            :style="i < revealedSteps
              ? { backgroundColor: step.color + '10', borderColor: step.color + '40' }
              : { backgroundColor: '#f9f9f9', borderColor: '#e5e7eb' }"
          >
            <div class="flex items-start gap-3">
              <!-- Nomor + icon -->
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   :style="{ backgroundColor: i < revealedSteps ? step.color : '#d1d5db' }">
                <span class="material-symbols-outlined text-white text-base">{{ step.icon }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-display font-bold text-sm text-gray-700">{{ i + 1 }}. {{ step.label }}</p>
                  <span
                    v-if="i < revealedSteps"
                    class="font-body text-xs px-2 py-0.5 rounded-full"
                    :style="{ backgroundColor: step.color + '20', color: step.color }"
                  >{{ step.rule }}</span>
                </div>
                <p v-if="i < revealedSteps" class="font-body text-xs text-gray-500 mt-1 leading-snug">
                  {{ step.detail }}
                </p>
                <div v-if="i < revealedSteps" class="mt-1.5 inline-flex items-center gap-1">
                  <span class="font-body text-xs text-gray-400">Hasil:</span>
                  <span class="font-display font-bold text-xs px-2 py-0.5 rounded-lg"
                        :style="{ backgroundColor: step.color, color: 'white' }">
                    ({{ step.result.x }}, {{ step.result.y }})
                  </span>
                </div>
                <p v-if="i >= revealedSteps" class="font-body text-xs text-gray-300 mt-1">
                  Tekan Petunjuk untuk melihat langkah ini
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Petunjuk aktif -->
      <Transition name="slide-fade">
        <div v-if="revealedSteps > 0 && revealedSteps < challengeData.steps.length"
             class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">
            {{ challengeData.hints[revealedSteps - 1] }}
          </p>
        </div>
      </Transition>

      <!-- Input jawaban akhir -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-700 text-sm text-center mb-1">Jawaban akhir:</p>
        <p class="font-body text-xs text-gray-400 text-center mb-3">Posisi titik P setelah 3 transformasi</p>
        <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform disabled:opacity-40"
          :style="{ borderColor: COLOR, color: COLOR }"
          :disabled="revealedSteps >= challengeData.hints.length"
          @click="showNextHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md"
          :style="{ backgroundColor: COLOR }"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- ── SELESAI ── -->
    <div v-else class="flex-1 page-scroll hide-scrollbar px-6 py-6 flex flex-col items-center text-center gap-4">
      <div class="text-7xl animate-bounce-in">🏆</div>
      <h2 class="font-display font-bold text-3xl text-primary">Luar Biasa!</h2>
      <p class="font-body text-sm text-on-surface-variant leading-relaxed">
        Kamu berhasil menggabungkan <strong>Translasi</strong>, <strong>Refleksi</strong>, dan <strong>Rotasi</strong>!
        Itulah kehebatan transformasi geometri dalam motif Karawo.
      </p>

      <!-- Pembahasan lengkap -->
      <div class="bg-white rounded-2xl p-4 text-left w-full shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Pembahasan Lengkap</p>
        <div class="space-y-3">
          <!-- Titik awal -->
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                 :style="{ backgroundColor: COLOR + '20' }">
              <span class="font-display font-bold text-xs" :style="{ color: COLOR }">P</span>
            </div>
            <div>
              <p class="font-display font-semibold text-xs text-gray-700">Titik Awal</p>
              <p class="font-body text-xs text-gray-500">P(1, 1)</p>
            </div>
          </div>
          <!-- Arrow down -->
          <div class="flex justify-center">
            <span class="material-symbols-outlined text-gray-300 text-lg">arrow_downward</span>
          </div>
          <!-- Steps -->
          <div
            v-for="(step, i) in challengeData.steps"
            :key="i"
          >
            <div class="flex items-start gap-2">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                   :style="{ backgroundColor: step.color }">
                <span class="font-display font-bold text-xs">{{ i + 1 }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-1 flex-wrap">
                  <p class="font-display font-semibold text-xs text-gray-700">{{ step.label }}</p>
                  <span class="font-body text-xs px-1.5 py-0.5 rounded"
                        :style="{ backgroundColor: step.color + '15', color: step.color }">{{ step.rule }}</span>
                </div>
                <p class="font-body text-xs text-gray-500 mt-0.5">{{ step.detail }}</p>
              </div>
              <span class="font-display font-bold text-xs px-2 py-1 rounded-lg text-white shrink-0"
                    :style="{ backgroundColor: step.color }">
                ({{ step.result.x }}, {{ step.result.y }})
              </span>
            </div>
            <div v-if="i < challengeData.steps.length - 1" class="flex justify-center my-1">
              <span class="material-symbols-outlined text-gray-300 text-lg">arrow_downward</span>
            </div>
          </div>
          <!-- Jawaban akhir -->
          <div class="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p class="font-display font-bold text-sm text-gray-700">Posisi Akhir</p>
            <span class="font-display font-bold text-base px-3 py-1 rounded-xl text-white"
                  :style="{ backgroundColor: COLOR }">
              (−2, −3)
            </span>
          </div>
        </div>
      </div>

      <button
        class="w-full py-4 rounded-2xl text-white font-display font-bold text-base shadow-lg active:scale-95 transition-transform"
        :style="{ backgroundColor: COLOR }"
        @click="router.push('/result')"
      >Lihat Hasil Belajar</button>
      <button
        class="w-full py-3.5 rounded-2xl border-2 font-display font-semibold text-base active:scale-95 transition-transform"
        :style="{ borderColor: COLOR, color: COLOR }"
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
