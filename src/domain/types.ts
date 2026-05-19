export type Point = { x: number; y: number }
export type Vector = { a: number; b: number }
export type ReflectionAxis = 'x' | 'y' | 'y=x' | 'y=-x'
export type RotationAngle = 90 | 180 | 270
export type RotationDirection = 'ccw' | 'cw'
export type ActivityId = 'translation' | 'reflection' | 'rotation' | 'dilation' | 'challenge'
export type ActivityStatus = 'not-started' | 'in-progress' | 'completed'

export interface Question {
  id: string
  activityId: ActivityId
  title: string
  instruction: string
  startPoint: Point & { label: string }
  transformation: TranslationTransform | ReflectionTransform | RotationTransform | DilationTransform | ChallengeTransform
  correctAnswer: Point
  hints: string[]
  conceptFeedback: string
}

export interface TranslationTransform {
  type: 'translation'
  vector: Vector
}

export interface ReflectionTransform {
  type: 'reflection'
  axis: ReflectionAxis
}

export interface RotationTransform {
  type: 'rotation'
  angle: RotationAngle
  direction: RotationDirection
}

export interface DilationTransform {
  type: 'dilation'
  scale: number
  center: Point
}

export interface ChallengeTransform {
  type: 'challenge'
  steps: Array<TranslationTransform | ReflectionTransform | RotationTransform>
  intermediatePoints: Point[]
}

export interface ProgressRecord {
  id?: number
  activityId: ActivityId
  status: ActivityStatus
  score: number
  attempts: number
  completedAt?: string
}

export interface AnswerRecord {
  id?: number
  activityId: ActivityId
  questionId: string
  answerX: number
  answerY: number
  isCorrect: boolean
  attempts: number
  usedHint: boolean
  createdAt: string
}

export interface StudentRecord {
  id?: number
  name: string
  className: string
  createdAt: string
}

export interface ReflectionRecord {
  id?: number
  studentId: number
  text: string
  feeling: string
  createdAt: string
}

export interface ActivityConfig {
  id: ActivityId
  label: string
  sublabel: string
  color: string
  bgColor: string
  textColor: string
  icon: string
  route: string
}
