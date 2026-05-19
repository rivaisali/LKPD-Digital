<script setup lang="ts">
import { ref } from 'vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import TopBar from '@/components/layout/TopBar.vue'
import { useStudentStore } from '@/stores/useStudentStore'
import { useProgressStore } from '@/stores/useProgressStore'
import { getStarCount } from '@/domain/scoring'
import type { ActivityId } from '@/domain/types'

const studentStore = useStudentStore()
const progressStore = useProgressStore()

const editMode = ref(false)
const tempName = ref(studentStore.name)
const tempClass = ref(studentStore.className)

// Reset confirmation
const resetTarget = ref<{ id: ActivityId; label: string } | null>(null)

async function saveProfile() {
  await studentStore.save(tempName.value, tempClass.value)
  editMode.value = false
}

async function confirmResetActivity() {
  if (!resetTarget.value) return
  await progressStore.resetActivity(resetTarget.value.id)
  resetTarget.value = null
}

const activities = [
  { id: 'translation' as ActivityId, label: 'Translasi',  icon: 'arrow_forward', color: '#ec6585' },
  { id: 'reflection' as ActivityId,  label: 'Refleksi',   icon: 'flip',          color: '#f79624' },
  { id: 'rotation' as ActivityId,    label: 'Rotasi',     icon: 'refresh',       color: '#3d91cf' },
  { id: 'dilation' as ActivityId,    label: 'Dilatasi',   icon: 'open_in_full',  color: '#43a669' },
  { id: 'challenge' as ActivityId,   label: 'Tantangan',  icon: 'emoji_events',  color: '#6f5b9d' },
]
</script>

<template>
  <div class="h-full flex flex-col">
    <TopBar title="Profil" :show-back="false" />

    <div class="flex-1 page-scroll hide-scrollbar px-4 py-4 flex flex-col gap-4">
      <!-- Profile card -->
      <div class="bg-primary rounded-3xl p-5 text-center">
        <div class="w-20 h-20 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-4xl">👧</div>
        <template v-if="!editMode">
          <h2 class="font-display font-bold text-white text-xl">{{ studentStore.name }}</h2>
          <p class="font-body text-white/70 text-sm">{{ studentStore.className || 'Kelas belum diisi' }}</p>
          <button
            class="mt-3 px-4 py-1.5 bg-white/20 rounded-xl font-body text-white text-sm active:bg-white/30"
            @click="editMode = true; tempName = studentStore.name; tempClass = studentStore.className"
          >Edit Profil</button>
        </template>
        <template v-else>
          <input
            v-model="tempName"
            class="w-full bg-white/20 rounded-xl px-3 py-2 text-white font-display text-center text-lg mb-2 outline-none placeholder:text-white/50"
            placeholder="Nama kamu"
          />
          <input
            v-model="tempClass"
            class="w-full bg-white/20 rounded-xl px-3 py-2 text-white font-body text-center text-sm mb-3 outline-none placeholder:text-white/50"
            placeholder="Kelas (contoh: IX-A)"
          />
          <div class="flex gap-2">
            <button class="flex-1 py-2 bg-white/20 rounded-xl text-white font-body text-sm" @click="editMode = false">Batal</button>
            <button class="flex-1 py-2 bg-white rounded-xl text-primary font-display font-semibold text-sm" @click="saveProfile">Simpan</button>
          </div>
        </template>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="font-display font-bold text-2xl text-primary">{{ progressStore.totalScore }}</p>
          <p class="font-body text-gray-500 text-xs">Total Skor</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="font-display font-bold text-2xl text-yellow-400">{{ getStarCount(progressStore.totalScore) }}</p>
          <p class="font-body text-gray-500 text-xs">Bintang</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p class="font-display font-bold text-2xl text-green-500">{{ progressStore.completedCount }}</p>
          <p class="font-body text-gray-500 text-xs">Selesai</p>
        </div>
      </div>

      <!-- Reset per kategori -->
      <div class="bg-white rounded-3xl p-4 shadow-sm">
        <h3 class="font-display font-semibold text-gray-600 text-sm mb-3">Progres Aktivitas</h3>
        <div class="space-y-2">
          <div
            v-for="act in activities"
            :key="act.id"
            class="flex items-center gap-3 rounded-2xl px-3 py-2.5 border border-gray-100"
          >
            <!-- Icon -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: act.color + '20' }"
            >
              <span class="material-symbols-outlined text-lg" :style="{ color: act.color }">{{ act.icon }}</span>
            </div>

            <!-- Label + status -->
            <div class="flex-1 text-left">
              <p class="font-display font-semibold text-sm text-on-surface">{{ act.label }}</p>
              <p class="font-body text-xs"
                 :class="progressStore.progress[act.id]?.status === 'completed' ? 'text-green-500'
                       : progressStore.progress[act.id]?.status === 'in-progress' ? 'text-orange-400'
                       : 'text-gray-400'">
                {{ progressStore.progress[act.id]?.status === 'completed' ? `Selesai · ${progressStore.progress[act.id].score} poin`
                 : progressStore.progress[act.id]?.status === 'in-progress' ? 'Sedang dikerjakan'
                 : 'Belum dimulai' }}
              </p>
            </div>

            <!-- Tombol reset (hanya jika ada progres) -->
            <button
              v-if="progressStore.progress[act.id]?.status !== 'not-started'"
              class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center active:bg-red-100 transition-colors"
              @click="resetTarget = { id: act.id, label: act.label }"
              :aria-label="`Reset ${act.label}`"
            >
              <span class="material-symbols-outlined text-red-400 text-base">restart_alt</span>
            </button>
            <div v-else class="w-8" />
          </div>
        </div>
      </div>
    </div>

    <BottomNav />

    <!-- Konfirmasi reset kategori -->
    <Transition name="modal">
      <div v-if="resetTarget" class="absolute inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/40" @click="resetTarget = null" />
        <div class="relative w-full bg-white rounded-t-3xl px-6 pt-8 pb-8">
          <div class="flex justify-center mb-4">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <span class="material-symbols-outlined text-red-500 text-2xl" style="font-variation-settings: 'FILL' 1;">restart_alt</span>
            </div>
          </div>
          <h2 class="font-display font-bold text-xl text-on-surface text-center mb-2">Reset {{ resetTarget?.label }}?</h2>
          <p class="font-body text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
            Skor dan progres aktivitas <strong>{{ resetTarget?.label }}</strong> akan dihapus dan kembali ke awal.
          </p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3.5 rounded-2xl border-2 border-outline-variant font-display font-semibold text-sm text-on-surface-variant active:scale-95 transition-transform"
              @click="resetTarget = null"
            >Batal</button>
            <button
              class="flex-1 py-3.5 rounded-2xl font-display font-bold text-sm text-white bg-red-500 shadow-md active:scale-95 transition-transform"
              @click="confirmResetActivity"
            >Ya, Reset</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(100%); }
.modal-leave-to .relative { transform: translateY(100%); }
</style>
