import { ref, computed, watch } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import ordersSeed from '@/seed/orders.json'
import { loadWithSeed, writeStorage, subscribeStorage } from '@/services/storage'
import { validateCheckout, hasErrors } from '@/utils/validators'
import { generateId } from '@/utils/id'
import { toDateKey, toCompactDate, padNumber } from '@/utils/format'
import { rebaseOrders } from '@/utils/seedDates'
import {
  APP_CONFIG,
  ORDER_STATUS,
  ORDER_TRANSITIONS,
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE,
  PAYMENT_STATUS,
  PAYMENT_ROLES,
  DISPLAY_LIMITS
} from '@/config/app'
import { useProductsStore } from './products'
import { useCustomersStore, normalizePhone } from './customers'
import { useSettingsStore } from './settings'

const STORAGE_KEY = 'orders'

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
/** Urutan antrean: tanggal terima paling dekat dulu, lalu yang memesan lebih awal. */
const byQueue = (a, b) =>
  a.deliveryDate.localeCompare(b.deliveryDate) || new Date(a.createdAt) - new Date(b.createdAt)

// Pesanan yang belum dikonfirmasi atau dibatalkan tidak dihitung sebagai penjualan.
const isCountedSale = (order) =>
  order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.PENDING

const isOpen = (order) => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(order.status)

/** Ringkasan angka dari sekumpulan pesanan (pesanan batal tidak dihitung omzet). */
export function summarize(orders) {
  const valid = orders.filter(isCountedSale)
  const revenue = valid.reduce((sum, o) => sum + o.total, 0)
  const portions = valid.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0)
  return {
    revenue,
    count: valid.length,
    portions,
    average: valid.length ? Math.round(revenue / valid.length) : 0,
    cancelled: orders.length - valid.length
  }
}

/** Menu terlaris berdasarkan jumlah porsi terjual. */
export function topProducts(orders, limit = DISPLAY_LIMITS.topProducts) {
  const totals = new Map()
  for (const order of orders.filter(isCountedSale)) {
    for (const item of order.items) {
      const current = totals.get(item.productId) ?? { productId: item.productId, name: item.name, qty: 0, revenue: 0 }
      current.qty += item.qty
      current.revenue += item.subtotal
      totals.set(item.productId, current)
    }
  }
  return [...totals.values()].sort((a, b) => b.qty - a.qty).slice(0, limit)
}

/**
 * Rekap produksi dapur: total porsi dan pcs per menu, dikelompokkan per tanggal terima.
 * @returns [{ deliveryDate, items: [{ productId, name, portions, pcs }] }] urut tanggal
 */
export function summarizeProduction(orders, productsById) {
  const byDate = new Map()
  for (const order of orders) {
    const perProduct = byDate.get(order.deliveryDate) ?? new Map()
    for (const item of order.items) {
      const pcsPerPortion = productsById.get(item.productId)?.portionPcs ?? 0
      const current = perProduct.get(item.productId) ?? { productId: item.productId, name: item.name, portions: 0, pcs: 0 }
      current.portions += item.qty
      current.pcs += item.qty * pcsPerPortion
      perProduct.set(item.productId, current)
    }
    byDate.set(order.deliveryDate, perProduct)
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([deliveryDate, perProduct]) => ({ deliveryDate, items: [...perProduct.values()] }))
}

