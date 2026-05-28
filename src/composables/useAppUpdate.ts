import { ref } from 'vue'

export function useAppUpdate() {
  const updating = ref(false)
  const done = ref(false)

  async function forceUpdate() {
    updating.value = true
    try {
      // 1. Hapus semua cache browser (workbox precache + runtime cache)
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }

      // 2. Kirim SKIP_WAITING ke SW yang menunggu (jika ada)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          await new Promise((r) => setTimeout(r, 400))
        } else {
          // Paksa cek versi baru dari server
          await reg?.update().catch(() => null)
        }
      }

      done.value = true
      // Beri jeda singkat agar user melihat status "Berhasil"
      await new Promise((r) => setTimeout(r, 800))
    } finally {
      window.location.reload()
    }
  }

  return { updating, done, forceUpdate }
}
