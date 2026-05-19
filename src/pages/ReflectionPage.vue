<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinatePlane from '@/components/geometry/CoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer, getCorrectAnswers } from '@/db/db'
import type { ReflectionAxis } from '@/domain/types'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#f79624'

const ORIGIN = { label: 'A(4,3)', x: 4, y: 3 }

const subQuestions = [
  {
    id: 'refl-y',
    label: 'a',
    axis: 'y' as ReflectionAxis,
    needsMirrorClick: true,
    question: 'a. Tentukan titik bayangan dari motif karawo tersebut!',
    target: { x: -4, y: 3 },
    reflection: { x: -4, y: 3, label: "A'(-4,3)" },
    rule: '(x, y) → (−x, y)',
    hint: "Refleksi sumbu Y: nilai x berubah tanda, nilai y tetap. Rumus: A(4,3) → (−4, 3).",
    voiceover: 'Ketuk garis cermin Sumbu Y untuk melihat bayangan motifnya!',
  },
  {
    id: 'refl-x',
    label: 'b',
    axis: 'x' as ReflectionAxis,
    needsMirrorClick: false,
    question: 'b. Jika motif tersebut dicerminkan terhadap sumbu-X, berapa titik bayangan motif karawo tersebut?',
    target: { x: 4, y: -3 },
    reflection: { x: 4, y: -3, label: "A'(4,-3)" },
    rule: '(x, y) → (x, −y)',
    hint: "Refleksi sumbu X: nilai y berubah tanda, nilai x tetap. Rumus: A(4,3) → (4, −3).",
    voiceover: 'Sekarang bayangkan cermin ada di sumbu X. Di mana posisi bayangannya?',
  },
]

const currentIdx       = ref(0)
const answerX          = ref('')
const answerY          = ref('')
const attempts         = ref(0)
const usedHint         = ref(false)
const showHintBox      = ref(false)
const showFeedback     = ref(false)
const feedbackCorrect  = ref(false)
const feedbackMessage  = ref('')
const feedbackFromPoint = ref<{ label: string; x: number; y: number } | undefined>()
const feedbackToPoint   = ref<{ label: string; x: number; y: number } | undefined>()
const activityScore    = ref(0)
const isFinished       = ref(false)
const mirrorClicked    = ref(false)
const showReflection   = ref(false)  // tampilkan bayangan di grid setelah jawaban benar

const currentQ = computed(() => subQuestions[currentIdx.value])
const totalQ   = computed(() => subQuestions.length)

// Titik bayangan di grid:
// - sub-Q y: muncul setelah mirrorClicked
// - sub-Q x: muncul setelah jawaban benar
const gridEndPoint = computed(() => {
  const q = currentQ.value
  if (q.needsMirrorClick && mirrorClicked.value) return q.reflection
  if (!q.needsMirrorClick && showReflection.value) return q.reflection
  return undefined
})

progressStore.setActivityInProgress('reflection')

onMounted(async () => {
  const correct = await getCorrectAnswers('reflection')
  if (correct.length === 0) return
  const correctIds = new Set(correct.map((a) => a.questionId))
  for (const a of correct) activityScore.value += calculateScore(a.attempts, a.usedHint)
  const first = subQuestions.findIndex((q) => !correctIds.has(q.id))
  currentIdx.value = first === -1 ? subQuestions.length - 1 : first
})

