<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Point } from '@/domain/types'

const props = withDefaults(defineProps<{
  fixedMotifs?: Array<Point & { label: string; faded?: boolean }>
  draggable?: (Point & { label: string }) | null
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  size?: number
  motifColor?: string
  motifImageSrc?: string
  disabled?: boolean
  // Arc guide: draws a curved arrow from `from` sweeping `angleDeg` degrees (positive = CCW)
  arcGuide?: { from: Point; angleDeg: number; color?: string }
}>(), {
  xMin: 0, xMax: 8,
  yMin: 0, yMax: 7,
  size: 270,
  motifColor: '#EF4444',
  motifImageSrc: '/images/karawo-motif.png',
  fixedMotifs: () => [],
  disabled: false,
})

const emit = defineEmits<{ drop: [point: Point] }>()

const svgEl = ref<SVGSVGElement | null>(null)
const padding = 32

const xCells = computed(() => props.xMax - props.xMin)
const yCells = computed(() => props.yMax - props.yMin)
const cellSize = computed(() => (props.size - padding * 2) / Math.max(xCells.value, yCells.value))
const motifSize = computed(() => Math.round(cellSize.value * 1.35))
const svgH = computed(() => Math.round(padding * 2 + yCells.value * cellSize.value))

function toSvg(p: Point) {
  return {
    cx: padding + (p.x - props.xMin) * cellSize.value,
    cy: svgH.value - padding - (p.y - props.yMin) * cellSize.value,
  }
}

function fromSvg(cx: number, cy: number): Point {
  return {
    x: Math.max(props.xMin, Math.min(props.xMax,
      Math.round((cx - padding) / cellSize.value + props.xMin))),
    y: Math.max(props.yMin, Math.min(props.yMax,
      Math.round((svgH.value - padding - cy) / cellSize.value + props.yMin))),
  }
}

