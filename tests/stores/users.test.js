import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '@/stores/users'
import { ensureDataVersion } from '@/services/storage'
import { ROLES } from '@/config/app'

describe('users store: perlindungan Owner terakhir', () => {
  beforeEach(() => {
    localStorage.clear()
    ensureDataVersion()
    setActivePinia(createPinia())
  })

  it('Owner aktif terakhir tidak boleh dihapus, dinonaktifkan, atau diganti role-nya', () => {
    const users = useUsersStore()
    const owner = users.items.find((u) => u.role === ROLES.OWNER)
    const someoneElse = 'usr-lain'
    expect(users.removeUser(owner.id, someoneElse)).toEqual({ ok: false, message: 'Owner aktif terakhir tidak boleh dihapus.' })
    expect(users.toggleActive(owner.id, someoneElse).ok).toBe(false)
    expect(users.updateUser(owner.id, { ...owner, role: ROLES.ADMIN, password: '' }).errors.role).toBe(
      'Role owner terakhir tidak boleh diubah.'
    )
  })

  it('akun Admin (bukan owner) boleh dinonaktifkan', () => {
    const users = useUsersStore()
    const admin = users.items.find((u) => u.role === ROLES.ADMIN)
    expect(users.toggleActive(admin.id, 'usr-001').ok).toBe(true)
    expect(users.admins.length).toBe(1)
  })
})
