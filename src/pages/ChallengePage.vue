<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import InteractiveChallengeGraph from '@/components/geometry/InteractiveChallengeGraph.vue'
import type { ColoredMotif } from '@/components/geometry/InteractiveChallengeGraph.vue'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'
import type { Point } from '@/domain/types'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#6f5b9d'

interface SubStep {
  id: string
  stepLabel: string
  transformLabel: string
  rule: string
  detail: string
  instruction: string
  draggableStart: Point & { label: string }
  target: Point
  color: string
  hint: string
  icon: string
  voiceover: string
  maxPoints: number  // 7+7+6 = 20 total maks
}

const subSteps: SubStep[] = [
  {
    id: 'ch-step-0',
    stepLabel: 'Langkah 1',
    transformLabel: 'Translasi',
    rule: 'P(1,1) → (3,2)',
    detail: 'Titik awal P(1,1) digeser langsung ke titik (3,2)',
    instruction: "Seret motif P' ke posisi hasil translasi dari P(1,1)!",
    draggableStart: { x: 1, y: 1, label: "P'" },
    target: { x: 3, y: 2 },
    color: '#ec6585',
    hint: "Translasi (a, b): tambahkan nilai a pada koordinat x dan b pada koordinat y dari titik asal. Hitung dari P(1,1)!",
    icon: 'arrow_forward',
    voiceover: "Ayo seret motif P' ke posisi hasil translasi! P(1,1) digeser ke titik (3,2).",
    maxPoints: 7,
  },
  {
    id: 'ch-step-1',
    stepLabel: 'Langkah 2',
    transformLabel: 'Refleksi Sumbu X',
    rule: "(x,y) → (x, −y)",
    detail: "P'(3,2) dicerminkan terhadap sumbu X → nilai y berubah tanda",
    instruction: "Seret motif P'' ke posisi bayangan dari P'(3,2) terhadap sumbu X!",
    draggableStart: { x: 3, y: 2, label: "P''" },
    target: { x: 3, y: -2 },
    color: '#f79624',
    hint: "Refleksi sumbu X: nilai y berubah tanda, nilai x tetap sama. Terapkan rumus (x, y) → (x, −y) pada koordinat saat ini!",
    icon: 'flip',
    voiceover: "Sekarang cerminkan! Seret P'' ke bayangan P'(3,2) terhadap sumbu X.",
    maxPoints: 7,
  },
  {
    id: 'ch-step-2',
    stepLabel: 'Langkah 3',
    transformLabel: 'Rotasi 90° Searah Jarum Jam',
    rule: "(x,y) → (y, −x)",
    detail: "P''(3,−2) diputar 90° searah jarum jam terhadap O(0,0)",
    instruction: "Seret motif P''' ke posisi akhir setelah diputar 90° searah jarum jam!",
    draggableStart: { x: 3, y: -2, label: "P'''" },
    target: { x: -2, y: -3 },
    color: '#3d91cf',
    hint: "Rotasi 90° searah jarum jam: gunakan rumus (x, y) → (y, −x). Terapkan pada koordinat hasil langkah sebelumnya!",
    icon: 'refresh',
    voiceover: "Langkah terakhir! Putar P'' searah jarum jam 90°. Seret P''' ke posisi akhirnya.",
    maxPoints: 6,
  },
]

const currentIdx    = ref(0)
const answerX       = ref('')
const answerY       = ref('')
const attempts      = ref(0)
const usedHint      = ref(false)
const showHintBox   = ref(false)
const showFeedback  = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const isFinished    = ref(false)
const dragLocked    = ref(false)
const droppedPos    = ref<Point | null>(null)
const activityScore = ref(0)

// Accumulated results per step (color + coords)
const completedPoints = ref<ColoredMotif[]>([])

progressStore.setActivityInProgress('challenge')

const currentSubStep = computed(() => subSteps[currentIdx.value])
const hasDragged     = computed(() => droppedPos.value !== null)

// P(1,1) always present as first fixed motif; fade it after step 0
const fixedMotifs = computed((): ColoredMotif[] => {
  const list: ColoredMotif[] = [
    { x: 1, y: 1, label: 'P', color: COLOR, faded: currentIdx.value > 0 },
  ]
  completedPoints.value.forEach((pt, i) => {
    list.push({ ...pt, faded: i < completedPoints.value.length - 1 })
  })
  return list
})

