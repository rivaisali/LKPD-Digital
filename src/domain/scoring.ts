export const MAX_SCORE_PER_ACTIVITY = 20
export const MAX_TOTAL_SCORE = 100

/**
 * Hitung skor satu sub-soal.
 * maxPoints = nilai penuh sub-soal ini (default 20 untuk aktivitas 1 soal).
 * Tiap aktivitas membagi MAX_SCORE_PER_ACTIVITY dengan jumlah sub-soalnya.
 */
export function calculateScore(attempts: number, usedHint: boolean, maxPoints = 20): number {
  if (attempts === 1 && !usedHint) return maxPoints
  if (attempts === 1 && usedHint)  return Math.round(maxPoints * 0.75)
  if (attempts === 2)               return Math.round(maxPoints * 0.75)
  if (attempts === 3)               return Math.round(maxPoints * 0.50)
  return                            Math.round(maxPoints * 0.25)
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
