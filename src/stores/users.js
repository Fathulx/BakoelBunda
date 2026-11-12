import { ref, computed, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import usersSeed from '@/seed/users.json'
import { loadWithSeed, writeStorage, subscribeStorage } from '@/services/storage'
import { validateUser, hasErrors } from '@/utils/validators'
import { generateId } from '@/utils/id'
import { ROLES } from '@/config/app'

const STORAGE_KEY = 'users'

export const useUsersStore = defineStore('users', () => {
  // Inisialisasi: ambil dari localStorage, atau salin dari seed jika masih kosong.
  const items = ref(loadWithSeed(STORAGE_KEY, usersSeed))

  // Setiap perubahan otomatis disimpan kembali ke localStorage.
  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  subscribeStorage(STORAGE_KEY, (value) => (items.value = value))

  const sorted = computed(() => [...items.value].sort((a, b) => a.name.localeCompare(b.name)))
  const admins = computed(() => items.value.filter((u) => u.role === ROLES.ADMIN))

  const getById = (id) => items.value.find((u) => u.id === id) ?? null

  const findByCredentials = (username, password) =>
    items.value.find((u) => u.username === username.toLowerCase() && u.password === password) ?? null

  // Minimal harus selalu ada satu Owner aktif supaya pengaturan toko tetap bisa diubah.
  const isLastActiveOwner = (user) =>
    user.role === ROLES.OWNER &&
    user.isActive &&
    items.value.filter((u) => u.role === ROLES.OWNER && u.isActive).length === 1

  function normalize(payload) {
    return {
      name: String(payload.name).trim(),
      username: String(payload.username).trim().toLowerCase(),
      role: payload.role
    }
  }

  function addUser(payload) {
    const errors = validateUser(payload, items.value)
    if (hasErrors(errors)) return { ok: false, errors }

    items.value.push({
      id: generateId('usr'),
      ...normalize(payload),
      password: payload.password,
      isActive: true,
      createdAt: new Date().toISOString()
    })
    return { ok: true }
  }

  function updateUser(id, payload) {
    const user = getById(id)
    if (!user) return { ok: false, errors: { general: 'Pengguna tidak ditemukan.' } }

    const errors = validateUser(payload, items.value, id)
    if (hasErrors(errors)) return { ok: false, errors }

    if (user.role === ROLES.OWNER && payload.role !== ROLES.OWNER && isLastActiveOwner(user)) {
      return { ok: false, errors: { role: 'Role owner terakhir tidak boleh diubah.' } }
    }

    Object.assign(user, normalize(payload))
    if (payload.password) user.password = payload.password
    return { ok: true }
  }

  function toggleActive(id, currentUserId) {
    const user = getById(id)
    if (!user) return { ok: false, message: 'Pengguna tidak ditemukan.' }
    if (id === currentUserId) return { ok: false, message: 'Anda tidak bisa menonaktifkan akun sendiri.' }
    if (isLastActiveOwner(user)) return { ok: false, message: 'Owner aktif terakhir tidak boleh dinonaktifkan.' }

    user.isActive = !user.isActive
    return { ok: true, message: `Akun ${user.name} ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}.` }
  }

  function removeUser(id, currentUserId) {
    const user = getById(id)
    if (!user) return { ok: false, message: 'Pengguna tidak ditemukan.' }
    if (id === currentUserId) return { ok: false, message: 'Anda tidak bisa menghapus akun sendiri.' }
    if (isLastActiveOwner(user)) return { ok: false, message: 'Owner aktif terakhir tidak boleh dihapus.' }

    items.value = items.value.filter((u) => u.id !== id)
    return { ok: true, message: `Akun ${user.name} dihapus.` }
  }

  return {
    items,
    sorted,
    admins,
    getById,
    findByCredentials,
    addUser,
    updateUser,
    toggleActive,
    removeUser
  }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
