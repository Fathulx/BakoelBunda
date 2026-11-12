import { ref, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import customersSeed from '@/seed/customers.json'
import { loadWithSeed, writeStorage, subscribeStorage } from '@/services/storage'
import { generateId } from '@/utils/id'
import { toDateKey } from '@/utils/format'
import { rebaseTimestamps } from '@/utils/seedDates'
import { APP_CONFIG } from '@/config/app'

const STORAGE_KEY = 'customers'

/**
 * Nomor WhatsApp disimpan dalam satu format "08...": tanpa spasi/strip, dan awalan +62/62 diganti 0.
 * Jadi "+62 812-...", "62812..." dan "0812..." dikenali sebagai pelanggan yang sama.
 */
export const normalizePhone = (phone) =>
  String(phone ?? '')
    .replace(/[\s-]/g, '')
    .replace(/^\+?62/, '0')

/**
 * Data pelanggan. Dibuat otomatis saat pembeli mengirim pesanan,
 * dikenali dari nomor WhatsApp (satu pelanggan bisa punya banyak pesanan).
 */
export const useCustomersStore = defineStore('customers', () => {
  const seed = rebaseTimestamps(customersSeed, ['createdAt', 'updatedAt'], APP_CONFIG.seedReferenceDate, toDateKey())
  const items = ref(loadWithSeed(STORAGE_KEY, seed))

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  subscribeStorage(STORAGE_KEY, (value) => (items.value = value))

  const getById = (id) => items.value.find((c) => c.id === id) ?? null

  /** Cari pelanggan berdasarkan nomor WA; buat baru bila belum ada, perbarui nama bila sudah ada. */
  function upsertCustomer({ name, phone }) {
    const cleanPhone = normalizePhone(phone)
    const cleanName = String(name ?? '').trim()
    const now = new Date().toISOString()

    const existing = items.value.find((c) => c.phone === cleanPhone)
    if (existing) {
      existing.name = cleanName
      existing.updatedAt = now
      return existing
    }

    const customer = { id: generateId('cus'), name: cleanName, phone: cleanPhone, createdAt: now, updatedAt: now }
    items.value.push(customer)
    return items.value[items.value.length - 1]
  }

  return { items, getById, upsertCustomer }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomersStore, import.meta.hot))
}
