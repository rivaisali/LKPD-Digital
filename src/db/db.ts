import Dexie, { type Table } from 'dexie'
import type { ProgressRecord, AnswerRecord, StudentRecord, ReflectionRecord } from '@/domain/types'

class NitaKarawoDB extends Dexie {
  progress!: Table<ProgressRecord>
  answers!: Table<AnswerRecord>
  student!: Table<StudentRecord>
  reflections!: Table<ReflectionRecord>

  constructor() {
    super('nita-karawo-db')
    this.version(1).stores({
      progress: '++id, activityId, status',
      answers: '++id, activityId, questionId, isCorrect',
      student: '++id',
      reflections: '++id, studentId',
    })
  }
}

export const db = new NitaKarawoDB()

export async function getProgress(activityId: string) {
  return db.progress.where('activityId').equals(activityId).first()
}

export async function saveProgress(record: ProgressRecord) {
  const existing = await getProgress(record.activityId)
  if (existing?.id) {
    await db.progress.update(existing.id, record)
  } else {
    await db.progress.add(record)
  }
}

export async function getAllProgress() {
  return db.progress.toArray()
}

export async function saveAnswer(record: AnswerRecord) {
  await db.answers.add(record)
}

export async function getCorrectAnswers(activityId: string): Promise<AnswerRecord[]> {
  return db.answers
    .where('activityId').equals(activityId)
    .and((r) => r.isCorrect === true)
    .toArray()
}

export async function getStudent() {
  return db.student.toCollection().first()
}

export async function saveStudent(record: StudentRecord) {
  const existing = await getStudent()
  if (existing?.id) {
    await db.student.update(existing.id, record)
  } else {
    await db.student.add(record)
  }
}

export async function clearStudent() {
  await db.student.clear()
}

export async function deleteActivityProgress(activityId: string) {
  const existing = await getProgress(activityId)
  if (existing?.id) await db.progress.delete(existing.id)
}

export async function clearAllProgress() {
  await db.progress.clear()
}

export async function clearAnswers() {
  await db.answers.clear()
}

export async function clearActivityAnswers(activityId: string) {
  const ids = await db.answers.where('activityId').equals(activityId).primaryKeys()
  await db.answers.bulkDelete(ids)
}

export async function saveReflection(record: ReflectionRecord) {
  await db.reflections.add(record)
}
