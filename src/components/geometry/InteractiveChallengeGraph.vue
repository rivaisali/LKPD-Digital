<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Point } from '@/domain/types'

export interface ColoredMotif extends Point {
  label: string
  color: string
  faded?: boolean
}

const props = withDefaults(defineProps<{
  fixedMotifs?: ColoredMotif[]
  draggable?: (Point & { label: string }) | null
  draggableColor?: string
  disabled?: boolean
  size?: number
}>(), {
  fixedMotifs: () => [],
  draggable: null,
  draggableColor: '#6f5b9d',
  disabled: false,
  size: 270,
})

const emit = defineEmits<{ drop: [point: Point] }>()

const svgEl = ref<SVGSVGElement | null>(null)
const padding = 32
const range = 5

const cellSize = computed(() => (props.size - padding * 2) / (range * 2))
const motifSize = computed(() => Math.round(cellSize.value * 1.35))

function toSvg(p: Point) {
  return {
    cx: padding + (p.x + range) * cellSize.value,
    cy: padding + (range - p.y) * cellSize.value,
  }
}

function fromSvg(cx: number, cy: number): Point {
  return {
    x: Math.max(-range, Math.min(range, Math.round((cx - padding) / cellSize.value - range))),
    y: Math.max(-range, Math.min(range, Math.round(range - (cy - padding) / cellSize.value))),
  }
}

function getSvgCoord(e: PointerEvent) {
  const rect = svgEl.value!.getBoundingClientRect()
  return {
    cx: (e.clientX - rect.left) * (props.size / rect.width),
    cy: (e.clientY - rect.top) * (props.size / rect.height),
  }
}

const gridLines = computed(() => {
  const lines = []
  for (let i = -range; i <= range; i++) {
    lines.push({ type: 'v', pos: padding + (i + range) * cellSize.value, isAxis: i === 0 })
    lines.push({ type: 'h', pos: padding + (range - i) * cellSize.value, isAxis: i === 0 })
  }
  return lines
})

const tickLabels = computed(() => {
  const origin = toSvg({ x: 0, y: 0 })
  const labels = []
  for (let i = -range; i <= range; i++) {
    if (i === 0) continue
    labels.push({ val: i, x: padding + (i + range) * cellSize.value, y: origin.cy + 14, axis: 'x' })
    labels.push({ val: i, x: origin.cx - 14, y: padding + (range - i) * cellSize.value + 4, axis: 'y' })
  }
  return labels
})

const originSvg = computed(() => toSvg({ x: 0, y: 0 }))

// ── Drag ────────────────────────────────────────────────────────────────────
const isDragging = ref(false)
const dragSvgPos = ref<{ cx: number; cy: number } | null>(null)
const snapPoint  = ref<Point | null>(null)

function onPointerDown(e: PointerEvent) {
  if (props.disabled || !props.draggable) return
  e.preventDefault()
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  isDragging.value = true
  const c = getSvgCoord(e)
  dragSvgPos.value = c
  snapPoint.value  = fromSvg(c.cx, c.cy)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const c = getSvgCoord(e)
  dragSvgPos.value = c
  snapPoint.value  = fromSvg(c.cx, c.cy)
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  if (snapPoint.value) emit('drop', { ...snapPoint.value })
  dragSvgPos.value = null
  snapPoint.value  = null
}

const draggableSvg = computed(() => props.draggable ? toSvg(props.draggable) : null)
const snapSvg      = computed(() => snapPoint.value ? toSvg(snapPoint.value) : null)

function labelPos(cx: number) {
  const flip = cx > props.size - 55
  return { x: flip ? cx - 8 : cx + 8, anchor: flip ? 'end' : 'start' }
}
</script>

