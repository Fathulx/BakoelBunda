import { ref, onMounted, onBeforeUnmount } from 'vue'

/** Waktu sekarang yang diperbarui berkala (untuk "menunggu X menit"). */
export function useNow(intervalMs = 30000) {
  const now = ref(Date.now())
  let timer = null

  onMounted(() => {
    timer = setInterval(() => (now.value = Date.now()), intervalMs)
  })
  onBeforeUnmount(() => clearInterval(timer))

  return now
}
