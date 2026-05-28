<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import DragCoordinatePlane from '@/components/geometry/DragCoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer, getCorrectAnswers } from '@/db/db'
import type { Point } from '@/domain/types'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#3d91cf'

const dragSteps = [
  { label: 'a', text: 'Seret motif berlawanan arah jarum jam sebesar 90° → ke titik (−1,2)' },
  { label: 'b', text: 'Seret motif berlawanan arah jarum jam sebesar 180° melewati pusat → ke titik (1,−2)' },
]

// Sub-Q a: A(2,1) → rotate 90° CCW → A'(-1,2)
// Sub-Q b: A'(-1,2) → rotate 180° CW → A''(1,-2)
const subQuestions = [
  {
    id: 'rot-a',
    label: 'a',
    activeDragStep: 0,
    question: 'a. Berapa titik koordinat posisi motif setelah dirotasi 90°?',
    target: { x: -1, y: 2 } as Point,
    draggable: { x: 2, y: 1, label: 'A' },
    fixedMotifs: [] as Array<Point & { label: string; faded?: boolean }>,
    arcGuide: { from: { x: 2, y: 1 }, angleDeg: 90 },  // CCW
    xMin: -3, xMax: 4, yMin: -1, yMax: 4,
    hint: 'Rotasi 90° berlawanan jarum jam: (x,y) → (−y, x). Jadi A(2,1) → (−1, 2).',
    voiceover: 'Seret motif mengikuti arah panah, berlawanan arah jarum jam sebesar 90°!',
    ruleLabel: '90° CCW: (x,y) → (−y, x)',
  },
  {
    id: 'rot-b',
    label: 'b',
    activeDragStep: 1,
    question: "b. Jika dilanjutkan dengan rotasi 180°, berapa titik koordinat posisi motif?",
    target: { x: 1, y: -2 } as Point,
    draggable: { x: -1, y: 2, label: "A'" },
    fixedMotifs: [
      { x: 2, y: 1, label: 'A(2,1)', faded: true },
    ] as Array<Point & { label: string; faded?: boolean }>,
    arcGuide: { from: { x: -1, y: 2 }, angleDeg: 180 },   // CCW (kiri, lanjutan dari sub-Q a)
    xMin: -3, xMax: 4, yMin: -3, yMax: 4,
    hint: "Rotasi 180°: (x,y) → (−x,−y). Jadi A'(−1,2) → (1,−2).",
    voiceover: 'Sekarang seret motif memutar 180° melewati titik pusat O(0,0)!',
    ruleLabel: '180°: (x,y) → (−x, −y)',
  },
]

const currentIdx      = ref(0)
const answerX         = ref('')
const answerY         = ref('')
const attempts        = ref(0)
const usedHint        = ref(false)
const showHintBox     = ref(false)
const showFeedback    = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const feedbackFromPoint = ref<{ label: string; x: number; y: number } | undefined>()
const feedbackToPoint   = ref<{ label: string; x: number; y: number } | undefined>()
const activityScore   = ref(0)
const isFinished      = ref(false)
const dragLocked      = ref(false)
const droppedPos      = ref<Point | null>(null)

const currentQ   = computed(() => subQuestions[currentIdx.value])
const totalQ     = computed(() => subQuestions.length)
const hasDragged = computed(() => droppedPos.value !== null)

const draggablePos = computed(() => {
  if (!currentQ.value.draggable) return null
  if (dragLocked.value) return { ...currentQ.value.target, label: currentQ.value.draggable.label }
  if (droppedPos.value) return { ...droppedPos.value, label: currentQ.value.draggable.label }
  return currentQ.value.draggable
})

// 2 sub-soal × 10 poin = 20 poin maks per aktivitas
const SCORE_PER_SUB = 10

progressStore.setActivityInProgress('rotation')

onMounted(async () => {
  const correct = await getCorrectAnswers('rotation')
  if (correct.length === 0) return
  const correctIds = new Set(correct.map((a) => a.questionId))
  for (const a of correct) activityScore.value += calculateScore(a.attempts, a.usedHint, SCORE_PER_SUB)
  const first = subQuestions.findIndex((q) => !correctIds.has(q.id))
  currentIdx.value = first === -1 ? subQuestions.length - 1 : first
})

