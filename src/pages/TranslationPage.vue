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
const COLOR = '#942b3a'

// Daftar instruksi drag (3 langkah a, b, c)
const dragSteps = [
  { label: 'a', text: 'Letakkan motif karawo pada titik (2,1)' },
  { label: 'b', text: 'Seret motif karawo 5 satuan ke kanan dan 4 satuan ke atas' },
  { label: 'c', text: 'Seret kembali motif karawo 5 satuan ke kanan dan 4 satuan ke atas' },
]

// 4 sub-pertanyaan:
//  0 → drag step a : siswa meletakkan motif di (2,1)  — grid kosong, target (2,1)
//  1 → drag step b : seret ke (7,5)                   — jawab pertanyaan a
//  2 → drag step c : seret ke (12,9)                  — jawab pertanyaan b
//  3 → input only  : hitung (17,13)                   — jawab pertanyaan c
const subQuestions = [
  {
    id: 'trans-place',
    label: 'a',
    isDrag: true,
    isPlacement: true,          // step pertama: letakkan, bukan translasi
    activeDragStep: 0,
    dragInstruction: 'Letakkan motif karawo pada titik (2,1) sebagai titik pertama.',
    question: 'Letakkan motif karawo pada titik (2,1).',
    hint: 'Perhatikan angka koordinat yang disebut dalam cerita, lalu seret motif ke posisi tersebut.',
    target: { x: 2, y: 1 } as Point,
    draggable: { x: 0, y: 0, label: 'A' },
    fixedMotifs: [] as Array<Point & { label: string; faded?: boolean }>,
    xMin: -1, xMax: 5, yMin: -1, yMax: 4,
    voiceover: 'Coba letakkan motif pertama pada titik (2,1) ya!',
  },
  {
    id: 'trans-a',
    label: 'b',
    isDrag: true,
    isPlacement: false,
    activeDragStep: 1,
    dragInstruction: 'Seret motif karawo 5 satuan ke kanan dan 4 satuan ke atas dari titik (2,1).',
    question: 'a. Di titik manakah motif kedua berada?',
    hint: 'Translasi (5, 4) artinya geser 5 ke kanan dan 4 ke atas. Tambahkan nilai itu pada koordinat titik saat ini!',
    target: { x: 7, y: 5 } as Point,
    draggable: { x: 2, y: 1, label: "A'" },
    fixedMotifs: [{ x: 2, y: 1, label: 'A(2,1)', faded: false }] as Array<Point & { label: string; faded?: boolean }>,
    xMin: 0, xMax: 9, yMin: 0, yMax: 7,
    voiceover: 'Seret motif dari titik (2,1) sebesar 5 ke kanan dan 4 ke atas ya!',
  },
  {
    id: 'trans-b',
    label: 'c',
    isDrag: true,
    isPlacement: false,
    activeDragStep: 2,
    dragInstruction: 'Seret kembali motif karawo 5 satuan ke kanan dan 4 satuan ke atas dari titik (7,5).',
    question: 'b. Setelah digeser kembali, di manakah titik motif ketiga berada?',
    hint: 'Aturan translasinya selalu sama. Tambahkan nilai pergeseran pada koordinat titik yang baru saja kamu temukan!',
    target: { x: 12, y: 9 } as Point,
    draggable: { x: 7, y: 5, label: "A''" },
    fixedMotifs: [
      { x: 2, y: 1, label: 'A(2,1)', faded: true },
      { x: 7, y: 5, label: "A'(7,5)", faded: false },
    ] as Array<Point & { label: string; faded?: boolean }>,
    xMin: 5, xMax: 14, yMin: 3, yMax: 11,
    voiceover: 'Bagus! Sekarang seret lagi 5 satuan ke kanan dan 4 satuan ke atas!',
  },
  {
    id: 'trans-c',
    label: 'c',
    isDrag: false,
    isPlacement: false,
    activeDragStep: -1,
    dragInstruction: '',
    question: 'c. Tanpa menggeser motif ketiga, di manakah motif keempat akan berada?',
    hint: 'Gunakan rumus translasi yang sama seperti sebelumnya: tambahkan nilai pergeseran pada koordinat titik ketiga.',
    target: { x: 17, y: 13 } as Point,
    draggable: null,
    fixedMotifs: [] as Array<Point & { label: string; faded?: boolean }>,
    xMin: 0, xMax: 8, yMin: 0, yMax: 7,
    voiceover: 'Sekarang tanpa menyeret, hitung sendiri posisi motif keempat!',
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
const activityScore   = ref(0)
const isFinished      = ref(false)
const dragLocked      = ref(false)
const droppedPos      = ref<Point | null>(null)
const feedbackFromPoint = ref<{ label: string; x: number; y: number } | undefined>(undefined)
const feedbackToPoint   = ref<{ label: string; x: number; y: number } | undefined>(undefined)

const currentQ = computed(() => subQuestions[currentIdx.value])
const totalQ   = computed(() => subQuestions.length)
const hasDragged = computed(() => droppedPos.value !== null)

// Posisi visual motif: terkunci di target jika benar, di droppedPos jika sudah di-drop, atau posisi awal
const draggablePos = computed(() => {
  if (!currentQ.value.draggable) return null
  if (dragLocked.value) return { ...currentQ.value.target, label: currentQ.value.draggable.label }
  if (droppedPos.value) return { ...droppedPos.value, label: currentQ.value.draggable.label }
  return currentQ.value.draggable
})

// 4 sub-soal × 5 poin = 20 poin maks per aktivitas
const SCORE_PER_SUB = 5

progressStore.setActivityInProgress('translation')

onMounted(async () => {
  const correct = await getCorrectAnswers('translation')
  if (correct.length === 0) return
  const correctIds = new Set(correct.map((a) => a.questionId))
  // Pulihkan skor dari sesi sebelumnya
  for (const a of correct) {
    activityScore.value += calculateScore(a.attempts, a.usedHint, SCORE_PER_SUB)
  }
  // Lompat ke sub-soal pertama yang belum terjawab benar
  const first = subQuestions.findIndex((q) => !correctIds.has(q.id))
  currentIdx.value = first === -1 ? subQuestions.length - 1 : first
})

// ── Handler drag: hanya isi input, belum cek jawaban ─────────────────────────
function onDrop(point: Point) {
  if (dragLocked.value) return
  droppedPos.value = point
  answerX.value    = String(point.x)
  answerY.value    = String(point.y)
}

// ── Cek jawaban drag ─────────────────────────────────────────────────────────
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

    if (currentQ.value.isPlacement) {
      feedbackMessage.value   = `Tepat! Motif pertama sudah diletakkan di titik (${x},${y}).`
      feedbackFromPoint.value = undefined
      feedbackToPoint.value   = undefined
    } else {
      feedbackMessage.value   = 'Jawabanmu benar. Motif hanya berpindah tanpa mengubah bentuk dan ukurannya.'
      const lastFixed = currentQ.value.fixedMotifs.at(-1)
      feedbackFromPoint.value = lastFixed
        ? { label: lastFixed.label, x: lastFixed.x, y: lastFixed.y }
        : undefined
      feedbackToPoint.value   = { label: currentQ.value.draggable!.label, x, y }
    }

    saveAnswer({
      activityId: 'translation', questionId: currentQ.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    feedbackCorrect.value   = false
    feedbackMessage.value   = attempts.value >= 2
      ? `Belum tepat. Jawaban yang benar adalah (${currentQ.value.target.x},${currentQ.value.target.y}).\n${currentQ.value.hint}`
      : 'Belum tepat! Coba seret motif ke posisi yang benar, lalu tekan Cek Jawaban.'
  }
  showFeedback.value = true
}

// ── Handler input sub-Q c ────────────────────────────────────────────────────
function checkInput() {
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, currentQ.value.target)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value, SCORE_PER_SUB)
    activityScore.value += score
    feedbackCorrect.value   = true
    feedbackMessage.value   = 'Jawabanmu benar. Motif hanya berpindah tanpa mengubah bentuk dan ukurannya.'
    feedbackFromPoint.value = { label: "A''", x: 12, y: 9 }
    feedbackToPoint.value   = { label: "A'''", x, y }
    saveAnswer({
      activityId: 'translation', questionId: currentQ.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    feedbackCorrect.value   = false
    feedbackMessage.value   = attempts.value >= 2
      ? `Jawaban yang benar adalah (${currentQ.value.target.x},${currentQ.value.target.y}). Gunakan rumus (12+5, 9+4).`
      : 'Belum tepat! Gunakan rumus translasi: tambahkan 5 pada x dan 4 pada y dari A\'\'(12,9).'
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
      progressStore.setActivityScore('translation', activityScore.value, attempts.value)
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

const patternPoints = [
  { label: 'A', x: 2, y: 1 },
  { label: "A'", x: 7, y: 5 },
  { label: "A''", x: 12, y: 9 },
]
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Translasi (Pergeseran)" :color="COLOR" :show-help="true" @help="showHint" />

    <div class="px-4 pt-3 pb-2 shrink-0 flex justify-center">
      <ProgressDots :total="totalQ" :current="currentIdx" :color="COLOR" />
    </div>

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4 pb-4">

      <!-- ── Stimulus / Cerita ── -->
      <div class="mb-3 mt-1">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-5 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-sm">Cerita</h2>
        </div>
        <div class="rounded-2xl p-4 border text-sm leading-relaxed font-body text-gray-700" :style="{ backgroundColor: COLOR + '10', borderColor: COLOR + '30' }">
          Suatu hari, Nita membantu ibunya yang sedang menyulam kain karawo. Ia memperhatikan bahwa
          ibunya tidak menggambar ulang setiap motif bunga, tetapi hanya memindahkan pola yang sama
          ke posisi lain sehingga kain terlihat rapi dan berulang.
          <br /><br />
          Nita mulai membuat motif pertama pada titik <strong>(2,1)</strong>. Kemudian ia memindahkan
          motif tersebut <strong>5 satuan ke kanan dan 4 satuan ke atas</strong> untuk membuat motif berikutnya.
        </div>
      </div>

      <!-- ── Daftar Instruksi Drag ── -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-2 uppercase tracking-wide">Instruksi — Drag &amp; Drop</p>
        <div class="space-y-2">
          <div
            v-for="(step, i) in dragSteps"
            :key="step.label"
            class="flex items-start gap-3 rounded-xl px-3 py-2 transition-colors"
            :class="{
              'bg-gray-50 opacity-60': i < currentIdx,
              'opacity-40': (currentQ.isDrag && i > currentQ.activeDragStep) || !currentQ.isDrag,
            }"
          >
            <!-- status icon -->
            <div
              class="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
              :class="i < currentIdx
                ? 'bg-green-500 text-white'
                : (currentQ.isDrag && i === currentQ.activeDragStep ? 'text-white' : 'bg-gray-200 text-gray-500')"
              :style="currentQ.isDrag && i === currentQ.activeDragStep ? { backgroundColor: COLOR } : {}"
            >
              <span v-if="i < currentIdx">✓</span>
              <span v-else>{{ step.label }}</span>
            </div>
            <p class="font-body text-xs leading-relaxed"
               :class="currentQ.isDrag && i === currentQ.activeDragStep ? 'text-gray-800 font-semibold' : 'text-gray-500'">
              {{ step.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Nita voiceover ── -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg" :style="{ backgroundColor: COLOR + '20' }">👧</div>
        <div class="rounded-2xl rounded-tl-none p-3 flex-1" :style="{ backgroundColor: COLOR + '10' }">
          <p class="font-body text-xs leading-snug italic" :style="{ color: COLOR }">"{{ currentQ.voiceover }}"</p>
        </div>
      </div>

      <!-- ── Hint ── -->
      <Transition name="slide-fade">
        <div v-if="showHintBox" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ currentQ.hint }}</p>
        </div>
      </Transition>

      <!-- ── DRAG mode (sub-Q a & b) ── -->
      <template v-if="currentQ.isDrag">
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
            @drop="onDrop"
          />
        </div>

        <!-- Vektor info (hanya untuk langkah translasi, bukan penempatan) -->
        <div v-if="!currentQ.isPlacement" class="flex justify-center mb-3">
          <div class="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
            <span class="font-body text-gray-500 text-xs">Vektor translasi:</span>
            <span class="font-display font-bold text-sm" :style="{ color: COLOR }">T(5, 4)</span>
            <span class="font-body text-gray-400 text-xs">→ +5 kanan, +4 atas</span>
          </div>
        </div>

        <!-- Pertanyaan + input koordinat -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
          <p class="font-body text-gray-400 text-xs mb-3">
            {{ hasDragged ? 'Koordinat hasil seretanmu — periksa sebelum menekan Cek Jawaban:' : 'Seret motif terlebih dahulu, lalu jawab di sini.' }}
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
      </template>

      <!-- ── INPUT mode (sub-Q c) ── -->
      <template v-else>
        <!-- Pola yang ditemukan -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-500 text-xs mb-2 uppercase tracking-wide">Pola yang kamu temukan:</p>
          <div class="space-y-1.5">
            <div v-for="(pt, i) in patternPoints" :key="i" class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: COLOR }" />
              <span class="font-display font-semibold text-xs text-gray-700">{{ pt.label }}({{ pt.x }}, {{ pt.y }})</span>
              <span v-if="i < patternPoints.length - 1" class="font-body text-xs text-gray-400">→ +5, +4</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full shrink-0 bg-primary/40" />
              <span class="font-display font-semibold text-xs text-primary">Motif ke-4 ( ? , ? )</span>
            </div>
          </div>
        </div>

        <!-- Pertanyaan + input -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
          <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform"
            :style="{ borderColor: COLOR, color: COLOR }"
            @click="showHint"
          >💡 Petunjuk</button>
          <button
            class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md"
            :style="{ backgroundColor: COLOR }"
            @click="checkInput"
          >Cek Jawaban</button>
        </div>
      </template>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="text-6xl mb-4 animate-bounce-in">🎉</div>
      <h2 class="font-display font-bold text-2xl text-gray-700 mb-2">Translasi Selesai!</h2>
      <div class="bg-red-50 rounded-2xl p-4 mb-4 text-left">
        <p class="font-display font-semibold text-gray-600 text-xs mb-2 uppercase tracking-wide">Rangkuman Pergeseran:</p>
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: COLOR }" />
            <span class="font-body text-gray-600 text-xs">A(2,1) — titik awal</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-purple-400" />
            <span class="font-body text-gray-600 text-xs">A'(7,5) — setelah T(5,4)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-400" />
            <span class="font-body text-gray-600 text-xs">A''(12,9) — setelah T(5,4) lagi</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emerald-400" />
            <span class="font-body text-gray-600 text-xs">A'''(17,13) — setelah T(5,4) ketiga</span>
          </div>
        </div>
      </div>
      <div class="bg-red-50 rounded-2xl p-4 mb-5 text-left">
        <p class="font-body text-sm text-gray-700 leading-relaxed">
          <strong>Aturan Translasi:</strong><br>
          (x, y) → (x + a, y + b)<br>
          Setiap titik digeser dengan jarak yang sama tanpa berubah bentuk.
        </p>
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
