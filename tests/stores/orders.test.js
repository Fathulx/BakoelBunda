import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrdersStore, summarizeProduction } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'
import { useCustomersStore } from '@/stores/customers'
import { ensureDataVersion } from '@/services/storage'
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_TYPE, ROLES } from '@/config/app'

const NOW = new Date(2026, 10, 12, 10, 0)
const actor = { id: 'usr-002', name: 'Rina' }

let orders, products, customers

const basePayload = (patch = {}) => ({
  lines: [{ productId: 'prd-001', name: 'Dimsum Ayam Saus Biasa', price: 18000, qty: 2 }],
  customerName: 'Budi',
  customerPhone: '089911112222',
  orderType: ORDER_TYPE.PICKUP,
  address: '',
  deliveryDate: '2026-11-13',
  note: '',
  paymentMethod: PAYMENT_METHOD.ON_DELIVERY,
  ...patch
})

beforeEach(() => {
  localStorage.clear()
  ensureDataVersion()
  setActivePinia(createPinia())
  orders = useOrdersStore()
  products = useProductsStore()
  customers = useCustomersStore()
  orders.items = [] // mulai tanpa seed pesanan supaya nomor antrean bisa diprediksi
})

describe('createOrder', () => {
  it('pesanan valid: status menunggu, belum bayar, stok berkurang, pelanggan dibuat', () => {
    const stockBefore = products.getById('prd-001').stock
    const result = orders.createOrder(basePayload(), NOW)
    expect(result.ok).toBe(true)
    expect(result.order.status).toBe(ORDER_STATUS.PENDING)
    expect(result.order.paymentStatus).toBe(PAYMENT_STATUS.UNPAID)
    expect(result.order.deliveryDate).toBe('2026-11-13')
    expect(result.order.total).toBe(36000)
    expect(products.getById('prd-001').stock).toBe(stockBefore - 2)
    expect(customers.getById(result.order.customerId).name).toBe('Budi')
  })

  it('tanggal hari ini ditolak', () => {
    const result = orders.createOrder(basePayload({ deliveryDate: '2026-11-12' }), NOW)
    expect(result.ok).toBe(false)
    expect(result.errors.deliveryDate).toBeTruthy()
  })

  it('diantar tanpa alamat ditolak', () => {
    const result = orders.createOrder(basePayload({ orderType: ORDER_TYPE.DELIVERY }), NOW)
    expect(result.errors.address).toBeTruthy()
  })

  it('jumlah melebihi stok ditolak dan stok tidak berubah', () => {
    const stock = products.getById('prd-001').stock
    const lines = [{ productId: 'prd-001', name: 'x', price: 18000, qty: stock + 1 }]
    const result = orders.createOrder(basePayload({ lines }), NOW)
    expect(result.errors.cart).toBeTruthy()
    expect(products.getById('prd-001').stock).toBe(stock)
  })

  it('WhatsApp wajib dan metode bayar harus valid', () => {
    const result = orders.createOrder(basePayload({ customerPhone: '', paymentMethod: 'tunai' }), NOW)
    expect(result.errors.customerPhone).toBeTruthy()
    expect(result.errors.paymentMethod).toBeTruthy()
  })

  it('nomor antrean dihitung per tanggal terima', () => {
    const a = orders.createOrder(basePayload(), NOW).order
    const b = orders.createOrder(basePayload(), NOW).order
    const c = orders.createOrder(basePayload({ deliveryDate: '2026-11-14' }), NOW).order
    expect([a.queueNo, b.queueNo, c.queueNo]).toEqual([1, 2, 1])
  })

  it('pesanan setelah jam batas tetap untuk besok, antrean di belakang', () => {
    const early = orders.createOrder(basePayload(), NOW).order
    const late = orders.createOrder(basePayload(), new Date(2026, 10, 12, 21, 0))
    expect(late.ok).toBe(true)
    expect(late.order.deliveryDate).toBe('2026-11-13')
    expect(late.order.queueNo).toBeGreaterThan(early.queueNo)
  })
})