function onDrop(point: Point) {
  if (dragLocked.value) return
  droppedPos.value = point
  answerX.value    = String(point.x)
  answerY.value    = String(point.y)
}

function checkDrag() {
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, currentQ.value.target)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value, SCORE_PER_SUB)
    activityScore.value += score
    feedbackCorrect.value = true
    dragLocked.value      = true
    const startLabel = currentQ.value.draggable!.label
    const startPt    = currentQ.value.draggable!
    feedbackMessage.value   = `Jawabanmu benar! Motif berpindah dari ${startLabel}(${startPt.x},${startPt.y}) ke (${x},${y}).`
    feedbackFromPoint.value = { label: `${startLabel}(${startPt.x},${startPt.y})`, x: startPt.x, y: startPt.y }
    feedbackToPoint.value   = { label: `${startLabel}'(${x},${y})`, x, y }
    saveAnswer({
      activityId: 'rotation', questionId: currentQ.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    feedbackCorrect.value   = false
    feedbackMessage.value   = attempts.value >= 2
      ? `Belum tepat. Jawaban yang benar adalah (${currentQ.value.target.x},${currentQ.value.target.y}). ${currentQ.value.hint}`
      : 'Belum tepat! Ikuti arah panah putaran, lalu seret ke posisi yang benar.'
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    dragLocked.value        = false
    droppedPos.value        = null
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    if (currentIdx.value < totalQ.value - 1) {
      currentIdx.value++
      answerX.value     = ''
      answerY.value     = ''
      attempts.value    = 0
      usedHint.value    = false
      showHintBox.value = false
    } else {
      progressStore.setActivityScore('rotation', activityScore.value, attempts.value)
      isFinished.value = true
    }
  } else {
    dragLocked.value = false
  }
}