function getSvgCoord(e: PointerEvent) {
  const rect = svgEl.value!.getBoundingClientRect()
  return {
    cx: (e.clientX - rect.left) * (props.size / rect.width),
    cy: (e.clientY - rect.top) * (svgH.value / rect.height),
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
const vLines = computed(() => {
  const r = []
  for (let x = props.xMin; x <= props.xMax; x++)
    r.push({ x, svgX: padding + (x - props.xMin) * cellSize.value, isAxis: x === 0 })
  return r
})

const hLines = computed(() => {
  const r = []
  for (let y = props.yMin; y <= props.yMax; y++)
    r.push({ y, svgY: svgH.value - padding - (y - props.yMin) * cellSize.value, isAxis: y === 0 })
  return r
})

const xAxisVisible = computed(() => props.yMin <= 0 && 0 <= props.yMax)
const yAxisVisible = computed(() => props.xMin <= 0 && 0 <= props.xMax)
const originSvg    = computed(() => toSvg({ x: 0, y: 0 }))

// ── Drag state ────────────────────────────────────────────────────────────────
const isDragging  = ref(false)
const dragSvgPos  = ref<{ cx: number; cy: number } | null>(null)
const snapPoint   = ref<Point | null>(null)

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

// ── Rotation arc guide ────────────────────────────────────────────────────────
const arcGuidePath = computed(() => {
  if (!props.arcGuide) return null
  const { from, angleDeg, color = '#888' } = props.arcGuide
  const r = Math.sqrt(from.x ** 2 + from.y ** 2)
  if (r === 0) return null
  const startAngle = Math.atan2(from.y, from.x)
  const sweepRad = (angleDeg * Math.PI) / 180
  const n = 16
  const pts: { cx: number; cy: number }[] = []
  for (let i = 0; i <= n; i++) {
    const a = startAngle + (i / n) * sweepRad
    pts.push(toSvg({ x: r * Math.cos(a), y: r * Math.sin(a) }))
  }
  // Build arrowhead at the end point pointing along the arc tangent
  const last = pts[pts.length - 1]
  const prev = pts[pts.length - 2]
  const dx = last.cx - prev.cx
  const dy = last.cy - prev.cy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = dx / len; const ny = dy / len
  const pw = 5; const pl = 9
  const arrow = [
    { cx: last.cx + pl * nx + pw * (-ny), cy: last.cy + pl * ny + pw * nx },
    { cx: last.cx, cy: last.cy },
    { cx: last.cx + pl * nx - pw * (-ny), cy: last.cy + pl * ny - pw * nx },
  ]
  const polyline = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')
  const arrowStr = arrow.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ')
  return { polyline, arrowStr, color }
})

// Label position: flip anchor if motif is close to right edge
function labelPos(cx: number) {
  const flip = cx > props.size - 60
  return { x: flip ? cx - 8 : cx + 8, anchor: flip ? 'end' : 'start' }
}
</script>

<template>
  <svg
    ref="svgEl"
    :width="size"
    :height="svgH"
    :viewBox="`0 0 ${size} ${svgH}`"
    class="mx-auto select-none"
    style="overflow: visible; touch-action: none"
  >
    <!-- ── Grid vertical lines ── -->
    <line
      v-for="vl in vLines" :key="`v${vl.x}`"
      :x1="vl.svgX" :y1="padding"
      :x2="vl.svgX" :y2="svgH - padding"
      :stroke="vl.isAxis ? '#374151' : '#E5E7EB'"
      :stroke-width="vl.isAxis ? 1.5 : 0.75"
    />
    <!-- ── Grid horizontal lines ── -->
    <line
      v-for="hl in hLines" :key="`h${hl.y}`"
      :x1="padding" :y1="hl.svgY"
      :x2="size - padding" :y2="hl.svgY"
      :stroke="hl.isAxis ? '#374151' : '#E5E7EB'"
      :stroke-width="hl.isAxis ? 1.5 : 0.75"
    />

    <!-- ── X tick labels ── -->
    <text
      v-for="vl in vLines" :key="`lx${vl.x}`"
      :x="vl.svgX"
      :y="xAxisVisible ? originSvg.cy + 14 : svgH - padding + 14"
      text-anchor="middle"
      font-size="9" fill="#9CA3AF" font-family="Nunito,sans-serif"
    >{{ vl.x }}</text>

    <!-- ── Y tick labels ── -->
    <text
      v-for="hl in hLines.filter(h => !(h.y === 0 && xAxisVisible))" :key="`ly${hl.y}`"
      :x="yAxisVisible ? originSvg.cx - 10 : padding - 10"
      :y="hl.svgY + 4"
      text-anchor="end"
      font-size="9" fill="#9CA3AF" font-family="Nunito,sans-serif"
    >{{ hl.y }}</text>

    <!-- ── Axis arrows & labels ── -->
    <template v-if="xAxisVisible">
      <polygon :points="`${size-padding+4},${originSvg.cy-3} ${size-padding+12},${originSvg.cy} ${size-padding+4},${originSvg.cy+3}`" fill="#374151"/>
      <text :x="size-padding+15" :y="originSvg.cy+4" font-size="11" fill="#374151" font-family="Nunito" font-weight="700">X</text>
    </template>
    <template v-if="yAxisVisible">
      <polygon :points="`${originSvg.cx-3},${padding-4} ${originSvg.cx},${padding-12} ${originSvg.cx+3},${padding-4}`" fill="#374151"/>
      <text :x="originSvg.cx-4" :y="padding-15" font-size="11" fill="#374151" font-family="Nunito" font-weight="700">Y</text>
    </template>

    <!-- ── Rotation arc guide ── -->
    <g v-if="arcGuidePath">
      <path :d="arcGuidePath.polyline" fill="none" :stroke="arcGuidePath.color"
            stroke-width="2" stroke-dasharray="6,3" opacity="0.7" />
      <path :d="arcGuidePath.arrowStr" fill="none" :stroke="arcGuidePath.color"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
    </g>

    <!-- ── Fixed (history) motifs ── -->
    <g v-for="(fm, i) in fixedMotifs" :key="`fm${i}`" :opacity="fm.faded ? 0.45 : 1">
      <circle :cx="toSvg(fm).cx" :cy="toSvg(fm).cy" :r="motifSize/2 + 4" :fill="motifColor" opacity="0.15"/>
      <image
        :href="motifImageSrc"
        :x="toSvg(fm).cx - motifSize/2" :y="toSvg(fm).cy - motifSize/2"
        :width="motifSize" :height="motifSize"
        preserveAspectRatio="xMidYMid meet"
      />
      <circle :cx="toSvg(fm).cx" :cy="toSvg(fm).cy" r="3" :fill="motifColor" stroke="white" stroke-width="1.5"/>
      <!-- Label pill -->
      <rect
        :x="labelPos(toSvg(fm).cx).anchor === 'end'
          ? toSvg(fm).cx - 8 - (fm.label.length * 5 + 20)
          : toSvg(fm).cx + 8"
        :y="toSvg(fm).cy - 20"
        :width="fm.label.length * 5 + 20" height="13"
        rx="4" :fill="motifColor" opacity="0.85"
      />
      <text
        :x="labelPos(toSvg(fm).cx).x"
        :y="toSvg(fm).cy - 10"
        :text-anchor="labelPos(toSvg(fm).cx).anchor"
        font-size="8.5" fill="white" font-family="Nunito" font-weight="800"
      >{{ fm.label }}({{ fm.x }},{{ fm.y }})</text>
    </g>

    <!-- ── Snap preview (while dragging) ── -->
    <g v-if="isDragging && snapSvg && snapPoint">
      <circle :cx="snapSvg.cx" :cy="snapSvg.cy" :r="motifSize/2 + 4"
        fill="none" :stroke="motifColor" stroke-width="2" stroke-dasharray="5,3" opacity="0.65"/>
      <circle :cx="snapSvg.cx" :cy="snapSvg.cy" r="3.5" :fill="motifColor" opacity="0.7"/>
      <rect
        :x="labelPos(snapSvg.cx).anchor === 'end'
          ? snapSvg.cx - 8 - 46
          : snapSvg.cx + 6"
        :y="snapSvg.cy - 20"
        width="46" height="13"
        rx="4" :fill="motifColor" opacity="0.8"
      />
      <text
        :x="labelPos(snapSvg.cx).anchor === 'end' ? snapSvg.cx - 8 - 23 : snapSvg.cx + 29"
        :y="snapSvg.cy - 10"
        text-anchor="middle"
        font-size="8.5" fill="white" font-family="Nunito" font-weight="800"
      >({{ snapPoint.x }},{{ snapPoint.y }})</text>
    </g>

    <!-- ── Draggable motif ── -->
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
      <!-- Glow ring (pulses when not dragging to signal "grab me") -->
      <circle
        :r="motifSize/2 + 6"
        :fill="motifColor"
        :opacity="isDragging ? 0.25 : 0.15"
        :style="!disabled && !isDragging ? 'animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite' : ''"
      />
      <circle :r="motifSize/2 + 6" fill="none" :stroke="motifColor" stroke-width="1.5" opacity="0.4"/>
      <image
        :href="motifImageSrc"
        :x="-motifSize/2" :y="-motifSize/2"
        :width="motifSize" :height="motifSize"
        preserveAspectRatio="xMidYMid meet"
        :style="isDragging ? 'filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25))' : ''"
      />
      <circle r="3.5" :fill="motifColor" stroke="white" stroke-width="1.5"/>
      <!-- Label above motif -->
      <text
        x="0" :y="-motifSize/2 - 5"
        text-anchor="middle"
        font-size="9" font-family="Nunito" font-weight="800" :fill="motifColor"
      >{{ draggable.label }}</text>
    </g>
  </svg>
</template>
