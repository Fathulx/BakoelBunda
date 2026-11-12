import { ref, computed, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import productsSeed from '@/seed/products.json'
import { loadWithSeed, writeStorage, subscribeStorage } from '@/services/storage'
import { validateProduct, hasErrors } from '@/utils/validators'
import { generateId } from '@/utils/id'
import { ORDER_STATUS } from '@/config/app'
import { useOrdersStore } from './orders'

const STORAGE_KEY = 'products'

export const useProductsStore = defineStore('products', () => {
  const items = ref(loadWithSeed(STORAGE_KEY, productsSeed))

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  subscribeStorage(STORAGE_KEY, (value) => (items.value = value))

  const sorted = computed(() => [...items.value].sort((a, b) => a.name.localeCompare(b.name)))
  const activeProducts = computed(() => sorted.value.filter((p) => p.isActive))
  const lowStockProducts = computed(() =>
    activeProducts.value.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock)
  )
  const byId = computed(() => new Map(items.value.map((p) => [p.id, p])))

  const getById = (id) => byId.value.get(id) ?? null

  function normalize(payload) {
    return {
      name: String(payload.name).trim(),
      description: String(payload.description ?? '').trim(),
      price: Number(payload.price),
      portionPcs: Number(payload.portionPcs),
      stock: Number(payload.stock),
      minStock: Number(payload.minStock),
      isActive: Boolean(payload.isActive)
    }
  }

  function addProduct(payload) {
    const errors = validateProduct(payload, items.value)
    if (hasErrors(errors)) return { ok: false, errors }

    const now = new Date().toISOString()
    items.value.push({ id: generateId('prd'), ...normalize(payload), createdAt: now, updatedAt: now })
    return { ok: true }
  }

  function updateProduct(id, payload) {
    const product = getById(id)
    if (!product) return { ok: false, errors: { general: 'Menu tidak ditemukan.' } }

    const errors = validateProduct(payload, items.value, id)
    if (hasErrors(errors)) return { ok: false, errors }

    Object.assign(product, normalize(payload), { updatedAt: new Date().toISOString() })
    return { ok: true }
  }

  function removeProduct(id) {
    const product = getById(id)
    if (!product) return { ok: false, message: 'Menu tidak ditemukan.' }

    const usedInActiveOrder = useOrdersStore().items.some(
      (order) =>
        [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING, ORDER_STATUS.READY].includes(order.status) &&
        order.items.some((item) => item.productId === id)
    )
    if (usedInActiveOrder) {
      return { ok: false, message: 'Menu masih ada di pesanan aktif. Nonaktifkan saja untuk sementara.' }
    }

    items.value = items.value.filter((p) => p.id !== id)
    return { ok: true, message: `Menu "${product.name}" dihapus.` }
  }

  function toggleActive(id) {
    const product = getById(id)
    if (!product) return
    product.isActive = !product.isActive
    product.updatedAt = new Date().toISOString()
  }

  /** delta negatif = stok berkurang (pesanan dibuat), positif = stok kembali (pesanan dibatalkan). */
  function adjustStock(orderItems, direction) {
    for (const item of orderItems) {
      const product = getById(item.productId)
      if (!product) continue
      product.stock = Math.max(0, product.stock + direction * item.qty)
      product.updatedAt = new Date().toISOString()
    }
  }

  const decreaseStock = (orderItems) => adjustStock(orderItems, -1)
  const restoreStock = (orderItems) => adjustStock(orderItems, 1)

  return {
    items,
    sorted,
    activeProducts,
    lowStockProducts,
    byId,
    getById,
    addProduct,
    updateProduct,
    removeProduct,
    toggleActive,
    decreaseStock,
    restoreStock
  }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductsStore, import.meta.hot))
}