function checkAnswer() {
  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  attempts.value++
  const correct = isSamePoint({ x, y }, currentQ.value.target)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value  = true
    showReflection.value   = true
    const axisLabel = currentQ.value.axis === 'y' ? 'Sumbu Y' : 'Sumbu X'
    feedbackMessage.value  = `Jawabanmu benar! Bayangan A(4,3) terhadap ${axisLabel} adalah (${x},${y}).`
    feedbackFromPoint.value = { label: 'A(4,3)', x: 4, y: 3 }
    feedbackToPoint.value   = { label: currentQ.value.reflection.label, x, y }
    saveAnswer({
      activityId: 'reflection', questionId: currentQ.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value   = false
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    feedbackMessage.value   = attempts.value >= 2
      ? `Belum tepat. Jawaban yang benar adalah (${currentQ.value.target.x},${currentQ.value.target.y}). ${currentQ.value.hint}`
      : 'Belum tepat! Perhatikan aturan refleksi dan coba lagi.'
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    showReflection.value = false
    if (currentIdx.value < totalQ.value - 1) {
      currentIdx.value++
      answerX.value     = ''
      answerY.value     = ''
      attempts.value    = 0
      usedHint.value    = false
      showHintBox.value = false
      mirrorClicked.value = false
    } else {
      progressStore.setActivityScore('reflection', activityScore.value, attempts.value)
      isFinished.value = true
    }
  }
}

function showHint() {
  usedHint.value    = true
  showHintBox.value = true
}
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Refleksi (Pencerminan)" :color="COLOR" :show-help="true" @help="showHint" />

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
          Seorang pembeli memuji hasil sulaman karawo Nita, karena terlihat "seimbang" antara sisi kiri
          dan kanan. Ia mengatakan bahwa motif tersebut tampak seperti bayangan di cermin.
          <br /><br />
          Nita mencoba memperhatikan. Ia menemukan satu motif di sisi kanan berada di titik
          <strong>(4,3)</strong>. Ia ingin membuat motif di sisi kiri agar terlihat seimbang sempurna.
        </div>
      </div>

      <!-- Instruksi sub-Q a (klik cermin sumbu Y) -->
      <div v-if="currentIdx === 0" class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Instruksi — Drag &amp; Klik</p>
        <div class="space-y-3">
          <!-- Langkah a: sudah ada motif -->
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
              <span class="text-white text-[10px] font-bold">✓</span>
            </div>
            <p class="font-body text-xs text-gray-500 leading-snug">
              Sebuah motif berada pada titik <strong>(4,3)</strong> di atas sumbu-Y
            </p>
          </div>
          <!-- Langkah b: klik cermin -->
          <div class="flex items-start gap-3">
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors"
              :class="mirrorClicked ? 'bg-green-500' : ''"
              :style="mirrorClicked ? {} : { backgroundColor: COLOR }"
            >
              <span class="text-white text-[10px] font-bold">{{ mirrorClicked ? '✓' : 'b' }}</span>
            </div>
            <div class="flex-1">
              <p class="font-body text-xs text-gray-700 mb-2 leading-snug">
                Klik garis cermin <strong>Sumbu Y</strong> — bayangan akan muncul di sisi kiri
              </p>
              <button
                v-if="!mirrorClicked"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-display font-semibold active:scale-95 transition-transform"
                :style="{ backgroundColor: COLOR }"
                @click="mirrorClicked = true"
              >
                <span class="material-symbols-outlined text-sm">flip</span>
                Ketuk Cermin Sumbu Y
              </button>
              <div v-else class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                <span class="material-symbols-outlined text-green-500 text-sm" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                <span class="font-body text-green-600 text-xs">Bayangan muncul di titik (−4, 3)!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Instruksi sub-Q b (hanya pertanyaan) -->
      <div v-else class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
               :style="{ backgroundColor: COLOR }">b</div>
          <span class="font-display font-semibold text-gray-600 text-xs">Cermin terhadap Sumbu X</span>
        </div>
        <p class="font-body text-xs text-gray-600 leading-relaxed">
          Motif karawo yang sama berada di titik <strong>A(4,3)</strong>. Kali ini cerminnya ada di <strong>Sumbu X</strong>.
        </p>
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
        <CoordinatePlane
          :start-point="ORIGIN"
          :end-point="gridEndPoint"
          :show-arrow="!!gridEndPoint"
          :mirror-axis="currentQ.axis"
          :motif-color="COLOR"
          :end-motif-color="'#A78BFA'"
          :size="270"
          :range="5"
        />
      </div>

      <!-- Aturan refleksi -->
      <div class="flex justify-center mb-3">
        <div class="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
          <span class="font-body text-gray-500 text-xs">Aturan Sumbu {{ currentQ.axis === 'y' ? 'Y' : 'X' }}:</span>
          <span class="font-display font-bold text-sm" :style="{ color: COLOR }">{{ currentQ.rule }}</span>
        </div>
      </div>

      <!-- Pertanyaan + input koordinat -->
      <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
        <p class="font-body text-gray-400 text-xs mb-3">Isi koordinat titik bayangan:</p>
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
          :disabled="currentQ.needsMirrorClick && !mirrorClicked"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div class="text-6xl animate-bounce-in">🪞</div>
      <h2 class="font-display font-bold text-2xl text-gray-700">Refleksi Selesai!</h2>
      <div class="bg-white rounded-2xl p-4 text-left w-full shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Rangkuman Refleksi</p>
        <div class="space-y-3">
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <div>
              <p class="font-display font-semibold text-xs text-gray-700">Refleksi terhadap Sumbu Y</p>
              <p class="font-body text-xs text-gray-500">(x, y) → (−x, y) &nbsp;→&nbsp; A(4,3) → A'(−4, 3)</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <div>
              <p class="font-display font-semibold text-xs text-gray-700">Refleksi terhadap Sumbu X</p>
              <p class="font-body text-xs text-gray-500">(x, y) → (x, −y) &nbsp;→&nbsp; A(4,3) → A'(4, −3)</p>
            </div>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <p class="font-body text-xs text-gray-500 leading-relaxed">
            Bentuk motif tetap sama, hanya posisinya yang berpindah — seperti bayangan di cermin.
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
