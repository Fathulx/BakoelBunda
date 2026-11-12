import { ref, computed, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { readStorage, writeStorage, subscribeStorage } from '@/services/storage'
import { VALIDATION_LIMITS } from '@/config/app'
import { useProductsStore } from './products'

const STORAGE_KEY = 'customer_cart'

/** Keranjang pembeli di halaman pemesanan. Disimpan ke localStorage agar tidak hilang saat reload. */
export const useCartStore = defineStore('cart', () => {
  const items = ref(readStorage(STORAGE_KEY, [])) // [{ productId, qty }]

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  subscribeStorage(STORAGE_KEY, (value) => (items.value = value ?? []), { allowRemoval: true })

  const products = useProductsStore()

  /** Gabungkan isi keranjang dengan data produk terbaru (nama, harga, stok). */
  const lines = computed(() =>
    items.value
      .map((item) => {
        const product = products.getById(item.productId)
        if (!product) return null
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: item.qty,
          maxQty: Math.min(product.stock, VALIDATION_LIMITS.maxQtyPerItem),
          subtotal: product.price * item.qty
        }
      })
      .filter(Boolean)
  )

  const total = computed(() => lines.value.reduce((sum, line) => sum + line.subtotal, 0))
  const totalQty = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))
  const qtyByProduct = computed(() => Object.fromEntries(items.value.map((i) => [i.productId, i.qty])))

  const findItem = (productId) => items.value.find((i) => i.productId === productId)

  function maxQtyFor(productId) {
    const product = products.getById(productId)
    return product ? Math.min(product.stock, VALIDATION_LIMITS.maxQtyPerItem) : 0
  }

  /** Mengembalikan pesan error jika gagal, atau null jika berhasil. */
  function addItem(productId) {
    const product = products.getById(productId)
    if (!product || !product.isActive) return 'Menu tidak tersedia.'

    const existing = findItem(productId)
    const nextQty = (existing?.qty ?? 0) + 1
    if (nextQty > maxQtyFor(productId)) return `Stok "${product.name}" tidak mencukupi.`

    if (existing) existing.qty = nextQty
    else items.value.push({ productId, qty: 1 })
    return null
  }

  function setQty(productId, qty) {
    const item = findItem(productId)
    if (!item) return
    const clean = Math.floor(Number(qty) || 0)
    if (clean <= 0) removeItem(productId)
    else item.qty = Math.min(clean, maxQtyFor(productId))
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  return { items, lines, total, totalQty, qtyByProduct, addItem, setQty, removeItem, clear }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
}
