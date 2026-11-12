import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { ensureDataVersion } from '@/services/storage'
import { ORDER_STATUS } from '@/config/app'

describe('removeProduct', () => {
  beforeEach(() => {
    localStorage.clear()
    ensureDataVersion()
    setActivePinia(createPinia())
  })

  it('menolak menghapus menu yang ada di pesanan menunggu konfirmasi (stoknya sudah dipesan)', () => {
    const products = useProductsStore()
    const orders = useOrdersStore()
    orders.items = [
      { id: 'o1', status: ORDER_STATUS.PENDING, deliveryDate: '2026-11-13', createdAt: '2026-11-12T03:00:00.000Z', items: [{ productId: 'prd-001', qty: 1 }] }
    ]
    expect(products.removeProduct('prd-001').ok).toBe(false)
    expect(products.getById('prd-001')).not.toBeNull()
  })

  it('boleh menghapus menu yang hanya ada di pesanan selesai', () => {
    const products = useProductsStore()
    const orders = useOrdersStore()
    orders.items = [
      { id: 'o1', status: ORDER_STATUS.COMPLETED, deliveryDate: '2026-11-10', createdAt: '2026-11-09T03:00:00.000Z', items: [{ productId: 'prd-001', qty: 1 }] }
    ]
    expect(products.removeProduct('prd-001').ok).toBe(true)
  })
})
