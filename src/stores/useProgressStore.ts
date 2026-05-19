import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActivityId, ActivityStatus } from '@/domain/types'
import { saveProgress, getAllProgress, deleteActivityProgress, clearAllProgress } from '@/db/db'

interface ActivityProgress {
  activityId: ActivityId
  status: ActivityStatus
  score: number
  attempts: number
  completedAt?: string
}

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<Record<ActivityId, ActivityProgress>>({
    translation: { activityId: 'translation', status: 'not-started', score: 0, attempts: 0 },
    reflection: { activityId: 'reflection', status: 'not-started', score: 0, attempts: 0 },
    rotation: { activityId: 'rotation', status: 'not-started', score: 0, attempts: 0 },
    dilation: { activityId: 'dilation', status: 'not-started', score: 0, attempts: 0 },
    challenge: { activityId: 'challenge', status: 'not-started', score: 0, attempts: 0 },
  })

  const totalScore = computed(() =>
    Object.values(progress.value).reduce((sum, p) => sum + p.score, 0),
  )

  const completedCount = computed(() =>
    Object.values(progress.value).filter((p) => p.status === 'completed').length,
  )

  const allActivitiesCompleted = computed(() =>
    ['translation', 'reflection', 'rotation', 'dilation'].every(
      (id) => progress.value[id as ActivityId].status === 'completed',
    ),
  )

  function getActivityProgress(activityId: ActivityId) {
    return progress.value[activityId]
  }

  async function setActivityScore(activityId: ActivityId, score: number, attempts: number) {
    const record: ActivityProgress = {
      activityId,
      status: 'completed',
      score,
      attempts,
      completedAt: new Date().toISOString(),
    }
    progress.value[activityId] = record
    await saveProgress(record)
  }

  async function setActivityInProgress(activityId: ActivityId) {
    if (progress.value[activityId].status === 'not-started') {
      progress.value[activityId].status = 'in-progress'
    }
  }

  async function loadFromDB() {
    const records = await getAllProgress()
    for (const r of records) {
      progress.value[r.activityId] = {
        activityId: r.activityId,
        status: r.status,
        score: r.score,
        attempts: r.attempts,
        completedAt: r.completedAt,
      }
    }
  }

  function reset() {
    const ids: ActivityId[] = ['translation', 'reflection', 'rotation', 'dilation', 'challenge']
    for (const id of ids) {
      progress.value[id] = { activityId: id, status: 'not-started', score: 0, attempts: 0 }
    }
  }

  async function resetAll() {
    reset()
    await clearAllProgress()
  }

  async function resetActivity(activityId: ActivityId) {
    progress.value[activityId] = { activityId, status: 'not-started', score: 0, attempts: 0 }
    await deleteActivityProgress(activityId)
  }

  return {
    progress,
    totalScore,
    completedCount,
    allActivitiesCompleted,
    getActivityProgress,
    setActivityScore,
    setActivityInProgress,
    loadFromDB,
    reset,
    resetAll,
    resetActivity,
  }
})
