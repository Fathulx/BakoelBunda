import { ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { TOAST_DURATION_MS } from '@/config/app'
import { generateId } from '@/utils/id'

/** Notifikasi singkat (sukses, error, peringatan) yang tampil di pojok layar. */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function remove(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(type, message) {
    const id = generateId('tst')
    toasts.value.push({ id, type, message })
    setTimeout(() => remove(id), TOAST_DURATION_MS)
  }

  const success = (message) => push('success', message)
  const error = (message) => push('danger', message)
  const warning = (message) => push('warning', message)

  return { toasts, push, remove, success, error, warning }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}