describe('status dan pembayaran', () => {
  const advanceToReady = (id) => {
    orders.updateStatus(id, ORDER_STATUS.PROCESSING, ROLES.ADMIN, actor)
    orders.updateStatus(id, ORDER_STATUS.READY, ROLES.DAPUR)
  }

  it('konfirmasi mencatat siapa yang menangani', () => {
    const { order } = orders.createOrder(basePayload(), NOW)
    orders.updateStatus(order.id, ORDER_STATUS.PROCESSING, ROLES.ADMIN, actor)
    expect(orders.getById(order.id).handledByName).toBe('Rina')
  })

  it('tidak bisa diserahkan sebelum lunas; setelah lunas bisa', () => {
    const { order } = orders.createOrder(basePayload(), NOW)
    advanceToReady(order.id)
    const blocked = orders.updateStatus(order.id, ORDER_STATUS.COMPLETED, ROLES.ADMIN, actor)
    expect(blocked).toEqual({ ok: false, message: 'Pesanan belum lunas. Tandai lunas terlebih dahulu.' })

    expect(orders.markPaid(order.id, ROLES.ADMIN).ok).toBe(true)
    expect(orders.getById(order.id).paymentStatus).toBe(PAYMENT_STATUS.PAID)
    expect(orders.getById(order.id).paidAt).toBeTruthy()
    expect(orders.updateStatus(order.id, ORDER_STATUS.COMPLETED, ROLES.ADMIN, actor).ok).toBe(true)
  })

  it('markPaid ditolak untuk role dapur, pesanan batal, atau yang sudah lunas', () => {
    const { order } = orders.createOrder(basePayload(), NOW)
    expect(orders.markPaid(order.id, ROLES.DAPUR).ok).toBe(false)
    expect(orders.markPaid(order.id, ROLES.ADMIN).ok).toBe(true)
    expect(orders.markPaid(order.id, ROLES.ADMIN).ok).toBe(false)

    const other = orders.createOrder(basePayload(), NOW).order
    orders.updateStatus(other.id, ORDER_STATUS.CANCELLED, ROLES.ADMIN, actor)
    expect(orders.markPaid(other.id, ROLES.ADMIN).ok).toBe(false)
  })

  it('menolak pesanan mengembalikan stok', () => {
    const stock = products.getById('prd-001').stock
    const { order } = orders.createOrder(basePayload(), NOW)
    orders.updateStatus(order.id, ORDER_STATUS.CANCELLED, ROLES.ADMIN, actor)
    expect(products.getById('prd-001').stock).toBe(stock)
  })

  it('antrean dapur diurutkan berdasarkan tanggal terima', () => {
    const later = orders.createOrder(basePayload({ deliveryDate: '2026-11-15' }), NOW).order
    const sooner = orders.createOrder(basePayload({ deliveryDate: '2026-11-13' }), NOW).order
    for (const o of [later, sooner]) orders.updateStatus(o.id, ORDER_STATUS.PROCESSING, ROLES.ADMIN, actor)
    expect(orders.kitchenQueue.map((o) => o.id)).toEqual([sooner.id, later.id])
  })
})

describe('data seed mengikuti tanggal hari ini', () => {
  it('dibuka 1 Desember: pesanan contoh "untuk besok" menjadi 2 Desember', () => {
    vi.useFakeTimers({ now: new Date(2026, 11, 1, 9, 0), toFake: ['Date'] })
    try {
      localStorage.clear()
      ensureDataVersion()
      setActivePinia(createPinia())
      const fresh = useOrdersStore()
      // Di seed, ord-009 untuk 13 Nov dengan tanggal acuan 12 Nov (H+1).
      expect(fresh.getById('ord-009').deliveryDate).toBe('2026-12-02')
      expect(fresh.getById('ord-009').invoiceNo).toMatch(/^BKB-20261201-/)
      expect(useCustomersStore().getById('cus-001').createdAt < fresh.getById('ord-001').createdAt).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('ordersByCustomer', () => {
  it('hanya pesanan milik pelanggan tersebut, terbaru dulu', () => {
    const first = orders.createOrder(basePayload(), NOW).order
    const second = orders.createOrder(basePayload({ deliveryDate: '2026-11-14' }), new Date(2026, 10, 12, 11, 0)).order
    orders.createOrder(basePayload({ customerName: 'Lain', customerPhone: '081377778888' }), NOW)
    expect(orders.ordersByCustomer(first.customerId).map((o) => o.id)).toEqual([second.id, first.id])
    expect(orders.ordersByCustomer('cus-tidak-ada')).toEqual([])
  })
})

describe('filterOrders', () => {
  it('filter tanggal berdasarkan tanggal terima dan status bayar', () => {
    const a = orders.createOrder(basePayload({ deliveryDate: '2026-11-13' }), NOW).order
    orders.createOrder(basePayload({ deliveryDate: '2026-11-15' }), NOW)
    orders.markPaid(a.id, ROLES.ADMIN)
    expect(orders.filterOrders({ from: '2026-11-14' }).length).toBe(1)
    expect(orders.filterOrders({ paymentStatus: PAYMENT_STATUS.PAID }).map((o) => o.id)).toEqual([a.id])
  })
})

describe('summarizeProduction', () => {
  it('menjumlahkan porsi dan pcs per tanggal', () => {
    const byId = new Map([['prd-001', { id: 'prd-001', name: 'Dimsum', portionPcs: 5 }]])
    const item = (qty) => ({ productId: 'prd-001', name: 'Dimsum', qty })
    const result = summarizeProduction(
      [
        { deliveryDate: '2026-11-14', items: [item(1)] },
        { deliveryDate: '2026-11-13', items: [item(2)] },
        { deliveryDate: '2026-11-13', items: [item(3)] }
      ],
      byId
    )
    expect(result).toEqual([
      { deliveryDate: '2026-11-13', items: [{ productId: 'prd-001', name: 'Dimsum', portions: 5, pcs: 25 }] },
      { deliveryDate: '2026-11-14', items: [{ productId: 'prd-001', name: 'Dimsum', portions: 1, pcs: 5 }] }
    ])
  })
})
