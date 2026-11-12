import { APP_CONFIG } from '@/config/app'

/**
 * Lapisan akses localStorage.
 * Semua store Pinia membaca dan menulis data lewat modul ini,
 * sehingga format kunci dan penanganan error seragam.
 */

const toKey = (name) => `${APP_CONFIG.storagePrefix}${name}`

const clone = (value) => JSON.parse(JSON.stringify(value))

export function readStorage(name, fallback = null) {
  try {
    const raw = localStorage.getItem(toKey(name))
    return raw === null ? fallback : JSON.parse(raw)
  } catch (error) {
    console.warn(`[storage] Gagal membaca "${name}":`, error)
    return fallback
  }
}

export function writeStorage(name, value) {
  try {
    localStorage.setItem(toKey(name), JSON.stringify(value))
  } catch (error) {
    console.error(`[storage] Gagal menyimpan "${name}":`, error)
  }
}

export function removeStorage(name) {
  localStorage.removeItem(toKey(name))
}

/**
 * Inisialisasi data (koleksi array atau objek pengaturan).
 * 1. Jika localStorage sudah berisi data dengan bentuk yang sama dengan seed, pakai data itu.
 * 2. Jika masih kosong (atau bentuknya rusak), salin data dari file JSON seed lalu simpan ke localStorage.
 */
export function loadWithSeed(name, seed) {
  const stored = readStorage(name)
  const sameShape = stored !== null && typeof stored === 'object' && Array.isArray(stored) === Array.isArray(seed)
  if (sameShape) return stored

  const initial = clone(seed)
  writeStorage(name, initial)
  return initial
}

/**
 * Dengarkan perubahan dari tab browser lain (misalnya tab pembeli, Admin, dan Dapur),
 * supaya antrean pesanan tetap sinkron tanpa reload.
 */
export function subscribeStorage(name, callback, { allowRemoval = false } = {}) {
  const key = toKey(name)
  const handler = (event) => {
    if (event.key !== key) return
    // allowRemoval: data yang dihapus di tab lain (misalnya sesi saat logout) diteruskan sebagai null.
    if (event.newValue === null) {
      if (allowRemoval) callback(null)
      return
    }
    try {
      callback(JSON.parse(event.newValue))
    } catch (error) {
      console.warn(`[storage] Data "${name}" dari tab lain tidak valid:`, error)
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

const VERSION_KEY = 'data_version'

/**
 * Jika struktur data berubah (APP_CONFIG.dataVersion dinaikkan), data lama di localStorage
 * dihapus agar dimuat ulang dari seed. Mengembalikan true bila data direset.
 */
export function ensureDataVersion() {
  if (readStorage(VERSION_KEY) === APP_CONFIG.dataVersion) return false
  clearAppStorage()
  writeStorage(VERSION_KEY, APP_CONFIG.dataVersion)
  return true
}

/** Hapus seluruh data aplikasi (dipakai tombol "Reset Data Demo"). */
export function clearAppStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(APP_CONFIG.storagePrefix))
    .forEach((key) => localStorage.removeItem(key))
}
