<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  revealedSteps: number
}>()

const size = 280
const padding = 34
const range = 5

const cellSize = computed(() => (size - padding * 2) / (range * 2))

const COLOR_START = '#6f5b9d'
const stepColors = ['#ec6585', '#f79624', '#3d91cf']

const allPoints = [
  { x: 1, y: 1,   label: 'P',    color: COLOR_START },
  { x: 3, y: 2,   label: "P'",   color: stepColors[0] },
  { x: 3, y: -2,  label: "P''",  color: stepColors[1] },
  { x: -2, y: -3, label: "P'''", color: stepColors[2] },
]

function toSvg(p: { x: number; y: number }) {
  return {
    cx: padding + (p.x + range) * cellSize.value,
    cy: padding + (range - p.y) * cellSize.value,
  }
}

const gridLines = computed(() => {
  const lines = []
  for (let i = -range; i <= range; i++) {
    lines.push({ type: 'v', x: padding + (i + range) * cellSize.value, isAxis: i === 0 })
    lines.push({ type: 'h', y: padding + (range - i) * cellSize.value, isAxis: i === 0 })
  }
  return lines
})

const tickLabels = computed(() => {
  const origin = toSvg({ x: 0, y: 0 })
  const labels = []
  for (let i = -range; i <= range; i++) {
    if (i === 0) continue
    labels.push({ val: i, x: padding + (i + range) * cellSize.value, y: origin.cy + 14, type: 'x' })
    labels.push({ val: i, x: origin.cx - 14, y: padding + (range - i) * cellSize.value + 4, type: 'y' })
  }
  return labels
})

const originSvg = computed(() => toSvg({ x: 0, y: 0 }))

// Points visible based on revealedSteps (P always visible + revealed step results)
const visiblePoints = computed(() => allPoints.slice(0, props.revealedSteps + 1))

// Arrows connecting consecutive visible points
const arrows = computed(() => {
  const pts = visiblePoints.value
  return pts.slice(1).map((pt, i) => ({
    from: toSvg(pts[i]),
    to: toSvg(pt),
    color: pt.color,
    id: `arrow-${i}`,
  }))
})

// Label offset: push label away from edges and avoid overlap
function labelOffset(p: { x: number; y: number }) {
  const dx = p.x >= 0 ? 9 : -9
  const dy = p.y >= 0 ? -13 : 14
  const anchor = p.x >= 0 ? 'start' : 'end'
  return { dx, dy, anchor }
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="mx-auto select-none w-full"
    style="max-width: 280px; overflow: visible"
  >
    <defs>
      <clipPath id="challenge-clip">
        <rect :x="padding - 2" :y="padding - 2" :width="size - padding * 2 + 4" :height="size - padding * 2 + 4" />
      </clipPath>
      <marker
        v-for="(color, i) in stepColors" :key="i"
        :id="`ch-arrow-${i}`"
        markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" :fill="color" />
      </marker>
    </defs>

    <!-- Grid -->
    <g clip-path="url(#challenge-clip)">
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

    <!-- Tick labels -->
    <text
      v-for="(t, i) in tickLabels" :key="`t${i}`"
      :x="t.x" :y="t.y"
      text-anchor="middle"
      font-size="9" fill="#9CA3AF" font-family="Nunito,sans-serif"
    >{{ t.val }}</text>

    <!-- Axis labels & arrowheads -->
    <text :x="size - padding + 10" :y="originSvg.cy + 4" font-size="11" fill="#374151" font-family="Nunito" font-weight="700">X</text>
    <text :x="originSvg.cx - 4"    :y="padding - 8"      font-size="11" fill="#374151" font-family="Nunito" font-weight="700">Y</text>
    <polygon :points="`${size-padding+6},${originSvg.cy-4} ${size-padding+14},${originSvg.cy} ${size-padding+6},${originSvg.cy+4}`" fill="#374151"/>
    <polygon :points="`${originSvg.cx-4},${padding-6} ${originSvg.cx},${padding-14} ${originSvg.cx+4},${padding-6}`" fill="#374151"/>

    <!-- Transformation arrows -->
    <line
      v-for="(arrow, i) in arrows" :key="`arrow-${i}`"
      :x1="arrow.from.cx" :y1="arrow.from.cy"
      :x2="arrow.to.cx"   :y2="arrow.to.cy"
      :stroke="arrow.color" stroke-width="1.8"
      stroke-dasharray="5,3"
      :marker-end="`url(#ch-arrow-${i})`"
    />

    <!-- Points (P always shown + revealed step results) -->
    <g v-for="(pt, i) in visiblePoints" :key="`pt-${i}`">
      <circle
        :cx="toSvg(pt).cx" :cy="toSvg(pt).cy"
        :r="i === 0 ? 5 : 4.5"
        :fill="pt.color" stroke="white" stroke-width="1.5"
      />
      <!-- Label: anchor=start → rect starts at cx+dx; anchor=end → rect ends at cx+dx -->
      <rect
        :x="labelOffset(pt).anchor === 'start'
          ? toSvg(pt).cx + labelOffset(pt).dx - 2
          : toSvg(pt).cx + labelOffset(pt).dx - (pt.label.length * 4.8 + 16)"
        :y="toSvg(pt).cy + labelOffset(pt).dy - 9"
        :width="pt.label.length * 4.8 + 16"
        height="12"
        rx="3"
        :fill="pt.color"
        opacity="0.9"
      />
      <text
        :x="labelOffset(pt).anchor === 'start'
          ? toSvg(pt).cx + labelOffset(pt).dx + 6
          : toSvg(pt).cx + labelOffset(pt).dx - 4"
        :y="toSvg(pt).cy + labelOffset(pt).dy"
        :text-anchor="labelOffset(pt).anchor"
        font-size="8.5" fill="white" font-family="Nunito,sans-serif" font-weight="800"
      >{{ pt.label }}({{ pt.x }},{{ pt.y }})</text>
    </g>
  </svg>
</template>
