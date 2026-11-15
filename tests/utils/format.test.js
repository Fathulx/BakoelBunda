import { describe, it, expect } from 'vitest'
import { formatShortDateTime } from '@/utils/format'

describe('formatShortDateTime', () => {
  it('format ringkas tanggal/bulan dan jam lokal', () => {
    expect(formatShortDateTime(new Date(2026, 10, 12, 9, 30).toISOString())).toBe('12/11 09.30')
    expect(formatShortDateTime(new Date(2026, 0, 5, 20, 5).toISOString())).toBe('05/01 20.05')
  })
  it('kosong menjadi tanda strip', () => {
    expect(formatShortDateTime(null)).toBe('-')
  })
})
