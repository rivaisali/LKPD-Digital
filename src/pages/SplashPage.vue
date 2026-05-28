<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/useStudentStore'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAppUpdate } from '@/composables/useAppUpdate'

const router = useRouter()
const studentStore = useStudentStore()
const progressStore = useProgressStore()

type Screen = 'loading' | 'onboarding' | 'returning'
const screen = ref<Screen>('loading')
const showNewGameConfirm = ref(false)

const inputName = ref('')
const inputClass = ref('')
const nameError = ref('')
const classError = ref('')

onMounted(async () => {
  await Promise.all([studentStore.loadFromDB(), progressStore.loadFromDB()])
  screen.value = studentStore.isOnboarded ? 'returning' : 'onboarding'
})

async function submitOnboarding() {
  nameError.value = ''
  classError.value = ''
  if (!inputName.value.trim()) { nameError.value = 'Nama harus diisi'; return }
  if (!inputClass.value.trim()) { classError.value = 'Kelas harus diisi'; return }
  await studentStore.save(inputName.value.trim(), inputClass.value.trim())
  router.push('/story')
}

async function mulaiBaruConfirmed() {
  await Promise.all([progressStore.resetAll(), studentStore.reset()])
  showNewGameConfirm.value = false
  inputName.value = ''
  inputClass.value = ''
  screen.value = 'onboarding'
}

const completedCount = () =>
  (['translation', 'reflection', 'rotation', 'dilation'] as const).filter(
    (id) => progressStore.progress[id]?.status === 'completed',
  ).length

