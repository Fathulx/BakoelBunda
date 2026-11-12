import { describe, it, expect } from 'vitest'
import { validateSettings } from '@/utils/validators'
import seed from '@/seed/settings.json'

const withField = (patch) => ({ ...seed, ...patch })

describe('validateSettings', () => {
  it('seed bawaan valid', () => {
    expect(validateSettings(seed)).toEqual({})
  })

  it('menolak format jam batas yang salah', () => {
    expect(validateSettings(withField({ orderCutoffTime: '25:00' })).orderCutoffTime).toBeTruthy()
    expect(validateSettings(withField({ orderCutoffTime: '' })).orderCutoffTime).toBeTruthy()
  })

  it('jam selesai serah terima harus setelah jam mulai', () => {
    expect(validateSettings(withField({ handoverEnd: '09:00' })).handoverEnd).toBeTruthy()
    expect(validateSettings(withField({ handoverEnd: '10:00' })).handoverEnd).toBeTruthy()
  })

  it('maxDaysAhead harus 1 sampai 30', () => {
    expect(validateSettings(withField({ maxDaysAhead: 0 })).maxDaysAhead).toBeTruthy()
    expect(validateSettings(withField({ maxDaysAhead: 31 })).maxDaysAhead).toBeTruthy()
    expect(validateSettings(withField({ maxDaysAhead: 1 })).maxDaysAhead).toBeUndefined()
  })

  it('menolak nomor rekening bukan angka, alamat ambil kosong, WA salah', () => {
    expect(validateSettings(withField({ bankAccountNo: '12ab' })).bankAccountNo).toBeTruthy()
    expect(validateSettings(withField({ pickupAddress: '' })).pickupAddress).toBeTruthy()
    expect(validateSettings(withField({ businessWhatsApp: '123' })).businessWhatsApp).toBeTruthy()
    expect(validateSettings(withField({ bankName: '' })).bankName).toBeTruthy()
    expect(validateSettings(withField({ bankAccountName: '' })).bankAccountName).toBeTruthy()
  })
})
