import { ref, computed } from 'vue'
import type { Question, ActivityId } from '@/domain/types'
import { isSamePoint } from '@/domain/geometry'
import { calculateScore } from '@/domain/scoring'
import { useProgressStore } from '@/stores/useProgressStore'
import { saveAnswer } from '@/db/db'

export function useActivity(questions: Question[], activityId: ActivityId, color: string) {
  const progressStore = useProgressStore()

  const currentIndex = ref(0)
  const answerX = ref('')
  const answerY = ref('')
  const attempts = ref(0)
  const usedHint = ref(false)
  const showHint = ref(false)
  const currentHintIndex = ref(0)
  const showFeedback = ref(false)
  const feedbackCorrect = ref(false)
  const feedbackMessage = ref('')
  const isFinished = ref(false)
  const activityScore = ref(0)

  const currentQuestion = computed(() => questions[currentIndex.value])
  const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)
  const totalProgress = computed(() => questions.length)

  progressStore.setActivityInProgress(activityId)

  function checkAnswer() {
    const x = parseFloat(answerX.value)
    const y = parseFloat(answerY.value)
    if (isNaN(x) || isNaN(y)) return

    attempts.value++
    const correct = isSamePoint({ x, y }, currentQuestion.value.correctAnswer)

    if (correct) {
      const score = calculateScore(attempts.value, usedHint.value)
      activityScore.value += score
      feedbackCorrect.value = true
      feedbackMessage.value = currentQuestion.value.conceptFeedback
      saveAnswer({
        activityId,
        questionId: currentQuestion.value.id,
        answerX: x,
        answerY: y,
        isCorrect: true,
        attempts: attempts.value,
        usedHint: usedHint.value,
        createdAt: new Date().toISOString(),
      })
    } else {
      feedbackCorrect.value = false
      if (attempts.value === 1) {
        feedbackMessage.value = 'Jawaban belum tepat. Coba perhatikan lagi soalnya!'
      } else if (attempts.value === 2) {
        feedbackMessage.value = 'Hampir benar! Coba gunakan petunjuk untuk membantu.'
      } else {
        feedbackMessage.value = `Jawaban yang benar adalah (${currentQuestion.value.correctAnswer.x}, ${currentQuestion.value.correctAnswer.y}).`
        saveAnswer({
          activityId,
          questionId: currentQuestion.value.id,
          answerX: x,
          answerY: y,
          isCorrect: false,
          attempts: attempts.value,
          usedHint: usedHint.value,
          createdAt: new Date().toISOString(),
        })
      }
    }
    showFeedback.value = true
  }

  function onFeedbackNext() {
    showFeedback.value = false
    if (feedbackCorrect.value) {
      if (isLastQuestion.value) {
        progressStore.setActivityScore(activityId, activityScore.value, attempts.value)
        isFinished.value = true
      } else {
        nextQuestion()
      }
    } else if (attempts.value >= 3) {
      if (isLastQuestion.value) {
        progressStore.setActivityScore(activityId, activityScore.value, attempts.value)
        isFinished.value = true
      } else {
        nextQuestion()
      }
    }
  }

  function nextQuestion() {
    currentIndex.value++
    answerX.value = ''
    answerY.value = ''
    attempts.value = 0
    usedHint.value = false
    showHint.value = false
    currentHintIndex.value = 0
  }

  function toggleHint() {
    showHint.value = !showHint.value
    if (showHint.value) {
      usedHint.value = true
      if (currentHintIndex.value < currentQuestion.value.hints.length - 1) {
        currentHintIndex.value++
      }
    }
  }

  return {
    currentIndex,
    answerX,
    answerY,
    attempts,
    usedHint,
    showHint,
    currentHintIndex,
    showFeedback,
    feedbackCorrect,
    feedbackMessage,
    isFinished,
    activityScore,
    currentQuestion,
    isLastQuestion,
    totalProgress,
    checkAnswer,
    onFeedbackNext,
    toggleHint,
  }
}