<template>
  <svg
    ref="svgEl"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="mx-auto select-none w-full"
    style="max-width: 270px; overflow: visible; touch-action: none"
  >
    <defs>
      <clipPath id="ich-clip">
        <rect :x="padding - 2" :y="padding - 2"
              :width="size - padding * 2 + 4" :height="size - padding * 2 + 4" />
      </clipPath>
      <marker id="ich-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" :fill="draggableColor" />
      </marker>
    </defs>

    <!-- Grid -->
    <g clip-path="url(#ich-clip)">
      <line
        v-for="(line, i) in gridLines" :key="i"
        :x1="line.type === 'v' ? line.pos : padding"
        :y1="line.type === 'v' ? padding : line.pos"
        :x2="line.type === 'v' ? line.pos : size - padding"
        :y2="line.type === 'v' ? size - padding : line.pos"
        :stroke="line.isAxis ? '#374151' : '#E5E7EB'"
        :stroke-width="line.isAxis ? 1.5 : 0.75"
      />
    </g>

    <!-- Tick labels -->
    <text
      v-for="(t, i) in tickLabels" :key="`t${i}`"
      :x="t.x" :y="t.y"
      text-anchor="middle"
      font-size="9" fill="#9CA3AF" font-family="Nunito,sans-serif"
    >{{ t.val }}</text>

    <!-- Axis labels & arrowheads -->
    <text :x="size - padding + 10" :y="originSvg.cy + 4"
          font-size="11" fill="#374151" font-family="Nunito" font-weight="700">X</text>
    <text :x="originSvg.cx - 4"    :y="padding - 8"
          font-size="11" fill="#374151" font-family="Nunito" font-weight="700">Y</text>
    <polygon :points="`${size-padding+6},${originSvg.cy-4} ${size-padding+14},${originSvg.cy} ${size-padding+6},${originSvg.cy+4}`" fill="#374151"/>
    <polygon :points="`${originSvg.cx-4},${padding-6} ${originSvg.cx},${padding-14} ${originSvg.cx+4},${padding-6}`" fill="#374151"/>

    <!-- Fixed motifs (each with own color) -->
    <g v-for="(fm, i) in fixedMotifs" :key="`fm${i}`" :opacity="fm.faded ? 0.38 : 1">
      <circle :cx="toSvg(fm).cx" :cy="toSvg(fm).cy"
              :r="motifSize / 2 + 4" :fill="fm.color" opacity="0.15" />
      <image
        href="/images/karawo-motif.png"
        :x="toSvg(fm).cx - motifSize / 2" :y="toSvg(fm).cy - motifSize / 2"
        :width="motifSize" :height="motifSize"
        preserveAspectRatio="xMidYMid meet"
      />
      <circle :cx="toSvg(fm).cx" :cy="toSvg(fm).cy"
              r="3.5" :fill="fm.color" stroke="white" stroke-width="1.5" />
      <!-- Label pill -->
      <rect
        :x="labelPos(toSvg(fm).cx).anchor === 'end'
          ? toSvg(fm).cx - 8 - (fm.label.length * 5 + 24)
          : toSvg(fm).cx + 8"
        :y="toSvg(fm).cy - 22"
        :width="fm.label.length * 5 + 24" height="13"
        rx="4" :fill="fm.color" opacity="0.9"
      />
      <text
        :x="labelPos(toSvg(fm).cx).x"
        :y="toSvg(fm).cy - 12"
        :text-anchor="labelPos(toSvg(fm).cx).anchor"
        font-size="8.5" fill="white" font-family="Nunito" font-weight="800"
      >{{ fm.label }}({{ fm.x }},{{ fm.y }})</text>
    </g>

    <!-- Snap preview saat drag -->
    <g v-if="isDragging && snapSvg && snapPoint">
      <circle :cx="snapSvg.cx" :cy="snapSvg.cy"
              :r="motifSize / 2 + 4"
              fill="none" :stroke="draggableColor" stroke-width="2"
              stroke-dasharray="5,3" opacity="0.65" />
      <circle :cx="snapSvg.cx" :cy="snapSvg.cy"
              r="3.5" :fill="draggableColor" opacity="0.7" />
      <rect
        :x="labelPos(snapSvg.cx).anchor === 'end' ? snapSvg.cx - 8 - 46 : snapSvg.cx + 6"
        :y="snapSvg.cy - 20"
        width="46" height="13"
        rx="4" :fill="draggableColor" opacity="0.8"
      />
      <text
        :x="labelPos(snapSvg.cx).anchor === 'end' ? snapSvg.cx - 31 : snapSvg.cx + 29"
        :y="snapSvg.cy - 10"
        text-anchor="middle"
        font-size="8.5" fill="white" font-family="Nunito" font-weight="800"
      >({{ snapPoint.x }},{{ snapPoint.y }})</text>
    </g>

    <!-- Draggable motif -->
    <g
      v-if="draggable && draggableSvg"
      :transform="isDragging && dragSvgPos
        ? `translate(${dragSvgPos.cx}, ${dragSvgPos.cy})`
        : `translate(${draggableSvg.cx}, ${draggableSvg.cy})`"
      :style="disabled ? 'cursor: default' : 'cursor: grab; touch-action: none'"
      @pointerdown.prevent="onPointerDown"
      @pointermove.prevent="onPointerMove"
      @pointerup.prevent="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- Glow ring -->
      <circle
        :r="motifSize / 2 + 6"
        :fill="draggableColor"
        :opacity="isDragging ? 0.25 : 0.15"
        :style="!disabled && !isDragging
          ? 'animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite'
          : ''"
      />
      <circle :r="motifSize / 2 + 6" fill="none"
              :stroke="draggableColor" stroke-width="1.5" opacity="0.5" />
      <image
        href="/images/karawo-motif.png"
        :x="-motifSize / 2" :y="-motifSize / 2"
        :width="motifSize" :height="motifSize"
        preserveAspectRatio="xMidYMid meet"
        :style="isDragging ? 'filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25))' : ''"
      />
      <circle r="3.5" :fill="draggableColor" stroke="white" stroke-width="1.5" />
      <text
        x="0" :y="-motifSize / 2 - 6"
        text-anchor="middle"
        font-size="9" font-family="Nunito" font-weight="800" :fill="draggableColor"
      >{{ draggable.label }}</text>
    </g>
  </svg>
</template>
