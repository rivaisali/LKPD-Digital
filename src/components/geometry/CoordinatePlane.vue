<script setup lang="ts">
import { computed } from 'vue'
import type { Point, ReflectionAxis } from '@/domain/types'

const props = withDefaults(defineProps<{
  startPoint?: Point & { label: string }
  endPoint?: Point & { label: string }
  showArrow?: boolean
  mirrorAxis?: ReflectionAxis | null
  showMotif?: boolean
  motifColor?: string
  endMotifColor?: string
  motifImageSrc?: string
  endMotifImageSrc?: string
  endMotifScale?: number
  size?: number
  range?: number
}>(), {
  showArrow: true,
  showMotif: true,
  motifColor: '#EF4444',
  endMotifColor: '#A78BFA',
  motifImageSrc: '/images/karawo-motif.png',
  endMotifImageSrc: '/images/karawo-motif.png',
  endMotifScale: 1,
  size: 280,
  range: 5,
})

const padding = 32
const cellSize = computed(() => (props.size - padding * 2) / (props.range * 2))
const motifSize = computed(() => Math.round(cellSize.value * 1.85))
const endMotifSize = computed(() => Math.round(motifSize.value * props.endMotifScale))

function toSvg(p: Point): { cx: number; cy: number } {
  return {
    cx: padding + (p.x + props.range) * cellSize.value,
    cy: padding + (props.range - p.y) * cellSize.value,
  }
}

const gridLines = computed(() => {
  const lines = []
  for (let i = -props.range; i <= props.range; i++) {
    lines.push({ type: 'v', x: padding + (i + props.range) * cellSize.value, isAxis: i === 0 })
    lines.push({ type: 'h', y: padding + (props.range - i) * cellSize.value, isAxis: i === 0 })
  }
  return lines
})

const tickLabels = computed(() => {
  const labels = []
  const origin = toSvg({ x: 0, y: 0 })
  for (let i = -props.range; i <= props.range; i++) {
    if (i === 0) continue
    labels.push({ val: i, x: padding + (i + props.range) * cellSize.value, y: origin.cy + 14, type: 'x' })
    labels.push({ val: i, x: origin.cx - 14, y: padding + (props.range - i) * cellSize.value + 4, type: 'y' })
  }
  return labels
})

const startSvg = computed(() => props.startPoint ? toSvg(props.startPoint) : null)
const endSvg   = computed(() => props.endPoint   ? toSvg(props.endPoint)   : null)
const originSvg = computed(() => toSvg({ x: 0, y: 0 }))

const mirrorLinePoints = computed(() => {
  if (!props.mirrorAxis) return null
  const r = props.range
  const o = originSvg.value
  if (props.mirrorAxis === 'x')   return { x1: padding, y1: o.cy, x2: props.size - padding, y2: o.cy }
  if (props.mirrorAxis === 'y')   return { x1: o.cx, y1: padding, x2: o.cx, y2: props.size - padding }
  if (props.mirrorAxis === 'y=x') {
    const p1 = toSvg({ x: -r, y: -r }); const p2 = toSvg({ x: r, y: r })
    return { x1: p1.cx, y1: p1.cy, x2: p2.cx, y2: p2.cy }
  }
  const p1 = toSvg({ x: -r, y: r }); const p2 = toSvg({ x: r, y: -r })
  return { x1: p1.cx, y1: p1.cy, x2: p2.cx, y2: p2.cy }
})

