<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinatePlane from '@/components/geometry/CoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { rotationActivity } from '@/data/lkpd-activities'
import { isSamePoint, rotatePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'
import type { RotationAngle, RotationDirection } from '@/domain/types'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#3B82F6'

// Soal a: (2,1) putar 90° CCW → (-1,2)
// Soal b: dari (-1,2) putar 180° → (1,-2)
const STEPS: { start: { label: string; x: number; y: number }; angle: RotationAngle; direction: RotationDirection }[] = [
  { start: { label: 'A', x: 2, y: 1 }, angle: 90, direction: 'ccw' },
  { start: { label: "A'", x: -1, y: 2 }, angle: 180, direction: 'ccw' },
]

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
const selectedAngle = ref<RotationAngle | null>(null)

const currentQ = computed(() => rotationActivity.subQuestions[currentIdx.value])
const totalQ = computed(() => rotationActivity.subQuestions.length)
const currentStep = computed(() => STEPS[currentIdx.value])

const endPoint = computed(() => {
  if (!feedbackCorrect.value || !showFeedback.value) return undefined
  const result = rotatePoint(currentStep.value.start, currentStep.value.angle, currentStep.value.direction)
  return { ...result, label: currentStep.value.start.label + "'" }
})

const previewPoint = computed(() => {
  if (!selectedAngle.value) return undefined
  const result = rotatePoint(currentStep.value.start, selectedAngle.value, currentStep.value.direction)
  return { ...result, label: currentStep.value.start.label + "'" }
})

const angleOptions: { val: RotationAngle; label: string }[] = [
  { val: 90, label: '90°' },
  { val: 180, label: '180°' },
  { val: 270, label: '270°' },
]

progressStore.setActivityInProgress('rotation')

function selectAngle(a: RotationAngle) {
  selectedAngle.value = a
}

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
      ? rotationActivity.conceptFeedback + '\n\n' + rotationActivity.conceptRule
      : `Benar! Setelah dirotasi ${currentStep.value.angle}°, motif berpindah ke (${x}, ${y}).`
    saveAnswer({
      activityId: 'rotation',
      questionId: q.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value = false
    const hints0 = [
      'Rotasi 90° berlawanan jarum jam: (x, y) → (−y, x).',
      `Titik (${currentStep.value.start.x}, ${currentStep.value.start.y}) → (−${currentStep.value.start.y}, ${currentStep.value.start.x}) = (${q.correctAnswer.x}, ${q.correctAnswer.y}).`,
    ]
    const hints1 = [
      'Rotasi 180°: (x, y) → (−x, −y).',
      `Titik (${currentStep.value.start.x}, ${currentStep.value.start.y}) → (${q.correctAnswer.x}, ${q.correctAnswer.y}).`,
    ]
    const hints = currentIdx.value === 0 ? hints0 : hints1
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
      selectedAngle.value = null
    } else {
      progressStore.setActivityScore('rotation', activityScore.value, attempts.value)
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
  const q = currentQ.value
  if (q.isText) return ''
  const hints = currentIdx.value === 0
    ? ['Rotasi 90° berlawanan jarum jam: (x, y) → (−y, x).', "Ubah x menjadi −y dan y menjadi x. Titik (2,1) → (−1, 2)."]
    : ['Rotasi 180°: (x, y) → (−x, −y).', "Balikkan tanda kedua koordinat. (−1,2) → (1, −2)."]
  return hints[hintIndex.value] ?? ''
})
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Rotasi (Perputaran)" :color="COLOR" :show-help="true" @help="showHint" />

    <div class="px-4 pt-3 pb-2 shrink-0 flex justify-center">
      <ProgressDots :total="totalQ" :current="currentIdx" :color="COLOR" />
    </div>

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4">

      <!-- Stimulus hanya soal pertama -->
      <div v-if="currentIdx === 0" class="mb-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-6 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-base">{{ rotationActivity.stimulusTitle }}</h2>
        </div>
        <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p
            v-for="(para, i) in rotationActivity.stimulusText.split('\n\n')"
            :key="i"
            class="font-body text-gray-700 text-sm leading-relaxed"
            :class="{ 'mt-2': i > 0 }"
          >{{ para }}</p>
        </div>
      </div>

      <!-- Voice over Nita -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-lg">👧</div>
        <div class="bg-blue-50 rounded-2xl rounded-tl-none p-3 flex-1">
          <p class="font-body text-blue-700 text-xs leading-snug italic">
            "{{ currentIdx === 0 ? rotationActivity.voiceoverIntro : 'Hebat! Sekarang dari posisi hasil rotasi tadi, dilanjutkan rotasi 180°.' }}"
          </p>
        </div>
      </div>

      <!-- Sub-question -->
      <div class="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-blue-50">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" :style="{ backgroundColor: COLOR }">
            {{ String.fromCharCode(97 + currentIdx) }}
          </div>
          <span class="font-display font-semibold text-gray-600 text-xs uppercase tracking-wide">
            Rotasi {{ currentStep.angle }}° {{ currentStep.direction === 'ccw' ? 'Berlawanan Jarum Jam' : 'Searah Jarum Jam' }}
          </span>
        </div>
        <p class="font-body text-gray-700 text-sm leading-relaxed">{{ currentQ.instruction }}</p>

        <!-- Info titik awal -->
        <div class="mt-2 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: COLOR }" />
          <span class="font-display font-semibold text-blue-700 text-xs">
            Titik awal: {{ currentStep.start.label }}({{ currentStep.start.x }}, {{ currentStep.start.y }})
          </span>
        </div>
      </div>

      <!-- Hint -->
      <Transition name="slide-fade">
        <div v-if="hintIndex >= 0 && hintText" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ hintText }}</p>
        </div>
      </Transition>

      <!-- Tombol sudut putar -->
      <div class="mb-3">
        <p class="font-body text-gray-500 text-xs mb-2 text-center">Tekan tombol sudut putar dan amati perubahannya!</p>
        <div class="flex gap-2">
          <button
            v-for="opt in angleOptions"
            :key="opt.val"
            class="flex-1 py-3 rounded-xl font-display font-semibold text-sm transition-all active:scale-95"
            :style="{
              backgroundColor: selectedAngle === opt.val ? COLOR : 'white',
              color: selectedAngle === opt.val ? 'white' : COLOR,
              border: `2px solid ${COLOR}`,
              opacity: currentIdx === 0 && opt.val !== 90 ? '0.4' : currentIdx === 1 && opt.val !== 180 ? '0.4' : '1'
            }"
            @click="selectAngle(opt.val)"
          >{{ opt.label }}</button>
        </div>
      </div>

      <!-- Bidang Kartesius -->
      <div class="flex justify-center mb-3">
        <CoordinatePlane
          :start-point="currentStep.start"
          :end-point="endPoint ?? previewPoint"
          :show-arrow="!!(endPoint ?? previewPoint)"
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
      <div class="text-6xl mb-4 animate-bounce-in">🔄</div>
      <h2 class="font-display font-bold text-2xl text-gray-700 mb-2">Rotasi Selesai!</h2>
      <div class="bg-blue-50 rounded-2xl p-4 mb-5 text-left">
        <p class="font-body text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ rotationActivity.conceptRule }}</p>
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
