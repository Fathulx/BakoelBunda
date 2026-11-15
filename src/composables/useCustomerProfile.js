import { readStorage, writeStorage } from '@/services/storage'

/**
 * Data pemesan terakhir di browser ini, supaya pelanggan langganan tidak perlu
 * mengetik nama, WhatsApp, dan alamat lagi. Catatan dan tanggal tidak disimpan
 * karena biasanya berbeda di setiap pesanan.
 */
const STORAGE_KEY = 'customer_profile'
const REMEMBERED_FIELDS = ['customerName', 'customerPhone', 'orderType', 'address', 'paymentMethod']

export function loadCustomerProfile() {
  const stored = readStorage(STORAGE_KEY, {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

export function saveCustomerProfile(checkout) {
  const profile = {}
  for (const field of REMEMBERED_FIELDS) {
    if (checkout[field] !== undefined) profile[field] = checkout[field]
  }
  writeStorage(STORAGE_KEY, profile)
}

export function clearCustomerProfile() {
  writeStorage(STORAGE_KEY, {})
}
