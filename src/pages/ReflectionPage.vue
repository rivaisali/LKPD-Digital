<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinatePlane from '@/components/geometry/CoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { reflectionActivity } from '@/data/lkpd-activities'
import { isSamePoint, reflectPoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'
import type { ReflectionAxis } from '@/domain/types'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#F97316'

// Titik asal dari LKPD: (4,3)
const ORIGIN = { label: 'A', x: 4, y: 3 }

// Sub-pertanyaan: a = sumbu Y, b = sumbu X
const AXES: ReflectionAxis[] = ['y', 'x']
const AXIS_LABELS = ['Sumbu Y', 'Sumbu X']

const currentIdx = ref(0)
const answerX = ref('')
const answerY = ref('')
const attempts = ref(0)
const usedHint = ref(false)
const hintIndex = ref(-1)
const showFeedback = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const activityScore = ref(0)
const isFinished = ref(false)

// Axis yang dipilih siswa (untuk visualisasi)
const selectedAxis = ref<ReflectionAxis>('y')

const currentQ = computed(() => reflectionActivity.subQuestions[currentIdx.value])
const totalQ = computed(() => reflectionActivity.subQuestions.length)
const currentAxis = computed(() => AXES[currentIdx.value])

// Bayangan titik berdasarkan axis saat ini untuk preview
const endPoint = computed(() => {
  if (!feedbackCorrect.value || !showFeedback.value) return undefined
  const result = reflectPoint(ORIGIN, currentAxis.value)
  return { ...result, label: "A'" }
})

progressStore.setActivityInProgress('reflection')

function checkAnswer() {
  const q = currentQ.value
  if (q.isText) return
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, q.correctAnswer)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value = true
    feedbackMessage.value = currentIdx.value === totalQ.value - 1
      ? reflectionActivity.conceptFeedback + '\n\n' + reflectionActivity.conceptRule
      : `Benar! Bayangan A(4,3) terhadap ${AXIS_LABELS[currentIdx.value]} adalah (${x}, ${y}).`
    saveAnswer({
      activityId: 'reflection',
      questionId: q.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value = false
    const hints = currentIdx.value === 0
      ? ['Refleksi sumbu Y: nilai x berubah tanda.', 'Nilai y tetap sama. Rumus: (-x, y).']
      : ['Refleksi sumbu X: nilai y berubah tanda.', 'Nilai x tetap sama. Rumus: (x, -y).']
    feedbackMessage.value = attempts.value >= 2
      ? `Jawaban yang benar adalah (${q.correctAnswer.x}, ${q.correctAnswer.y}).`
      : hints[Math.min(attempts.value - 1, hints.length - 1)]
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 3) {
    if (currentIdx.value < totalQ.value - 1) {
      currentIdx.value++
      answerX.value = ''
      answerY.value = ''
      attempts.value = 0
      usedHint.value = false
      hintIndex.value = -1
      selectedAxis.value = AXES[currentIdx.value]
    } else {
      progressStore.setActivityScore('reflection', activityScore.value, attempts.value)
      isFinished.value = true
    }
  }
}

function showHint() {
  usedHint.value = true
  hintIndex.value = Math.min(hintIndex.value + 1, 1)
}

const hintText = computed(() => {
  if (hintIndex.value < 0) return ''
  const hints = currentIdx.value === 0
    ? ['Refleksi sumbu Y mengubah tanda nilai x. Nilai y tetap.', "Gunakan rumus: A'(-x, y) = A'(-4, 3)."]
    : ['Refleksi sumbu X mengubah tanda nilai y. Nilai x tetap.', "Gunakan rumus: A'(x, -y) = A'(4, -3)."]
  return hints[hintIndex.value] ?? ''
})
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Refleksi (Pencerminan)" :color="COLOR" :show-help="true" @help="showHint" />

    <div class="px-4 pt-3 pb-2 shrink-0 flex justify-center">
      <ProgressDots :total="totalQ" :current="currentIdx" :color="COLOR" />
    </div>

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4">

      <!-- Stimulus hanya soal pertama -->
      <div v-if="currentIdx === 0" class="mb-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-6 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-base">{{ reflectionActivity.stimulusTitle }}</h2>
        </div>
        <div class="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p
            v-for="(para, i) in reflectionActivity.stimulusText.split('\n\n')"
            :key="i"
            class="font-body text-gray-700 text-sm leading-relaxed"
            :class="{ 'mt-2': i > 0 }"
          >{{ para }}</p>
        </div>
      </div>

      <!-- Voice over Nita -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-lg">👧</div>
        <div class="bg-orange-50 rounded-2xl rounded-tl-none p-3 flex-1">
          <p class="font-body text-orange-700 text-xs leading-snug italic">
            "{{ currentIdx === 0 ? reflectionActivity.voiceoverIntro : 'Sekarang, coba cerminkan terhadap sumbu yang berbeda!' }}"
          </p>
        </div>
      </div>

      <!-- Sub-question -->
      <div class="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-orange-50">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" :style="{ backgroundColor: COLOR }">
            {{ String.fromCharCode(97 + currentIdx) }}
          </div>
          <span class="font-display font-semibold text-gray-600 text-xs uppercase tracking-wide">
            Cermin terhadap {{ AXIS_LABELS[currentIdx] }}
          </span>
        </div>
        <p class="font-body text-gray-700 text-sm leading-relaxed">{{ currentQ.instruction }}</p>
      </div>

      <!-- Hint -->
      <Transition name="slide-fade">
        <div v-if="hintIndex >= 0 && hintText" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ hintText }}</p>
        </div>
      </Transition>

      <!-- Pilih garis cermin (info saja) -->
      <div class="flex gap-2 mb-3">
        <div
          class="flex-1 py-2.5 rounded-xl text-center font-display font-semibold text-sm border-2"
          :style="{ backgroundColor: COLOR + '15', borderColor: COLOR, color: COLOR }"
        >
          {{ AXIS_LABELS[currentIdx] }}
          <span class="ml-1 text-xs opacity-70">(aktif)</span>
        </div>
      </div>

      <!-- Bidang Kartesius -->
      <div class="flex justify-center mb-3">
        <CoordinatePlane
          :start-point="ORIGIN"
          :end-point="endPoint"
          :show-arrow="!!endPoint"
          :mirror-axis="currentAxis"
          :motif-color="COLOR"
          :end-motif-color="'#A78BFA'"
          :size="285"
        />
      </div>

      <!-- Input jawaban -->
      <div class="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
      </div>

      <div class="flex gap-3 pb-6">
        <button
          class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform"
          :style="{ borderColor: COLOR, color: COLOR }"
          @click="showHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md"
          :style="{ backgroundColor: COLOR }"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="text-6xl mb-4 animate-bounce-in">🪞</div>
      <h2 class="font-display font-bold text-2xl text-gray-700 mb-2">Refleksi Selesai!</h2>
      <div class="bg-orange-50 rounded-2xl p-4 mb-5 text-left">
        <p class="font-body text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ reflectionActivity.conceptRule }}</p>
      </div>
      <button
        class="w-full py-4 rounded-2xl text-white font-display font-semibold text-base shadow-lg active:scale-95 transition-transform"
        :style="{ backgroundColor: COLOR }"
        @click="router.push('/home')"
      >Kembali ke Beranda</button>
    </div>

    <FeedbackModal :show="showFeedback" :is-correct="feedbackCorrect" :message="feedbackMessage" @next="onFeedbackNext" />
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-8px); }
</style>
