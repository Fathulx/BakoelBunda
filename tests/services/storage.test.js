import { describe, it, expect, beforeEach } from 'vitest'
import { loadWithSeed, ensureDataVersion } from '@/services/storage'
import { APP_CONFIG } from '@/config/app'

const key = (name) => `${APP_CONFIG.storagePrefix}${name}`

describe('loadWithSeed', () => {
  beforeEach(() => localStorage.clear())

  it('menyalin seed objek ke localStorage saat kosong', () => {
    expect(loadWithSeed('settings', { a: 1 })).toEqual({ a: 1 })
    expect(JSON.parse(localStorage.getItem(key('settings')))).toEqual({ a: 1 })
  })

  it('mengabaikan data tersimpan yang bentuknya beda dengan seed', () => {
    localStorage.setItem(key('settings'), '[1]')
    expect(loadWithSeed('settings', { a: 1 })).toEqual({ a: 1 })
  })

  it('memakai data tersimpan bila bentuknya sama', () => {
    localStorage.setItem(key('items'), '[{"id":1}]')
    expect(loadWithSeed('items', [])).toEqual([{ id: 1 }])
  })
})

describe('ensureDataVersion', () => {
  beforeEach(() => localStorage.clear())

  it('menghapus data lama tanpa versi lalu menulis versi baru', () => {
    localStorage.setItem(key('orders'), '[]')
    expect(ensureDataVersion()).toBe(true)
    expect(localStorage.getItem(key('orders'))).toBeNull()
    expect(JSON.parse(localStorage.getItem(key('data_version')))).toBe(APP_CONFIG.dataVersion)
  })

  it('tidak menghapus apa pun bila versi sudah sama', () => {
    ensureDataVersion()
    localStorage.setItem(key('orders'), '[]')
    expect(ensureDataVersion()).toBe(false)
    expect(localStorage.getItem(key('orders'))).toBe('[]')
  })
})
