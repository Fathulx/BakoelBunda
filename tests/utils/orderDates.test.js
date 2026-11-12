import { describe, it, expect } from 'vitest'
import {
  addDays,
  isPastCutoff,
  earliestDeliveryDate,
  latestDeliveryDate,
  deliveryDateError,
  isLateOrder
} from '@/utils/orderDates'

const settings = { orderCutoffTime: '20:00', maxDaysAhead: 7 }
const at = (d, h, m = 0) => new Date(2026, 10, d, h, m) // November 2026, waktu lokal

describe('addDays', () => {
  it('maju dan mundur melewati batas bulan', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-01', -1)).toBe('2026-11-30')
  })
})

describe('earliestDeliveryDate', () => {
  it('selalu besok, termasuk setelah jam batas', () => {
    expect(earliestDeliveryDate(at(12, 19, 59))).toBe('2026-11-13')
    expect(earliestDeliveryDate(at(12, 23, 30))).toBe('2026-11-13')
  })
  it('ganti bulan', () => {
    expect(earliestDeliveryDate(at(30, 10))).toBe('2026-12-01')
  })
  it('dini hari memakai tanggal lokal, bukan UTC', () => {
    expect(earliestDeliveryDate(at(12, 3))).toBe('2026-11-13')
  })
})

describe('latestDeliveryDate', () => {
  it('hari ini + maxDaysAhead', () => {
    expect(latestDeliveryDate(at(12, 10), settings)).toBe('2026-11-19')
  })
  it('maxDaysAhead 1 sama dengan tanggal paling cepat', () => {
    expect(latestDeliveryDate(at(12, 21), { ...settings, maxDaysAhead: 1 })).toBe(earliestDeliveryDate(at(12, 21)))
  })
})

describe('isPastCutoff', () => {
  it('19:59 belum, 20:00 sudah', () => {
    expect(isPastCutoff(at(12, 19, 59), '20:00')).toBe(false)
    expect(isPastCutoff(at(12, 20, 0), '20:00')).toBe(true)
  })
})

describe('deliveryDateError', () => {
  const now = at(12, 10)
  it('kosong wajib dipilih', () => {
    expect(deliveryDateError('', now, settings)).toBe('Tanggal pesanan wajib dipilih.')
  })
  it('hari ini ditolak', () => {
    expect(deliveryDateError('2026-11-12', now, settings)).toMatch(/^Pesanan paling cepat untuk /)
  })
  it('lewat batas hari ditolak', () => {
    expect(deliveryDateError('2026-11-20', now, settings)).toMatch(/^Pesanan paling lambat untuk /)
  })
  it('besok dan batas akhir diterima', () => {
    expect(deliveryDateError('2026-11-13', now, settings)).toBeNull()
    expect(deliveryDateError('2026-11-19', now, settings)).toBeNull()
  })
  it('format salah ditolak', () => {
    expect(deliveryDateError('13/11/2026', now, settings)).toBe('Tanggal pesanan tidak valid.')
  })
})

describe('isLateOrder', () => {
  const order = (createdAt, deliveryDate) => ({ createdAt: createdAt.toISOString(), deliveryDate })
  it('dibuat H-1 tepat jam batas = susulan', () => {
    expect(isLateOrder(order(at(12, 20), '2026-11-13'), settings)).toBe(true)
  })
  it('dibuat H-1 sebelum jam batas = bukan susulan', () => {
    expect(isLateOrder(order(at(12, 19, 59), '2026-11-13'), settings)).toBe(false)
  })
  it('dibuat malam untuk tanggal yang lebih jauh = bukan susulan', () => {
    expect(isLateOrder(order(at(12, 21), '2026-11-15'), settings)).toBe(false)
  })
})
