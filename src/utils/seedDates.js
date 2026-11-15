import { toCompactDate } from '@/utils/format'
import { addDays, daysBetween } from '@/utils/orderDates'

/**
 * Data seed ditulis untuk satu tanggal acuan (SEED_REFERENCE_DATE). Saat pertama kali dimuat,
 * semua tanggal digeser sejauh selisih hari acuan → hari ini, supaya pesanan contoh selalu
 * terlihat "baru" (ada pesanan untuk hari ini dan besok) kapan pun aplikasi didemokan.
 */

const ORDER_TIME_FIELDS = ['createdAt', 'confirmedAt', 'readyAt', 'completedAt', 'cancelledAt', 'paidAt']

/** Geser waktu ISO sebanyak `days` hari, jam lokalnya tetap. */
function shiftIso(iso, days) {
  if (!iso) return iso
  const date = new Date(iso)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function rebaseTimestamps(rows, fields, referenceKey, todayKey) {
  const days = daysBetween(referenceKey, todayKey)
  if (!days) return rows
  return rows.map((row) => {
    const moved = { ...row }
    for (const field of fields) moved[field] = shiftIso(row[field], days)
    return moved
  })
}

export function rebaseOrders(orders, referenceKey, todayKey) {
  const days = daysBetween(referenceKey, todayKey)
  if (!days) return orders
  return rebaseTimestamps(orders, ORDER_TIME_FIELDS, referenceKey, todayKey).map((order) => ({
    ...order,
    deliveryDate: addDays(order.deliveryDate, days),
    // Bagian tanggal di nomor invoice mengikuti tanggal pesanan dibuat.
    invoiceNo: order.invoiceNo.replace(/-\d{8}-/, `-${toCompactDate(order.createdAt)}-`)
  }))
}