const { updating, done, forceUpdate } = useAppUpdate()
const showUpdateConfirm = ref(false)
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-6 text-center relative" style="background-color: #ffffff;">

    <!-- Karawo full-screen pattern background (4 tiled columns) -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none flex" aria-hidden="true">
      <div
        v-for="i in 4"
        :key="i"
        class="flex-1 h-full"
        style="background-image: url('/images/pattern.svg'); background-repeat: repeat-y; background-size: 150% auto; opacity: 0.90;"
      />
    </div>

    <!-- LOADING -->
    <div v-if="screen === 'loading'" class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p class="font-body text-sm text-on-surface-variant">Memuat...</p>
    </div>

    <!-- ONBOARDING (pengguna baru) -->
    <template v-else-if="screen === 'onboarding'">
      <div class="w-full max-w-sm flex flex-col items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <div class="w-52 h-52 animate-float">
            <img src="/splash2.png" alt="Karakter Nita" class="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h1 class="font-display font-extrabold text-3xl text-primary leading-tight">KARAWO</h1>
          <p class="font-body text-sm text-on-surface-variant">Petualangan Transformasi Geometri</p>
    
        </div>

        <div class="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
          <img
            src="/images/pattern-card.svg"
            class="absolute top-0 left-0 w-full pointer-events-none select-none"
            style="height: 26px; object-fit: cover; object-position: left center; opacity: 0.2;"
            aria-hidden="true"
          />
          <img
            src="/images/pattern-card.svg"
            class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
            style="height: 26px; object-fit: cover; object-position: left center; opacity: 0.2; transform: scaleY(-1);"
            aria-hidden="true"
          />
          <div>
            <h2 class="font-display font-bold text-lg text-on-surface mb-0.5">Hai! Siapakah kamu?</h2>
            <p class="font-body text-xs text-on-surface-variant">Isi nama dan kelasmu untuk memulai petualangan</p>
          </div>

          <div class="flex flex-col gap-3">
            <div>
              <label class="font-display font-semibold text-xs text-on-surface-variant mb-1 block">Nama Lengkap</label>
              <input
                v-model="inputName"
                type="text"
                placeholder="Contoh: Nita Sari"
                class="w-full rounded-xl border-2 px-4 py-3 font-body text-sm outline-none transition-colors"
                :class="nameError ? 'border-red-400 bg-red-50' : 'border-outline-variant focus:border-primary bg-surface-container-lowest'"
                @keyup.enter="submitOnboarding"
              />
              <p v-if="nameError" class="font-body text-xs text-red-500 mt-1">{{ nameError }}</p>
            </div>
            <div>
              <label class="font-display font-semibold text-xs text-on-surface-variant mb-1 block">Kelas</label>
              <input
                v-model="inputClass"
                type="text"
                placeholder="Contoh: IX-A"
                class="w-full rounded-xl border-2 px-4 py-3 font-body text-sm outline-none transition-colors"
                :class="classError ? 'border-red-400 bg-red-50' : 'border-outline-variant focus:border-primary bg-surface-container-lowest'"
                @keyup.enter="submitOnboarding"
              />
              <p v-if="classError" class="font-body text-xs text-red-500 mt-1">{{ classError }}</p>
            </div>
          </div>

          <button
            class="w-full bg-primary text-on-primary py-4 rounded-2xl font-display font-bold text-sm shadow-[0_4px_12px_rgba(97,67,138,0.3)] active:scale-95 transition-transform"
            @click="submitOnboarding"
          >Mulai Petualangan</button>
        </div>

        <div class="flex items-center gap-4">
          <button class="font-body text-xs text-on-surface-variant underline underline-offset-2" @click="router.push('/guide')">
            Petunjuk
          </button>
          <span class="text-outline-variant text-xs">·</span>
          <button class="font-body text-xs text-blue-500 underline underline-offset-2 flex items-center gap-1" @click="showUpdateConfirm = true">
            <span class="material-symbols-outlined text-sm">system_update</span>
            Update App
          </button>
        </div>
      </div>
    </template>

    <!-- RETURNING (sudah pernah main) -->
    <template v-else>
      <div class="w-full max-w-sm flex flex-col items-center gap-5">
        <div class="flex flex-col items-center gap-2">
          <div class="w-60 h-60 animate-float">
            <img src="/splash2.png" alt="Karakter Nita" class="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h1 class="font-display font-extrabold text-3xl text-primary leading-tight">KARAWO</h1>
          <p class="font-body text-xs text-on-surface-variant">Petualangan Transformasi Geometri</p>
        </div>

        <div class="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
          <img
            src="/images/pattern-card.svg"
            class="absolute top-0 left-0 w-full pointer-events-none select-none"
            style="height: 26px; object-fit: cover; object-position: left center; opacity: 0.2;"
            aria-hidden="true"
          />
          <img
            src="/images/pattern-card.svg"
            class="absolute bottom-0 left-0 w-full pointer-events-none select-none"
            style="height: 26px; object-fit: cover; object-position: left center; opacity: 0.2; transform: scaleY(-1);"
            aria-hidden="true"
          />
          <!-- Info siswa -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">👧</div>
            <div class="text-left">
              <p class="font-display font-bold text-on-surface text-base leading-tight">{{ studentStore.name }}</p>
              <p class="font-body text-xs text-on-surface-variant">{{ studentStore.className }}</p>
            </div>
          </div>

          <!-- Progress ringkasan -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-primary/5 rounded-2xl p-3 text-center">
              <p class="font-display font-bold text-2xl text-primary">{{ progressStore.totalScore }}</p>
              <p class="font-body text-xs text-on-surface-variant">Total Skor</p>
            </div>
            <div class="bg-primary/5 rounded-2xl p-3 text-center">
              <p class="font-display font-bold text-2xl text-primary">
                {{ completedCount() }}<span class="text-sm text-on-surface-variant font-normal">/4</span>
              </p>
              <p class="font-body text-xs text-on-surface-variant">Aktivitas Selesai</p>
            </div>
          </div>

          <!-- Tombol aksi -->
          <div class="flex flex-col gap-2">
            <button
              class="w-full bg-primary text-on-primary py-4 rounded-2xl font-display font-bold text-sm shadow-[0_4px_12px_rgba(97,67,138,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2"
              @click="router.push('/home')"
            >
              <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
              Lanjutkan
            </button>
            <button
              class="w-full border-2 border-primary text-primary py-3.5 rounded-2xl font-display font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
              @click="showNewGameConfirm = true"
            >
              <span class="material-symbols-outlined text-base">restart_alt</span>
              Mulai Baru
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="font-body text-xs text-on-surface-variant underline underline-offset-2" @click="router.push('/guide')">
            Petunjuk
          </button>
          <span class="text-outline-variant text-xs">·</span>
          <button class="font-body text-xs text-blue-500 underline underline-offset-2 flex items-center gap-1" @click="showUpdateConfirm = true">
            <span class="material-symbols-outlined text-sm">system_update</span>
            Update App
          </button>
        </div>
      </div>
    </template>

    <!-- Konfirmasi Mulai Baru -->
    <Transition name="modal">
      <div v-if="showNewGameConfirm" class="absolute inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/40" @click="showNewGameConfirm = false" />
        <div class="relative w-full bg-white rounded-t-3xl px-6 pt-8 pb-8">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <span class="material-symbols-outlined text-orange-500 text-3xl" style="font-variation-settings: 'FILL' 1;">warning</span>
            </div>
          </div>
          <h2 class="font-display font-bold text-xl text-on-surface text-center mb-2">Mulai Baru?</h2>
          <p class="font-body text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
            Semua skor dan progres akan di-reset ke 0.<br>Kamu akan diminta mengisi nama dan kelas kembali.
          </p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3.5 rounded-2xl border-2 border-outline-variant font-display font-semibold text-sm text-on-surface-variant active:scale-95 transition-transform"
              @click="showNewGameConfirm = false"
            >Batal</button>
            <button
              class="flex-1 py-3.5 rounded-2xl font-display font-bold text-sm text-white bg-orange-500 shadow-md active:scale-95 transition-transform"
              @click="mulaiBaruConfirmed"
            >Ya, Reset Skor</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Konfirmasi Update Aplikasi -->
    <Transition name="modal">
      <div v-if="showUpdateConfirm" class="absolute inset-0 z-50 flex items-end">
        <div class="absolute inset-0 bg-black/40" @click="!updating && (showUpdateConfirm = false)" />
        <div class="relative w-full bg-white rounded-t-3xl px-6 pt-8 pb-8">
          <div class="flex justify-center mb-4">
            <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-500 text-2xl" style="font-variation-settings: 'FILL' 1;">system_update</span>
            </div>
          </div>
          <h2 class="font-display font-bold text-xl text-on-surface text-center mb-2">Update Aplikasi?</h2>
          <p class="font-body text-sm text-on-surface-variant text-center mb-6 leading-relaxed">
            Semua cache akan dihapus dan aplikasi dimuat ulang untuk mendapatkan versi terbaru.
            <br /><span class="text-orange-500 font-semibold">Data progres belajar tidak akan terhapus.</span>
          </p>

          <div v-if="updating" class="flex items-center justify-center gap-3 py-3 mb-4 bg-blue-50 rounded-2xl">
            <svg class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span class="font-body text-blue-600 text-sm">
              {{ done ? 'Berhasil! Memuat ulang...' : 'Menghapus cache...' }}
            </span>
          </div>

          <div v-else class="flex gap-3">
            <button
              class="flex-1 py-3.5 rounded-2xl border-2 border-outline-variant font-display font-semibold text-sm text-on-surface-variant active:scale-95 transition-transform"
              @click="showUpdateConfirm = false"
            >Batal</button>
            <button
              class="flex-1 py-3.5 rounded-2xl font-display font-bold text-sm text-white bg-blue-500 shadow-md active:scale-95 transition-transform"
              @click="forceUpdate"
            >Ya, Update</button>
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
