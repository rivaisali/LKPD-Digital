export const MAX_SCORE_PER_ACTIVITY = 20
export const MAX_TOTAL_SCORE = 100

export function calculateScore(attempts: number, usedHint: boolean): number {
  if (attempts === 1 && !usedHint) return 20
  if (attempts === 1 && usedHint) return 15
  if (attempts === 2) return 15
  if (attempts === 3) return 10
  return 5
}

export function getGrade(score: number): { label: string; emoji: string; color: string } {
  if (score >= 90) return { label: 'Luar Biasa!', emoji: '🌟', color: '#F59E0B' }
  if (score >= 75) return { label: 'Hebat!', emoji: '⭐', color: '#F59E0B' }
  if (score >= 60) return { label: 'Bagus!', emoji: '👍', color: '#10B981' }
  return { label: 'Tetap Semangat!', emoji: '💪', color: '#3B82F6' }
}

export function getStarCount(score: number): number {
  if (score >= 90) return 3
  if (score >= 70) return 2
  if (score >= 50) return 1
  return 0
}
