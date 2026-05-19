<script setup lang="ts">
import { onMounted } from 'vue'
import { useProgressStore } from '@/stores/useProgressStore'
import { useStudentStore } from '@/stores/useStudentStore'

const progressStore = useProgressStore()
const studentStore = useStudentStore()

onMounted(async () => {
  await Promise.all([progressStore.loadFromDB(), studentStore.loadFromDB()])
})
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
