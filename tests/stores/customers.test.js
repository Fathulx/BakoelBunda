import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomersStore } from '@/stores/customers'
import { ensureDataVersion } from '@/services/storage'

describe('customers store', () => {
  beforeEach(() => {
    localStorage.clear()
    ensureDataVersion()
    setActivePinia(createPinia())
  })

  it('pelanggan baru ditambahkan', () => {
    const store = useCustomersStore()
    const before = store.items.length
    const customer = store.upsertCustomer({ name: 'Budi', phone: '089911112222' })
    expect(store.items.length).toBe(before + 1)
    expect(customer.id).toMatch(/^cus-/)
    expect(store.getById(customer.id).name).toBe('Budi')
  })

  it('nomor +62, 62, dan 0 untuk nomor yang sama dianggap satu pelanggan', () => {
    const store = useCustomersStore()
    const a = store.upsertCustomer({ name: 'Budi', phone: '+62 899-1111-2222' })
    const b = store.upsertCustomer({ name: 'Budi', phone: '6289911112222' })
    const c = store.upsertCustomer({ name: 'Budi', phone: '089911112222' })
    expect(new Set([a.id, b.id, c.id]).size).toBe(1)
    expect(store.getById(a.id).phone).toBe('089911112222')
  })

  it('nomor sama (beda format) dianggap pelanggan yang sama, nama diperbarui', () => {
    const store = useCustomersStore()
    const first = store.upsertCustomer({ name: 'Budi', phone: '0899-1111-2222' })
    const count = store.items.length
    const second = store.upsertCustomer({ name: 'Budi Santoso', phone: '089911112222' })
    expect(second.id).toBe(first.id)
    expect(store.items.length).toBe(count)
    expect(store.getById(first.id).name).toBe('Budi Santoso')
    expect(store.getById(first.id).phone).toBe('089911112222')
  })
})
