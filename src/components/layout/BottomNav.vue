<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'Beranda', route: '/home', icon: 'home' },
  { name: 'Cerita', route: '/story', icon: 'book_5' },
  { name: 'Profil', route: '/profile', icon: 'person' },
  { name: 'Skor', route: '/result', icon: 'military_tech' },
]

function isActive(navRoute: string) {
  return route.path === navRoute
}
</script>

<template>
  <nav class="bg-surface shrink-0 rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.08)] border-t border-outline-variant/20 relative overflow-hidden">
    <img
      src="/images/pattern-card.svg"
      class="absolute top-0 left-0 w-full pointer-events-none select-none"
      style="height: 16px; object-fit: cover; object-position: left center; opacity: 0.18;"
      aria-hidden="true"
    />
    <div class="flex justify-around items-center h-18 px-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.route"
        class="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all duration-200"
        :class="isActive(item.route)
          ? 'bg-primary-fixed text-primary-dark scale-95'
          : 'text-on-surface-variant hover:bg-surface-container-low'"
      >
        <span
          class="material-symbols-outlined text-[24px] mb-0.5"
          :style="{ fontVariationSettings: isActive(item.route) ? `'FILL' 1` : `'FILL' 0` }"
        >{{ item.icon }}</span>
        <span class="font-display font-semibold text-[11px] leading-none">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
