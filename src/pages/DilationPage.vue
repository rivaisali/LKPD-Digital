<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinatePlane from '@/components/geometry/CoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { dilatePoint, isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer, getCorrectAnswers } from '@/db/db'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#43a669'

const ORIGIN = { label: 'A(2,2)', x: 2, y: 2 }

// Sub-Q 0 → koordinat (4,4) | Sub-Q 1 → teks
const subQuestions = [
  {
    id: 'dil-a',
    isText: false,
    question: 'a. Tentukan posisi titik motif setelah diperbesar!',
    target: { x: 4, y: 4 },
    hint: 'Dilatasi: kalikan setiap koordinat dengan k. Rumus: (kx, ky) = (2×2, 2×2) = (4, 4).',
    voiceover: 'Geser slider ke k=2, lalu amati di mana motif berpindah!',
  },
  {
    id: 'dil-b',
    isText: true,
    question: 'b. Perubahan apakah yang terjadi pada motif setelah dilatasi dengan k=2?',
    target: { x: 0, y: 0 },
    hint: 'Perhatikan ukuran motif sebelum dan sesudah dilatasi.',
    voiceover: 'Apa yang kamu amati? Coba tuliskan perubahannya!',
  },
]

const currentIdx    = ref(0)
const answerX       = ref('')
const answerY       = ref('')
const textAnswer    = ref('')
const attempts      = ref(0)
const usedHint      = ref(false)
const showHintBox   = ref(false)
const showFeedback  = ref(false)
const feedbackCorrect  = ref(false)
const feedbackMessage  = ref('')
const feedbackFromPoint = ref<{ label: string; x: number; y: number } | undefined>()
const feedbackToPoint   = ref<{ label: string; x: number; y: number } | undefined>()
const activityScore = ref(0)
const isFinished    = ref(false)

// Slider state
const sliderValue   = ref(1)
const sliderMoved   = ref(false)

const currentQ = computed(() => subQuestions[currentIdx.value])
const totalQ   = computed(() => subQuestions.length)

// Preview titik dilatasi sesuai slider
const previewPoint = computed(() => {
  if (!sliderMoved.value) return undefined
  const p = dilatePoint(ORIGIN, sliderValue.value)
  return { x: p.x, y: p.y, label: `A'(${p.x},${p.y})` }
})

const canCheck = computed(() => {
  if (currentQ.value.isText) return textAnswer.value.trim().length >= 5
  return sliderMoved.value && answerX.value !== '' && answerY.value !== ''
})

progressStore.setActivityInProgress('dilation')

onMounted(async () => {
  const correct = await getCorrectAnswers('dilation')
  if (correct.length === 0) return
  const correctIds = new Set(correct.map((a) => a.questionId))
  for (const a of correct) activityScore.value += calculateScore(a.attempts, a.usedHint)
  const first = subQuestions.findIndex((q) => !correctIds.has(q.id))
  currentIdx.value = first === -1 ? subQuestions.length - 1 : first
})

function onSliderInput() {
  sliderMoved.value = true
}

