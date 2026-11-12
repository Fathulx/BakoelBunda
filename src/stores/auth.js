import { ref, computed } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { readStorage, writeStorage, removeStorage, subscribeStorage } from '@/services/storage'
import { useUsersStore } from './users'

const SESSION_KEY = 'session'

export const useAuthStore = defineStore('auth', () => {
  // Sesi disimpan di localStorage agar pengguna tetap login setelah reload.
  const user = ref(readStorage(SESSION_KEY, null))
  // Login/keluar di tab lain langsung berlaku juga di tab ini.
  subscribeStorage(SESSION_KEY, (value) => (user.value = value), { allowRemoval: true })

  const isLoggedIn = computed(() => Boolean(user.value))
  const role = computed(() => user.value?.role ?? null)

  function login(username, password) {
    const cleanUsername = String(username ?? '').trim()
    if (!cleanUsername || !password) {
      return { ok: false, message: 'Username dan kata sandi wajib diisi.' }
    }

    const found = useUsersStore().findByCredentials(cleanUsername, password)
    if (!found) return { ok: false, message: 'Username atau kata sandi salah.' }
    if (!found.isActive) return { ok: false, message: 'Akun Anda dinonaktifkan. Hubungi Owner.' }

    // Kata sandi tidak ikut disimpan di sesi.
    user.value = { id: found.id, name: found.name, username: found.username, role: found.role }
    writeStorage(SESSION_KEY, user.value)
    return { ok: true }
  }

  function logout() {
    user.value = null
    removeStorage(SESSION_KEY)
  }

  /**
   * Cocokkan sesi dengan data pengguna terbaru.
   * Jika akun sudah dihapus atau dinonaktifkan, sesi diakhiri.
   */
  function syncSession() {
    if (!user.value) return
    const latest = useUsersStore().getById(user.value.id)
    if (!latest || !latest.isActive) {
      logout()
      return
    }
    if (latest.name !== user.value.name || latest.role !== user.value.role) {
      user.value = { ...user.value, name: latest.name, role: latest.role }
      writeStorage(SESSION_KEY, user.value)
    }
  }

  const hasRole = (roles = []) => roles.includes(role.value)

  return { user, isLoggedIn, role, login, logout, syncSession, hasRole }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
