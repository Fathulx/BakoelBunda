import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ensureDataVersion } from '@/services/storage'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { APP_CONFIG } from '@/config/app'

/** Meniru tab lain yang mengubah localStorage (browser mengirim event "storage" ke tab ini). */
function fromOtherTab(name, value) {
  const key = `${APP_CONFIG.storagePrefix}${name}`
  const newValue = value === null ? null : JSON.stringify(value)
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

describe('sinkron antar tab', () => {
  beforeEach(() => {
    localStorage.clear()
    ensureDataVersion()
    setActivePinia(createPinia())
  })

  it('keluar di tab lain membuat tab ini ikut keluar', () => {
    const auth = useAuthStore()
    auth.login('owner', 'owner123')
    expect(auth.isLoggedIn).toBe(true)
    fromOtherTab('session', null)
    expect(auth.isLoggedIn).toBe(false)
  })

  it('login di tab lain ikut terbaca di tab ini', () => {
    const auth = useAuthStore()
    fromOtherTab('session', { id: 'usr-003', name: 'Dewi Dapur', username: 'dapur', role: 'dapur' })
    expect(auth.role).toBe('dapur')
  })

  it('isi keranjang pembeli ikut berubah dari tab lain', () => {
    const cart = useCartStore()
    fromOtherTab('customer_cart', [{ productId: 'prd-001', qty: 3 }])
    expect(cart.totalQty).toBe(3)
  })
})
