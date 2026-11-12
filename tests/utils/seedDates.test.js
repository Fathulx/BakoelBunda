import { describe, it, expect } from 'vitest'
import { rebaseOrders, rebaseTimestamps } from '@/utils/seedDates'

const order = {
  id: 'ord-1',
  invoiceNo: 'BKB-20261111-0003',
  deliveryDate: '2026-11-13',
  createdAt: new Date(2026, 10, 11, 14, 10).toISOString(),
  confirmedAt: null,
  paidAt: new Date(2026, 10, 11, 15, 10).toISOString()
}

describe('rebaseOrders', () => {
  it('menggeser tanggal terima, waktu, dan nomor invoice sesuai selisih hari', () => {
    const [moved] = rebaseOrders([order], '2026-11-12', '2026-12-01') // maju 19 hari
    expect(moved.deliveryDate).toBe('2026-12-02')
    expect(moved.invoiceNo).toBe('BKB-20261130-0003')
    expect(new Date(moved.createdAt)).toEqual(new Date(2026, 10, 30, 14, 10))
    expect(new Date(moved.paidAt)).toEqual(new Date(2026, 10, 30, 15, 10))
    expect(moved.confirmedAt).toBeNull()
  })

  it('tidak mengubah apa pun bila hari ini sama dengan tanggal acuan', () => {
    expect(rebaseOrders([order], '2026-11-12', '2026-11-12')).toEqual([order])
  })

  it('tidak mengubah data seed aslinya', () => {
    rebaseOrders([order], '2026-11-12', '2026-12-01')
    expect(order.deliveryDate).toBe('2026-11-13')
  })
})

describe('rebaseTimestamps', () => {
  it('menggeser kolom waktu pada data lain (misalnya pelanggan)', () => {
    const customer = { id: 'cus-1', createdAt: new Date(2026, 10, 8, 10).toISOString() }
    const [moved] = rebaseTimestamps([customer], ['createdAt'], '2026-11-12', '2026-11-15')
    expect(new Date(moved.createdAt)).toEqual(new Date(2026, 10, 11, 10))
  })
})