function showHint() {
  usedHint.value    = true
  showHintBox.value = true
}
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Rotasi (Perputaran)" :color="COLOR" :show-help="true" @help="showHint" />

    <div class="px-4 pt-3 pb-2 shrink-0 flex justify-center">
      <ProgressDots :total="totalQ" :current="currentIdx" :color="COLOR" />
    </div>

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4 pb-4">

      <!-- Stimulus / Cerita -->
      <div class="mb-3 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-5 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-sm">Cerita</h2>
        </div>
        <div class="rounded-2xl p-4 border text-sm leading-relaxed font-body text-gray-700"
             :style="{ backgroundColor: COLOR + '10', borderColor: COLOR + '30' }">
          Ibu Nita membuat pola berbentuk bunga yang melingkar. Pola bunga tersebut berada di titik
          <strong>(2,1)</strong>. Kemudian ia membuat satu motif lagi dengan memutar motif
          <strong>berlawanan arah jarum jam sebesar 90°</strong> terhadap titik pusat (0,0).
          <br /><br />
          Setelah beberapa menit, Ibu Nita melanjutkan lagi dengan memutar motif
          <strong>berlawanan arah jarum jam sebesar 180°</strong>. Nita sangat terkesan melihat pola karawo yang terbentuk.
        </div>
      </div>

      <!-- Daftar Instruksi Drag -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-2 uppercase tracking-wide">Instruksi — Drag &amp; Drop</p>
        <div class="space-y-2">
          <div
            v-for="(step, i) in dragSteps"
            :key="step.label"
            class="flex items-start gap-3 rounded-xl px-3 py-2 transition-colors"
            :class="{
              'bg-gray-50 opacity-60': i < currentIdx,
              'opacity-40': i > currentQ.activeDragStep,
            }"
          >
            <div
              class="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
              :class="i < currentIdx ? 'bg-green-500 text-white' : 'text-white'"
              :style="i >= currentIdx && i === currentQ.activeDragStep ? { backgroundColor: COLOR } : i < currentIdx ? {} : { backgroundColor: '#D1D5DB' }"
            >
              <span v-if="i < currentIdx">✓</span>
              <span v-else>{{ step.label }}</span>
            </div>
            <p class="font-body text-xs leading-relaxed"
               :class="i === currentQ.activeDragStep ? 'text-gray-800 font-semibold' : 'text-gray-500'">
              {{ step.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- Nita voiceover -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
             :style="{ backgroundColor: COLOR + '20' }">👧</div>
        <div class="rounded-2xl rounded-tl-none p-3 flex-1" :style="{ backgroundColor: COLOR + '10' }">
          <p class="font-body text-xs leading-snug italic" :style="{ color: COLOR }">
            "{{ currentQ.voiceover }}"
          </p>
        </div>
      </div>

      <!-- Hint -->
      <Transition name="slide-fade">
        <div v-if="showHintBox" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ currentQ.hint }}</p>
        </div>
      </Transition>

      <!-- Grid Kartesius -->
      <div class="flex justify-center mb-3 bg-white rounded-3xl p-3 shadow-sm border border-gray-100">
        <DragCoordinatePlane
          :fixed-motifs="currentQ.fixedMotifs"
          :draggable="draggablePos"
          :x-min="currentQ.xMin"
          :x-max="currentQ.xMax"
          :y-min="currentQ.yMin"
          :y-max="currentQ.yMax"
          :size="264"
          :motif-color="COLOR"
          :disabled="dragLocked"
          :arc-guide="{ ...currentQ.arcGuide, color: COLOR }"
          @drop="onDrop"
        />
      </div>

      <!-- Info aturan rotasi -->
      <div class="flex justify-center mb-3">
        <div class="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
          <span class="font-body text-gray-500 text-xs">Aturan rotasi:</span>
          <span class="font-display font-bold text-sm" :style="{ color: COLOR }">{{ currentQ.ruleLabel }}</span>
        </div>
      </div>

      <!-- Pertanyaan + input koordinat -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
        <p class="font-body text-gray-400 text-xs mb-3">
          {{ hasDragged ? 'Koordinat hasil seretanmu — periksa sebelum menekan Cek Jawaban:' : 'Seret motif mengikuti panah, lalu jawab di sini.' }}
        </p>
        <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform"
          :style="{ borderColor: COLOR, color: COLOR }"
          @click="showHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          :style="{ backgroundColor: COLOR }"
          :disabled="!hasDragged || dragLocked"
          @click="checkDrag"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div class="text-6xl animate-bounce-in">🔄</div>
      <h2 class="font-display font-bold text-2xl text-gray-700">Rotasi Selesai!</h2>
      <div class="bg-white rounded-2xl p-4 text-left w-full shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Rangkuman Rotasi</p>
        <div class="space-y-3">
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <div>
              <p class="font-display font-semibold text-xs text-gray-700">Rotasi 90° berlawanan jarum jam</p>
              <p class="font-body text-xs text-gray-500">(x, y) → (−y, x) &nbsp;→&nbsp; A(2,1) → A'(−1, 2)</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <div>
              <p class="font-display font-semibold text-xs text-gray-700">Rotasi 180°</p>
              <p class="font-body text-xs text-gray-500">(x, y) → (−x, −y) &nbsp;→&nbsp; A'(−1,2) → A''(1, −2)</p>
            </div>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <p class="font-body text-xs text-gray-500 leading-relaxed">
            Jarak motif terhadap pusat tetap sama — hanya arahnya yang berubah.
          </p>
        </div>
      </div>
      <button
        class="w-full py-4 rounded-2xl text-white font-display font-semibold text-base shadow-lg active:scale-95 transition-transform"
        :style="{ backgroundColor: COLOR }"
        @click="router.push('/home')"
      >Kembali ke Beranda</button>
    </div>

    <FeedbackModal
      :show="showFeedback"
      :is-correct="feedbackCorrect"
      :message="feedbackMessage"
      :from-point="feedbackFromPoint"
      :to-point="feedbackToPoint"
      @next="onFeedbackNext"
    />
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-8px); }
</style>
