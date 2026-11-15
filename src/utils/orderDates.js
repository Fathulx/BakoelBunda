import { toDateKey, formatLongDate } from '@/utils/format'

/**
 * Aturan tanggal pre-order (PO).
 * Semua tanggal berupa teks "YYYY-MM-DD" waktu lokal, sehingga bisa dibandingkan langsung sebagai teks.
 */

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Ubah "YYYY-MM-DD" menjadi Date lokal pukul 00:00 (bukan UTC). */
export function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(dateKey, days) {
  const date = fromDateKey(dateKey)
  return toDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days))
}

const timeOf = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

/** true bila jam lokal `now` sudah sama dengan atau lewat jam batas ("HH:MM"). */
export const isPastCutoff = (now, cutoffTime) => timeOf(now) >= cutoffTime

/** Pesanan paling cepat untuk besok, jam berapa pun memesan. */
export const earliestDeliveryDate = (now) => addDays(toDateKey(now), 1)

export function latestDeliveryDate(now, settings) {
  const latest = addDays(toDateKey(now), Number(settings.maxDaysAhead))
  const earliest = earliestDeliveryDate(now)
  return latest < earliest ? earliest : latest
}

/** Pesan error untuk tanggal terima yang dipilih pembeli, atau null bila valid. */
export function deliveryDateError(dateKey, now, settings) {
  if (!dateKey) return 'Tanggal pesanan wajib dipilih.'
  if (!DATE_KEY_PATTERN.test(dateKey) || toDateKey(fromDateKey(dateKey)) !== dateKey) {
    return 'Tanggal pesanan tidak valid.'
  }
  const earliest = earliestDeliveryDate(now)
  const latest = latestDeliveryDate(now, settings)
  if (dateKey < earliest) return `Pesanan paling cepat untuk ${formatLongDate(fromDateKey(earliest))}.`
  if (dateKey > latest) return `Pesanan paling lambat untuk ${formatLongDate(fromDateKey(latest))}.`
  return null
}

/** Pesanan susulan: dibuat pada H-1 pada/lewat jam batas. Tetap diproses besok, sesuai antrean. */
export function isLateOrder(order, settings) {
  if (!order?.createdAt || !order?.deliveryDate) return false
  const created = new Date(order.createdAt)
  return toDateKey(created) === addDays(order.deliveryDate, -1) && isPastCutoff(created, settings.orderCutoffTime)
}

/** Selisih hari kalender dari `fromKey` ke `toKey` (bisa negatif). */
export const daysBetween = (fromKey, toKey) => Math.round((fromDateKey(toKey) - fromDateKey(fromKey)) / 86400000)

/**
 * Label tanggal relatif untuk kartu pesanan, beserta warna badge-nya.
 * Contoh: "Hari ini", "Besok", "3 hari lagi", "Terlambat 2 hari".
 */
export function relativeDayLabel(dateKey, todayKey) {
  const days = daysBetween(todayKey, dateKey)
  if (days < 0) return { label: `Terlambat ${-days} hari`, tone: 'danger' }
  if (days === 0) return { label: 'Hari ini', tone: 'warning' }
  if (days === 1) return { label: 'Besok', tone: 'primary' }
  return { label: `${days} hari lagi`, tone: 'neutral' }
}

/** Contoh: "Jumat, 13 November 2026" dari "2026-11-13". */
export const formatDeliveryDate = (dateKey) => (dateKey ? formatLongDate(fromDateKey(dateKey)) : '-')