// Label position: place label above-right if space allows, otherwise above-left
function labelPos(svg: { cx: number; cy: number }, p: Point) {
  const flip = svg.cx > props.size - 60
  return { x: flip ? svg.cx - 8 : svg.cx + 8, anchor: flip ? 'end' : 'start', y: svg.cy - 12 }
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="mx-auto select-none"
    style="overflow: visible"
  >
    <defs>
      <!-- Clip to grid area -->
      <clipPath id="grid-clip">
        <rect :x="padding - 4" :y="padding - 4" :width="size - padding * 2 + 8" :height="size - padding * 2 + 8" />
      </clipPath>
      <!-- Arrowhead marker for transformation arrow -->
      <marker id="tf-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" :fill="endMotifColor" />
      </marker>
      <!-- End motif color tint filter -->
      <filter id="tint-purple" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="0.5 0 0 0 0.42  0 0.5 0 0 0.27  0 0 0.5 0 0.93  0 0 0 1 0"/>
      </filter>
    </defs>

    <!-- ── Grid ── -->
    <g clip-path="url(#grid-clip)">
      <line
        v-for="(line, i) in gridLines" :key="i"
        :x1="line.type === 'v' ? line.x : padding"
        :y1="line.type === 'v' ? padding : line.y"
        :x2="line.type === 'v' ? line.x : size - padding"
        :y2="line.type === 'v' ? size - padding : line.y"
        :stroke="line.isAxis ? '#374151' : '#E5E7EB'"
        :stroke-width="line.isAxis ? 1.5 : 0.75"
      />
    </g>

    <!-- ── Tick labels ── -->
    <text
      v-for="(t, i) in tickLabels" :key="`t${i}`"
      :x="t.x" :y="t.y"
      text-anchor="middle"
      font-size="9" fill="#9CA3AF" font-family="Nunito,sans-serif"
    >{{ t.val }}</text>

    <!-- ── Axis labels & arrowheads ── -->
    <text :x="size - padding + 10" :y="originSvg.cy + 4" font-size="11" fill="#374151" font-family="Nunito" font-weight="700">X</text>
    <text :x="originSvg.cx - 4"    :y="padding - 8"      font-size="11" fill="#374151" font-family="Nunito" font-weight="700">Y</text>
    <polygon :points="`${size-padding+6},${originSvg.cy-4} ${size-padding+14},${originSvg.cy} ${size-padding+6},${originSvg.cy+4}`" fill="#374151"/>
    <polygon :points="`${originSvg.cx-4},${padding-6} ${originSvg.cx},${padding-14} ${originSvg.cx+4},${padding-6}`" fill="#374151"/>

    <!-- ── Mirror axis line ── -->
    <line
      v-if="mirrorLinePoints"
      :x1="mirrorLinePoints.x1" :y1="mirrorLinePoints.y1"
      :x2="mirrorLinePoints.x2" :y2="mirrorLinePoints.y2"
      stroke="#F97316" stroke-width="2.5" stroke-dasharray="8,5"
    />

    <!-- ── Transformation arrow ── -->
    <line
      v-if="showArrow && startSvg && endSvg"
      :x1="startSvg.cx" :y1="startSvg.cy"
      :x2="endSvg.cx"   :y2="endSvg.cy"
      :stroke="endMotifColor" stroke-width="2"
      stroke-dasharray="6,3" marker-end="url(#tf-arrow)"
    />

    <!-- ── START motif (gambar Karawo asli) ── -->
    <g v-if="showMotif && startSvg">
      <!-- Shadow/glow behind motif -->
      <circle
        :cx="startSvg.cx" :cy="startSvg.cy"
        :r="motifSize / 2 + 3"
        :fill="motifColor" opacity="0.15"
      />
      <!-- Gambar Karawo asli -->
      <image
        :href="motifImageSrc"
        :x="startSvg.cx - motifSize / 2"
        :y="startSvg.cy - motifSize / 2"
        :width="motifSize"
        :height="motifSize"
        preserveAspectRatio="xMidYMid meet"
        style="image-rendering: auto"
      />
      <!-- Titik koordinat -->
      <circle :cx="startSvg.cx" :cy="startSvg.cy" r="3.5" :fill="motifColor" stroke="white" stroke-width="1.5"/>
      <!-- Label -->
      <g>
        <rect
          :x="labelPos(startSvg, startPoint!).anchor === 'end'
            ? startSvg.cx - 8 - (startPoint!.label.length * 5 + 24)
            : startSvg.cx + 8"
          :y="startSvg.cy - 22"
          :width="startPoint!.label.length * 5 + 24" height="14"
          rx="4" :fill="motifColor" opacity="0.85"
        />
        <text
          :x="labelPos(startSvg, startPoint!).x"
          :y="startSvg.cy - 11"
          :text-anchor="labelPos(startSvg, startPoint!).anchor"
          font-size="9.5" fill="white" font-family="Nunito,sans-serif" font-weight="800"
        >{{ startPoint?.label }}</text>
      </g>
    </g>

    <!-- ── END motif (bayangan / hasil transformasi) ── -->
    <g v-if="showMotif && endSvg && endPoint">
      <!-- Shadow behind motif -->
      <circle
        :cx="endSvg.cx" :cy="endSvg.cy"
        :r="endMotifSize / 2 + 3"
        :fill="endMotifColor" opacity="0.18"
      />
      <!-- Gambar Karawo dengan opacity + tint warna ungu -->
      <image
        :href="endMotifImageSrc"
        :x="endSvg.cx - endMotifSize / 2"
        :y="endSvg.cy - endMotifSize / 2"
        :width="endMotifSize"
        :height="endMotifSize"
        preserveAspectRatio="xMidYMid meet"
        opacity="0.55"
        filter="url(#tint-purple)"
      />
      <!-- Titik koordinat -->
      <circle :cx="endSvg.cx" :cy="endSvg.cy" r="3.5" :fill="endMotifColor" stroke="white" stroke-width="1.5"/>
      <!-- Label -->
      <g>
        <rect
          :x="labelPos(endSvg, endPoint).anchor === 'end'
            ? endSvg.cx - 8 - (endPoint.label.length * 5 + 24)
            : endSvg.cx + 8"
          :y="endSvg.cy - 22"
          :width="endPoint.label.length * 5 + 24" height="14"
          rx="4" :fill="endMotifColor" opacity="0.9"
        />
        <text
          :x="labelPos(endSvg, endPoint).x"
          :y="endSvg.cy - 11"
          :text-anchor="labelPos(endSvg, endPoint).anchor"
          font-size="9.5" fill="white" font-family="Nunito,sans-serif" font-weight="800"
        >{{ endPoint.label }}</text>
      </g>
    </g>
  </svg>
</template>