function checkAnswer() {
  if (!canCheck.value) return
  attempts.value++

  if (currentQ.value.isText) {
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value   = true
    feedbackMessage.value   = 'Jawabanmu benar! Motif menjadi 2× lebih besar, tetapi bentuknya tetap sama.'
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    saveAnswer({
      activityId: 'dilation', questionId: currentQ.value.id,
      answerX: 0, answerY: 0,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
    showFeedback.value = true
    return
  }

  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  const correct = isSamePoint({ x, y }, currentQ.value.target)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value   = true
    feedbackMessage.value   = `Jawabanmu benar! Dengan k=2, motif A(2,2) membesar menjadi A'(${x},${y}).`
    feedbackFromPoint.value = { label: 'A(2,2)', x: 2, y: 2 }
    feedbackToPoint.value   = { label: `A'(${x},${y})`, x, y }
    saveAnswer({
      activityId: 'dilation', questionId: currentQ.value.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value   = false
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    feedbackMessage.value   = attempts.value >= 2
      ? `Belum tepat. Jawaban yang benar adalah (${currentQ.value.target.x}, ${currentQ.value.target.y}). ${currentQ.value.hint}`
      : 'Belum tepat! Kalikan koordinat (2,2) dengan k=2.'
  }
  showFeedback.value = true
}

function onFeedbackNext() {
  showFeedback.value = false
  if (feedbackCorrect.value || attempts.value >= 2) {
    feedbackFromPoint.value = undefined
    feedbackToPoint.value   = undefined
    if (currentIdx.value < totalQ.value - 1) {
      currentIdx.value++
      answerX.value     = ''
      answerY.value     = ''
      textAnswer.value  = ''
      attempts.value    = 0
      usedHint.value    = false
      showHintBox.value = false
      sliderValue.value = 1
      sliderMoved.value = false
    } else {
      progressStore.setActivityScore('dilation', activityScore.value, attempts.value)
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
    <TopBar title="Dilatasi (Perbesaran)" :color="COLOR" :show-help="true" @help="showHint" />

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
          Untuk memenuhi pesanan khusus, ibu Nita diminta membuat motif yang sama tetapi dengan ukuran
          lebih besar. Ia tidak menggambar ulang, tetapi memperbesar pola yang sudah ada.
          <br /><br />
          Motif awal berada di titik <strong>(2,2)</strong>. Setelah diperbesar, motif tersebut tampak
          <strong>dua kali lebih besar</strong> dan lebih menonjol.
        </div>
      </div>

      <!-- ── SUB-Q a: Instruksi Slider ── -->
      <template v-if="!currentQ.isText">
        <!-- Checklist instruksi -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Instruksi</p>
          <div class="space-y-4">

            <!-- Langkah a: info posisi awal -->
            <div class="flex items-start gap-3">
              <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                <span class="text-white text-[10px] font-bold">✓</span>
              </div>
              <p class="font-body text-xs text-gray-500 leading-snug">
                Posisi awal motif berada pada titik <strong>(2,2)</strong> — 2 satuan ke kanan dan 2 satuan ke atas dari pusat (0,0)
              </p>
            </div>

            <!-- Langkah b: slider -->
            <div class="flex items-start gap-3">
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="sliderValue === 2 ? 'bg-green-500' : ''"
                :style="sliderValue !== 2 ? { backgroundColor: COLOR } : {}"
              >
                <span class="text-white text-[10px] font-bold">{{ sliderValue === 2 ? '✓' : 'b' }}</span>
              </div>
              <div class="flex-1">
                <p class="font-body text-xs text-gray-700 mb-3 leading-snug">
                  Geser slider skala ke <strong>k = 2</strong>
                </p>
                <!-- Slider -->
                <div class="bg-gray-50 rounded-xl p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-body text-gray-500 text-xs">Faktor Skala</span>
                    <span class="font-display font-bold text-base" :style="{ color: COLOR }">k = {{ sliderValue }}</span>
                  </div>
                  <input
                    v-model.number="sliderValue"
                    type="range" min="1" max="3" step="0.5"
                    class="w-full"
                    :style="{ accentColor: COLOR }"
                    @input="onSliderInput"
                  />
                  <div class="flex justify-between mt-1 text-[10px] text-gray-400 font-body">
                    <span>1</span><span>1.5</span><span>2</span><span>2.5</span><span>3</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Langkah c: amati perubahan -->
            <div
              class="flex items-start gap-3 transition-opacity"
              :class="sliderMoved ? 'opacity-100' : 'opacity-35'"
            >
              <div
                class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                :class="sliderMoved ? 'text-white' : 'bg-gray-200 text-gray-400'"
                :style="sliderMoved ? { backgroundColor: COLOR } : {}"
              >
                <span class="text-[10px] font-bold">c</span>
              </div>
              <p class="font-body text-xs leading-snug"
                 :class="sliderMoved ? 'text-gray-800 font-semibold' : 'text-gray-400'">
                Amati perubahan ukuran motif pada bidang kartesius di bawah
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
          <CoordinatePlane
            :start-point="ORIGIN"
            :end-point="previewPoint"
            :show-arrow="!!previewPoint"
            :motif-color="COLOR"
            :end-motif-color="'#A78BFA'"
            :size="270"
            :range="5"
          />
        </div>

        <!-- Info rumus -->
        <div class="flex justify-center mb-3">
          <div class="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
            <span class="font-body text-gray-500 text-xs">Rumus dilatasi:</span>
            <span class="font-display font-bold text-sm" :style="{ color: COLOR }">(x, y) → (kx, ky)</span>
          </div>
        </div>

        <!-- Pertanyaan + input -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
          <p class="font-body text-gray-400 text-xs mb-3">Isi koordinat titik motif setelah diperbesar:</p>
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
            :disabled="!canCheck"
            @click="checkAnswer"
          >Cek Jawaban</button>
        </div>
      </template>

      <!-- ── SUB-Q b: Pertanyaan Teks ── -->
      <template v-else>
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

        <!-- Rangkuman visual dari sub-Q a -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Hasil Dilatasi yang kamu temukan:</p>
          <div class="flex items-center gap-3">
            <div class="flex-1 rounded-xl p-3 text-center border border-gray-100 bg-gray-50">
              <p class="font-body text-xs text-gray-500 mb-1">Sebelum</p>
              <p class="font-display font-bold text-sm text-gray-700">A(2, 2)</p>
              <p class="font-body text-xs text-gray-400">k = 1</p>
            </div>
            <div class="shrink-0">
              <span class="material-symbols-outlined text-gray-400" style="font-variation-settings: 'FILL' 0;">arrow_forward</span>
            </div>
            <div class="flex-1 rounded-xl p-3 text-center border" :style="{ borderColor: COLOR + '50', backgroundColor: COLOR + '08' }">
              <p class="font-body text-xs mb-1" :style="{ color: COLOR }">Sesudah</p>
              <p class="font-display font-bold text-sm text-gray-700">A'(4, 4)</p>
              <p class="font-body text-xs" :style="{ color: COLOR }">k = 2</p>
            </div>
          </div>
        </div>

        <!-- Pertanyaan teks -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
          <p class="font-display font-semibold text-gray-700 text-sm mb-3 leading-snug">{{ currentQ.question }}</p>
          <div class="rounded-xl p-3 mb-3" :style="{ backgroundColor: COLOR + '08', borderLeft: `3px solid ${COLOR}` }">
            <p class="font-body text-xs text-gray-500 mb-1">Contoh jawaban:</p>
            <p class="font-body text-xs text-gray-600 italic">"Terjadi perubahan ukuran motif. Motif menjadi 2 kali lebih besar."</p>
          </div>
          <textarea
            v-model="textAnswer"
            rows="3"
            class="w-full bg-gray-50 rounded-xl p-3 font-body text-gray-700 text-sm resize-none outline-none border-2 transition-colors"
            :style="{ borderColor: textAnswer.trim().length >= 5 ? COLOR : '#E5E7EB' }"
            placeholder="Tuliskan jawabanmu di sini..."
          />
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
            :disabled="!canCheck"
            @click="checkAnswer"
          >Cek Jawaban</button>
        </div>
      </template>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
      <div class="text-6xl animate-bounce-in">🔍</div>
      <h2 class="font-display font-bold text-2xl text-gray-700">Dilatasi Selesai!</h2>
      <div class="bg-white rounded-2xl p-4 text-left w-full shadow-sm border border-gray-100">
        <p class="font-display font-semibold text-gray-500 text-xs mb-3 uppercase tracking-wide">Konsep Dilatasi</p>
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <p class="font-body text-xs text-gray-600">Bentuk motif <strong>tetap sama</strong></p>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <p class="font-body text-xs text-gray-600">Ukuran <strong>berubah</strong> sesuai faktor skala k</p>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full mt-1.5 shrink-0" :style="{ backgroundColor: COLOR }" />
            <p class="font-body text-xs text-gray-600">Jarak terhadap pusat berubah sesuai k</p>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 rounded-xl" :style="{ backgroundColor: COLOR + '08' }">
          <p class="font-display font-semibold text-xs text-center mt-2" :style="{ color: COLOR }">
            Rumus: (x, y) → (kx, ky)
          </p>
          <p class="font-body text-xs text-center text-gray-500 pb-2">A(2,2) → A'(4,4) dengan k=2</p>
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
