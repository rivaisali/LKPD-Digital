<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import ProgressDots from '@/components/ui/ProgressDots.vue'
import FeedbackModal from '@/components/ui/FeedbackModal.vue'
import CoordinatePlane from '@/components/geometry/CoordinatePlane.vue'
import CoordinateInput from '@/components/ui/CoordinateInput.vue'
import { dilationActivity } from '@/data/lkpd-activities'
import { dilatePoint, isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'

const router = useRouter()
const progressStore = useProgressStore()
const COLOR = '#10B981'

// Titik asal dari LKPD: (2,2), k=2 → (4,4)
const ORIGIN = { label: 'D', x: 2, y: 2 }

const currentIdx = ref(0)
const answerX = ref('')
const answerY = ref('')
const textAnswer = ref('')
const attempts = ref(0)
const usedHint = ref(false)
const hintIndex = ref(-1)
const showFeedback = ref(false)
const feedbackCorrect = ref(false)
const feedbackMessage = ref('')
const activityScore = ref(0)
const isFinished = ref(false)
const sliderValue = ref(2)
const showPreview = ref(false)

const currentQ = computed(() => dilationActivity.subQuestions[currentIdx.value])
const totalQ = computed(() => dilationActivity.subQuestions.length)

const previewEndPoint = computed(() => {
  if (!showPreview.value) return undefined
  const result = dilatePoint(ORIGIN, sliderValue.value)
  return { ...result, label: "D'" }
})

const endPoint = computed(() => {
  if (!feedbackCorrect.value || !showFeedback.value) return undefined
  return { x: 4, y: 4, label: "D'" }
})

watch(currentIdx, () => {
  sliderValue.value = 2
  showPreview.value = false
})

progressStore.setActivityInProgress('dilation')

function onSliderInput() {
  showPreview.value = true
}

function checkAnswer() {
  const q = currentQ.value
  attempts.value++

  // Sub-pertanyaan b adalah jawaban teks
  if (q.isText) {
    const isCorrect = textAnswer.value.trim().length > 10
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value = true
    feedbackMessage.value = dilationActivity.conceptFeedback + '\n\n' + dilationActivity.conceptRule
    showFeedback.value = true
    return
  }

  const x = parseFloat(answerX.value)
  const y = parseFloat(answerY.value)
  if (isNaN(x) || isNaN(y)) return

  const correct = isSamePoint({ x, y }, q.correctAnswer)

  if (correct) {
    const score = calculateScore(attempts.value, usedHint.value)
    activityScore.value += score
    feedbackCorrect.value = true
    feedbackMessage.value = `Benar! Dengan k = 2, titik D(2,2) membesar menjadi D'(4,4).`
    saveAnswer({
      activityId: 'dilation',
      questionId: q.id,
      answerX: x, answerY: y,
      isCorrect: true, attempts: attempts.value, usedHint: usedHint.value,
      createdAt: new Date().toISOString(),
    })
  } else {
    feedbackCorrect.value = false
    feedbackMessage.value = attempts.value >= 2
      ? `Jawaban yang benar adalah (${q.correctAnswer.x}, ${q.correctAnswer.y}).`
      : 'Kalikan setiap koordinat dengan faktor skala k = 2.'
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
      textAnswer.value = ''
      attempts.value = 0
      usedHint.value = false
      hintIndex.value = -1
    } else {
      progressStore.setActivityScore('dilation', activityScore.value, attempts.value)
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
  const hints = [
    'Dilatasi: kalikan setiap koordinat dengan faktor skala k.',
    "Gunakan rumus (kx, ky) = (2×2, 2×2) = (4, 4).",
  ]
  return hints[hintIndex.value] ?? ''
})
</script>

<template>
  <div class="h-full flex flex-col relative bg-bg">
    <TopBar title="Dilatasi (Perbesaran)" :color="COLOR" :show-help="true" @help="showHint" />

    <div class="px-4 pt-3 pb-2 shrink-0 flex justify-center">
      <ProgressDots :total="totalQ" :current="currentIdx" :color="COLOR" />
    </div>

    <div v-if="!isFinished" class="flex-1 page-scroll hide-scrollbar px-4">

      <!-- Stimulus hanya soal pertama -->
      <div v-if="currentIdx === 0" class="mb-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-1.5 h-6 rounded-full" :style="{ backgroundColor: COLOR }" />
          <h2 class="font-display font-bold text-gray-700 text-base">{{ dilationActivity.stimulusTitle }}</h2>
        </div>
        <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p
            v-for="(para, i) in dilationActivity.stimulusText.split('\n\n')"
            :key="i"
            class="font-body text-gray-700 text-sm leading-relaxed"
            :class="{ 'mt-2': i > 0 }"
          >{{ para }}</p>
        </div>
      </div>

      <!-- Voice over Nita -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-lg">👧</div>
        <div class="bg-emerald-50 rounded-2xl rounded-tl-none p-3 flex-1">
          <p class="font-body text-emerald-700 text-xs leading-snug italic">
            "{{ currentIdx === 0 ? dilationActivity.voiceoverIntro : 'Sekarang, coba jelaskan apa yang terjadi pada motif!' }}"
          </p>
        </div>
      </div>

      <!-- Sub-question -->
      <div class="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-emerald-50">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" :style="{ backgroundColor: COLOR }">
            {{ String.fromCharCode(97 + currentIdx) }}
          </div>
          <span class="font-display font-semibold text-gray-600 text-xs uppercase tracking-wide">Pertanyaan {{ currentIdx + 1 }}</span>
        </div>
        <p class="font-body text-gray-700 text-sm leading-relaxed">{{ currentQ.instruction }}</p>
      </div>

      <!-- Hint -->
      <Transition name="slide-fade">
        <div v-if="hintIndex >= 0 && hintText && !currentQ.isText" class="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-3 flex gap-2">
          <span class="shrink-0">💡</span>
          <p class="font-body text-yellow-800 text-xs leading-snug">{{ hintText }}</p>
        </div>
      </Transition>

      <!-- Bidang Kartesius + slider (hanya soal a) -->
      <template v-if="!currentQ.isText">
        <div class="flex justify-center mb-3">
          <CoordinatePlane
            :start-point="ORIGIN"
            :end-point="endPoint ?? previewEndPoint"
            :show-arrow="!!(endPoint ?? previewEndPoint)"
            :motif-color="COLOR"
            :end-motif-color="'#A78BFA'"
            motif-image-src="/images/karawo-motif-purple.png"
            end-motif-image-src="/images/karawo-motif-purple.png"
            :size="275"
          />
        </div>

        <!-- Slider -->
        <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="font-body text-gray-600 text-sm">Geser slider untuk mengubah skala!</span>
            <span class="font-display font-bold text-lg" :style="{ color: COLOR }">k = {{ sliderValue }}</span>
          </div>
          <input
            v-model.number="sliderValue"
            type="range" min="1" max="3" step="0.5"
            class="w-full"
            :style="{ accentColor: COLOR }"
            @input="onSliderInput"
          />
          <div class="flex justify-between mt-1 text-xs text-gray-400 font-body">
            <span>1</span><span>1.5</span><span>2</span><span>2.5</span><span>3</span>
          </div>
        </div>

        <!-- Input koordinat -->
        <div class="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <CoordinateInput v-model:x="answerX" v-model:y="answerY" :color="COLOR" />
        </div>
      </template>

      <!-- Input teks (soal b) -->
      <template v-else>
        <div class="bg-emerald-50 rounded-2xl p-4 mb-3 border border-emerald-100">
          <p class="font-body text-emerald-700 text-xs mb-1 font-semibold">Jawaban contoh:</p>
          <p class="font-body text-emerald-600 text-xs">"Terjadi perubahan ukuran motif. Motif menjadi 2 kali lebih besar."</p>
        </div>
        <div class="mb-4">
          <textarea
            v-model="textAnswer"
            rows="3"
            class="w-full bg-white rounded-2xl p-4 font-body text-gray-700 text-sm resize-none outline-none border-2 border-transparent transition-colors shadow-sm"
            :style="{ borderColor: textAnswer.length > 5 ? COLOR : '#E5E7EB' }"
            placeholder="Tuliskan jawabanmu di sini..."
          />
        </div>
      </template>

      <div class="flex gap-3 pb-6">
        <button
          v-if="!currentQ.isText"
          class="flex-1 py-3.5 rounded-2xl border-2 font-display font-semibold text-sm active:scale-95 transition-transform"
          :style="{ borderColor: COLOR, color: COLOR }"
          @click="showHint"
        >💡 Petunjuk</button>
        <button
          class="flex-1 py-3.5 rounded-2xl font-display font-semibold text-sm text-white active:scale-95 transition-transform shadow-md"
          :style="{ backgroundColor: COLOR }"
          :class="{ 'opacity-50': currentQ.isText && textAnswer.trim().length < 5 }"
          :disabled="currentQ.isText && textAnswer.trim().length < 5"
          @click="checkAnswer"
        >Cek Jawaban</button>
      </div>
    </div>

    <!-- Selesai -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="text-6xl mb-4 animate-bounce-in">🔍</div>
      <h2 class="font-display font-bold text-2xl text-gray-700 mb-2">Dilatasi Selesai!</h2>
      <div class="bg-emerald-50 rounded-2xl p-4 mb-5 text-left">
        <p class="font-body text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ dilationActivity.conceptRule }}</p>
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
