import { describe, it, expect, beforeEach } from 'vitest'
import { loadCustomerProfile, saveCustomerProfile } from '@/composables/useCustomerProfile'

describe('profil pembeli langganan (diisi otomatis)', () => {
  beforeEach(() => localStorage.clear())

  it('kosong bila belum pernah memesan', () => {
    expect(loadCustomerProfile()).toEqual({})
  })

  it('menyimpan nama, WA, cara terima, alamat, dan metode bayar dari pesanan terakhir', () => {
    saveCustomerProfile({
      customerName: 'Budi',
      customerPhone: '089911112222',
      orderType: 'antar',
      address: 'Jl. Kenanga No. 5',
      paymentMethod: 'cod',
      note: 'saus dipisah',
      deliveryDate: '2026-11-16'
    })
    expect(loadCustomerProfile()).toEqual({
      customerName: 'Budi',
      customerPhone: '089911112222',
      orderType: 'antar',
      address: 'Jl. Kenanga No. 5',
      paymentMethod: 'cod'
    })
  })

  it('tidak menyimpan catatan dan tanggal (selalu berbeda tiap pesanan)', () => {
    saveCustomerProfile({ customerName: 'Budi', note: 'x', deliveryDate: '2026-11-16' })
    const profile = loadCustomerProfile()
    expect(profile.note).toBeUndefined()
    expect(profile.deliveryDate).toBeUndefined()
  })
})