const draggablePos = computed(() => {
  if (dragLocked.value) {
    return { ...currentSubStep.value.target, label: currentSubStep.value.draggableStart.label }
  }
  if (droppedPos.value) {
    return { ...droppedPos.value, label: currentSubStep.value.draggableStart.label }
  }
  return currentSubStep.value.draggableStart
})

function onDrop(point: Point) {
  if (dragLocked.value) return
  droppedPos.value = point
  answerX.value    = String(point.x)
  answerY.value    = String(point.y)
}

function checkAnswer() {
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, currentSubStep.value.target)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value, currentSubStep.value.maxPoints)
    activityScore.value += score
    feedbackCorrect.value = true
    feedbackMessage.value =
      `${currentSubStep.value.transformLabel}: ${currentSubStep.value.rule}. ` +
      `${currentSubStep.value.detail}.`
    dragLocked.value = true
    saveAnswer({
      activityId: 'challenge',
      questionId: currentSubStep.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value = false
    feedbackMessage.value = attempts.value >= 2
      ? `Jawaban yang benar adalah (${currentSubStep.value.target.x}, ${currentSubStep.value.target.y}). ${currentSubStep.value.hint}`
      : 'Belum tepat. Perhatikan aturan transformasinya dan seret motif ke posisi yang benar!'
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    // Simpan hasil langkah ke accumulated list
    const alreadyAdded = completedPoints.value.some(
      p => p.label === currentSubStep.value.draggableStart.label,
    )
    if (!alreadyAdded) {
      completedPoints.value.push({
        x: currentSubStep.value.target.x,
        y: currentSubStep.value.target.y,
        label: currentSubStep.value.draggableStart.label,
        color: currentSubStep.value.color,
      })
    }
    if (currentIdx.value < subSteps.length - 1) {
      currentIdx.value++
      answerX.value    = ''
      answerY.value    = ''
      attempts.value   = 0
      usedHint.value   = false
      showHintBox.value = false
      dragLocked.value = false
      droppedPos.value = null
    } else {
      progressStore.setActivityScore('challenge', activityScore.value, attempts.value)
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
    <TopBar title="Tantangan Akhir" :color="COLOR" :show-help="true" @help="showHint" />

    <!-- ── SOAL ── -->
    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4 pb-4 pt-3">

      <!-- Header badge -->
      <div class="flex items-center gap-3 rounded-2xl p-3 mb-3" :style="{ backgroundColor: COLOR + '15' }">
        <span class="material-symbols-outlined text-3xl text-star-yellow"
              style="font-variation-settings: 'FILL' 1;">emoji_events</span>
        <div>
          <h2 class="font-display font-bold text-base" :style="{ color: COLOR }">Soal Tantangan HOTS</h2>
          <p class="font-body text-xs text-on-surface-variant">Gabungkan semua transformasi geometri!</p>
        </div>
      </div>

      <!-- Progress -->
      <div class="flex justify-center mb-3">
        <ProgressDots :total="subSteps.length" :current="currentIdx" :color="COLOR" />
      </div>

      <!-- Stimulus soal (compact) -->
      <div class="rounded-2xl p-3 border mb-3 font-body text-gray-700 text-xs leading-relaxed"
           :style="{ backgroundColor: COLOR + '08', borderColor: COLOR + '25' }">
        Nita memulai dari titik <strong>P(1,1)</strong>, lalu:
        <span class="inline-flex gap-3 mt-1 flex-wrap">
          <span>① Geser ke <strong>(3,2)</strong></span>
          <span>② Cermin <strong>sumbu X</strong></span>
          <span>③ Putar <strong>90° CW</strong> dari O(0,0)</span>
        </span>
      </div>

      <!-- ── GRAFIK INTERAKTIF ── -->
      <div class="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 mb-3">
        <InteractiveChallengeGraph
          :fixed-motifs="fixedMotifs"
          :draggable="draggablePos"
          :draggable-color="currentSubStep.color"
          :disabled="dragLocked"
          :size="264"
          @drop="onDrop"
        />
        <p class="font-body text-xs text-center mt-1 text-gray-400">
          {{ dragLocked ? '✓ Posisi dikunci' : hasDragged ? `Diseret ke (${answerX}, ${answerY}) — periksa sebelum Cek Jawaban` : 'Seret motif ke posisi yang benar' }}
        </p>
      </div>

      <!-- Step info card -->
      <div class="rounded-2xl p-3 border mb-3 transition-all"
           :style="{ backgroundColor: currentSubStep.color + '10', borderColor: currentSubStep.color + '35' }">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
               :style="{ backgroundColor: currentSubStep.color }">
            <span class="material-symbols-outlined text-white text-sm">{{ currentSubStep.icon }}</span>
          </div>
          <div>
            <p class="font-display font-bold text-sm text-gray-700">
              {{ currentSubStep.stepLabel }} — {{ currentSubStep.transformLabel }}
            </p>
            <p class="font-body text-xs" :style="{ color: currentSubStep.color }">{{ currentSubStep.rule }}</p>
          </div>
        </div>
        <!-- Nita voiceover -->
        <div class="flex items-start gap-2 mt-2">
          <span class="text-base shrink-0">👧</span>
          <p class="font-body text-xs leading-snug italic text-gray-600">
            "{{ currentSubStep.voiceover }}"
          </p>
        </div>
      </div>

      <!-- Petunjuk -->
      <Transition name="slide-fade">
        <div v-if="showHintBox"
             class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ currentSubStep.hint }}</p>
        </div>
      </Transition>

      <!-- Input koordinat -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-700 text-sm text-center mb-1">
          {{ currentSubStep.instruction }}
        </p>
        <p class="font-body text-xs text-gray-400 text-center mb-3">
          {{ hasDragged ? 'Koordinat dari seretanmu — ubah jika perlu:' : 'Seret motif di atas, atau ketik langsung:' }}
        </p>
        <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="currentSubStep.color" />
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform"
          :style="{ borderColor: currentSubStep.color, color: currentSubStep.color }"
          @click="showHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md disabled:opacity-40"
          :style="{ backgroundColor: currentSubStep.color }"
          :disabled="(!hasDragged && !answerX) || dragLocked"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- ── SELESAI ── -->
    <div v-else class="flex-1 page-scroll hide-scrollbar px-6 py-6 flex flex-col items-center text-center gap-4">
      <div class="text-7xl animate-bounce-in">🏆</div>
      <h2 class="font-display font-bold text-3xl text-primary">Luar Biasa!</h2>
      <p class="font-body text-sm text-on-surface-variant leading-relaxed">
        Kamu berhasil menggabungkan <strong>Translasi</strong>, <strong>Refleksi</strong>, dan
        <strong>Rotasi</strong>! Itulah kehebatan transformasi geometri dalam motif Karawo.
      </p>

      <!-- Pembahasan lengkap -->
      <div class="bg-white rounded-2xl p-4 text-left w-full shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">
          Pembahasan Lengkap
        </p>
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

          <div v-for="(step, i) in subSteps" :key="i">
            <div class="flex justify-center my-1">
              <span class="material-symbols-outlined text-gray-300 text-lg">arrow_downward</span>
            </div>
            <div class="flex items-start gap-2">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                   :style="{ backgroundColor: step.color }">
                <span class="font-display font-bold text-xs">{{ i + 1 }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-1 flex-wrap">
                  <p class="font-display font-semibold text-xs text-gray-700">{{ step.transformLabel }}</p>
                  <span class="font-body text-xs px-1.5 py-0.5 rounded"
                        :style="{ backgroundColor: step.color + '15', color: step.color }">
                    {{ step.rule }}
                  </span>
                </div>
                <p class="font-body text-xs text-gray-500 mt-0.5">{{ step.detail }}</p>
              </div>
              <span class="font-display font-bold text-xs px-2 py-1 rounded-lg text-white shrink-0"
                    :style="{ backgroundColor: step.color }">
                ({{ step.target.x }}, {{ step.target.y }})
              </span>
            </div>
          </div>

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
      :from-point="feedbackCorrect
        ? { label: currentIdx > 0
            ? subSteps[currentIdx - 1]?.draggableStart.label ?? 'P'
            : 'P', x: currentSubStep.draggableStart.x, y: currentSubStep.draggableStart.y }
        : undefined"
      :to-point="feedbackCorrect
        ? { label: currentSubStep.draggableStart.label,
            x: currentSubStep.target.x, y: currentSubStep.target.y }
        : undefined"
      :next-label="feedbackCorrect
        ? (currentIdx < subSteps.length - 1 ? 'Langkah Berikutnya' : 'Lihat Hasil!')
        : 'Coba Lagi'"
      @next="onFeedbackNext"
    />
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(-8px); }
</style>
