import type { Point, Vector, ReflectionAxis, RotationAngle, RotationDirection } from './types'

export function translatePoint(point: Point, vector: Vector): Point {
  return { x: point.x + vector.a, y: point.y + vector.b }
}

export function reflectPoint(point: Point, axis: ReflectionAxis): Point {
  if (axis === 'x') return { x: point.x, y: -point.y }
  if (axis === 'y') return { x: -point.x, y: point.y }
  if (axis === 'y=x') return { x: point.y, y: point.x }
  return { x: -point.y, y: -point.x }
}

export function rotatePoint(point: Point, angle: RotationAngle, direction: RotationDirection = 'ccw'): Point {
  const effectiveAngle = direction === 'cw' ? ((360 - angle) as RotationAngle) : angle
  if (effectiveAngle === 90) return { x: -point.y, y: point.x }
  if (effectiveAngle === 180) return { x: -point.x, y: -point.y }
  return { x: point.y, y: -point.x }
}

export function dilatePoint(point: Point, scale: number, center: Point = { x: 0, y: 0 }): Point {
  return {
    x: center.x + scale * (point.x - center.x),
    y: center.y + scale * (point.y - center.y),
  }
}

export function isSamePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y
}

export function pointLabel(p: Point): string {
  return `(${p.x}, ${p.y})`
}

export function reflectionAxisLabel(axis: ReflectionAxis): string {
  if (axis === 'x') return 'Sumbu X'
  if (axis === 'y') return 'Sumbu Y'
  if (axis === 'y=x') return 'y = x'
  return 'y = -x'
}