export const useOrdersStore = defineStore('orders', () => {
  const items = ref(loadWithSeed(STORAGE_KEY, rebaseOrders(ordersSeed, APP_CONFIG.seedReferenceDate, toDateKey())))

  watch(items, (value) => writeStorage(STORAGE_KEY, value), { deep: true })
  // Sinkron antar-tab: tab Admin dan Dapur langsung melihat pesanan baru dari pembeli.
  subscribeStorage(STORAGE_KEY, (value) => (items.value = value))

  const sorted = computed(() => [...items.value].sort(byNewest))
  const withStatus = (status) => items.value.filter((o) => o.status === status).sort(byQueue)

  const pendingOrders = computed(() => withStatus(ORDER_STATUS.PENDING))
  const kitchenQueue = computed(() => withStatus(ORDER_STATUS.PROCESSING))
  const readyOrders = computed(() => withStatus(ORDER_STATUS.READY))
  const unpaidActiveOrders = computed(() =>
    items.value.filter((o) => isOpen(o) && o.paymentStatus === PAYMENT_STATUS.UNPAID).sort(byQueue)
  )

  const getById = (id) => items.value.find((o) => o.id === id) ?? null
  const ordersForDate = (dateKey) => items.value.filter((o) => o.deliveryDate === dateKey).sort(byQueue)
  /** Riwayat pesanan satu pelanggan, terbaru dulu (relasi customers 1–N orders). */
  const ordersByCustomer = (customerId) => sorted.value.filter((o) => o.customerId === customerId)

  /**
   * Membuat pesanan PO dari keranjang pembeli. Stok langsung dipotong agar tidak terjual dua kali.
   * Status awal "menunggu" sampai Admin menerima pesanan.
   * @param {object} payload { lines, customerName, customerPhone, orderType, address, deliveryDate, note, paymentMethod }
   * @param {Date} now waktu pesan (bisa diisi saat pengujian)
   */
  function createOrder(payload, now = new Date()) {
    const products = useProductsStore()
    const settings = useSettingsStore()
    const total = payload.lines.reduce((sum, line) => sum + line.price * line.qty, 0)

    const errors = validateCheckout({ ...payload, total }, products.byId, { now, settings: settings.data })
    if (hasErrors(errors)) return { ok: false, errors }

    const customer = useCustomersStore().upsertCustomer({ name: payload.customerName, phone: payload.customerPhone })
    const createdDay = toDateKey(now)
    const invoiceSequence = items.value.filter((o) => toDateKey(o.createdAt) === createdDay).length + 1
    // Nomor antrean per tanggal terima, mengikuti urutan masuk (pesanan susulan otomatis di belakang).
    const queueNo = items.value.filter((o) => o.deliveryDate === payload.deliveryDate).length + 1
    const orderItems = payload.lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      price: line.price,
      qty: line.qty,
      subtotal: line.price * line.qty
    }))

    const order = {
      id: generateId('ord'),
      invoiceNo: `${APP_CONFIG.invoicePrefix}-${toCompactDate(now)}-${padNumber(invoiceSequence, 4)}`,
      queueNo,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: normalizePhone(payload.customerPhone),
      orderType: payload.orderType,
      address: payload.orderType === ORDER_TYPE.DELIVERY ? String(payload.address ?? '').trim() : '',
      deliveryDate: payload.deliveryDate,
      note: String(payload.note ?? '').trim(),
      paymentMethod: payload.paymentMethod,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      paidAt: null,
      items: orderItems,
      total,
      status: ORDER_STATUS.PENDING,
      handledById: null,
      handledByName: null,
      createdAt: now.toISOString(),
      confirmedAt: null,
      readyAt: null,
      completedAt: null,
      cancelledAt: null
    }

    products.decreaseStock(orderItems)
    items.value.push(order)
    return { ok: true, order: items.value[items.value.length - 1] }
  }

  const canTransition = (order, nextStatus, role) =>
    Boolean(ORDER_TRANSITIONS[order?.status]?.[nextStatus]?.includes(role))

  /** actor: pengguna yang mengubah status; yang menerima pesanan dicatat sebagai penanggung jawab. */
  function updateStatus(id, nextStatus, role, actor = null) {
    const order = getById(id)
    if (!order) return { ok: false, message: 'Pesanan tidak ditemukan.' }
    if (!canTransition(order, nextStatus, role)) {
      return { ok: false, message: 'Perubahan status ini tidak diizinkan.' }
    }
    if (nextStatus === ORDER_STATUS.COMPLETED && order.paymentStatus !== PAYMENT_STATUS.PAID) {
      return { ok: false, message: 'Pesanan belum lunas. Tandai lunas terlebih dahulu.' }
    }

    const now = new Date().toISOString()
    const wasPending = order.status === ORDER_STATUS.PENDING
    order.status = nextStatus
    if (wasPending && nextStatus === ORDER_STATUS.PROCESSING) {
      order.confirmedAt = now
      if (actor) {
        order.handledById = actor.id
        order.handledByName = actor.name
      }
    }
    if (nextStatus === ORDER_STATUS.READY) order.readyAt = now
    if (nextStatus === ORDER_STATUS.COMPLETED) order.completedAt = now
    if (nextStatus === ORDER_STATUS.CANCELLED) {
      order.cancelledAt = now
      useProductsStore().restoreStock(order.items)
    }

    const outcome = {
      [ORDER_STATUS.PROCESSING]: 'diterima dan dikirim ke dapur',
      [ORDER_STATUS.READY]: 'sudah siap',
      [ORDER_STATUS.COMPLETED]: 'sudah diserahkan',
      [ORDER_STATUS.CANCELLED]: wasPending ? 'ditolak' : 'dibatalkan'
    }[nextStatus]
    const label = outcome ?? ORDER_STATUS_OPTIONS.find((s) => s.value === nextStatus)?.label ?? nextStatus
    return { ok: true, message: `Pesanan #${order.queueNo} atas nama ${order.customerName} ${label}.` }
  }

  /** Menandai pesanan lunas (transfer sudah dicek, atau dibayar saat diterima). */
  function markPaid(id, role) {
    const order = getById(id)
    if (!order) return { ok: false, message: 'Pesanan tidak ditemukan.' }
    if (!PAYMENT_ROLES.includes(role)) return { ok: false, message: 'Anda tidak berhak mengubah status bayar.' }
    if (order.status === ORDER_STATUS.CANCELLED) return { ok: false, message: 'Pesanan yang dibatalkan tidak bisa ditandai lunas.' }
    if (order.paymentStatus === PAYMENT_STATUS.PAID) return { ok: false, message: 'Pesanan ini sudah lunas.' }

    order.paymentStatus = PAYMENT_STATUS.PAID
    order.paidAt = new Date().toISOString()
    return { ok: true, message: `Pesanan #${order.queueNo} atas nama ${order.customerName} ditandai lunas.` }
  }

  /** Filter laporan: { from, to (tanggal terima), status, paymentMethod, paymentStatus, orderType, search } */
  function filterOrders({
    from = '',
    to = '',
    status = '',
    paymentMethod = '',
    paymentStatus = '',
    orderType = '',
    search = ''
  } = {}) {
    const keyword = search.trim().toLowerCase()
    return sorted.value.filter((order) => {
      if (from && order.deliveryDate < from) return false
      if (to && order.deliveryDate > to) return false
      if (status && order.status !== status) return false
      if (paymentMethod && order.paymentMethod !== paymentMethod) return false
      if (paymentStatus && order.paymentStatus !== paymentStatus) return false
      if (orderType && order.orderType !== orderType) return false
      if (
        keyword &&
        !order.invoiceNo.toLowerCase().includes(keyword) &&
        !order.customerName.toLowerCase().includes(keyword) &&
        !order.customerPhone.includes(keyword)
      ) {
        return false
      }
      return true
    })
  }

  return {
    items,
    sorted,
    pendingOrders,
    kitchenQueue,
    readyOrders,
    unpaidActiveOrders,
    getById,
    ordersForDate,
    ordersByCustomer,
    createOrder,
    canTransition,
    updateStatus,
    markPaid,
    filterOrders
  }
})

// Saat development, perubahan store langsung dipakai tanpa perlu refresh halaman.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrdersStore, import.meta.hot))
}
