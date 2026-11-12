import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ensureDataVersion } from '@/services/storage'
import { useAuthStore } from '@/stores/auth'
import App from '@/App.vue'

/**
 * Smoke test: setiap halaman dirender dengan data seed tanpa error/peringatan Vue.
 * Router di-import ulang per test supaya riwayat navigasi bersih.
 */
async function render(path, login) {
  const pinia = createPinia()
  setActivePinia(pinia)
  if (login) useAuthStore().login(login.username, login.password)

  vi.resetModules()
  const { default: router } = await import('@/router')
  router.push(path)
  await router.isReady()

  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()

  const problems = [...warn.mock.calls, ...error.mock.calls].map((args) => args.join(' '))
  warn.mockRestore()
  error.mockRestore()
  const result = { html: wrapper.html(), route: router.currentRoute.value.name, problems }
  wrapper.unmount()
  return result
}

const OWNER = { username: 'owner', password: 'owner123' }
const ADMIN = { username: 'admin', password: 'admin123' }
const KITCHEN = { username: 'dapur', password: 'dapur123' }

describe('smoke: semua halaman tampil', () => {
  beforeEach(() => {
    localStorage.clear()
    ensureDataVersion()
  })

  const cases = [
    ['/pesan', null, 'customer-order', 'Kirim pesanan'],
    ['/pesan/ord-009', null, 'customer-order-status', 'Selesaikan pembayaran'],
    ['/pesan/ord-006', null, 'customer-order-status', 'Pesanan #2'],
    ['/login', null, 'login', 'Masuk'],
    ['/owner/dashboard', OWNER, 'owner-dashboard', 'Belum Lunas'],
    ['/owner/menu', OWNER, 'owner-products', 'Kelola Menu'],
    ['/owner/pengguna', OWNER, 'owner-users', 'Owner'],
    ['/owner/laporan', OWNER, 'owner-reports', 'Status bayar'],
    ['/owner/pelanggan', OWNER, 'owner-customers', 'Bu Rahma'],
    ['/owner/pengaturan', OWNER, 'owner-settings', 'Jam batas pesanan'],
    ['/pesanan/aktif', ADMIN, 'order-active', 'Tandai lunas'],
    ['/pesanan/riwayat', ADMIN, 'order-history', 'Riwayat Pesanan'],
    ['/dapur/antrean', KITCHEN, 'dapur-queue', 'Rekap Produksi'],
    ['/katalog', KITCHEN, 'catalog', 'Dimsum Ayam Saus Biasa']
  ]

  it.each(cases)('%s', async (path, login, routeName, expectedText) => {
    const { html, route, problems } = await render(path, login)
    expect(route).toBe(routeName)
    expect(html).toContain(expectedText)
    expect(problems).toEqual([])
  })

  it('Admin yang membuka halaman owner diarahkan ke 403', async () => {
    const { route } = await render('/owner/menu', ADMIN)
    expect(route).toBe('forbidden')
  })

  it('akun lama (kasir, pesanan) tidak bisa login lagi', () => {
    setActivePinia(createPinia())
    expect(useAuthStore().login('kasir', 'kasir123')).toEqual({ ok: false, message: 'Username atau kata sandi salah.' })
    expect(useAuthStore().login('pesanan', 'pesanan123').ok).toBe(false)
  })

  it('Data Pelanggan: tombol Detail menampilkan riwayat dan isi pesanan', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().login(OWNER.username, OWNER.password)
    vi.resetModules()
    const { default: router } = await import('@/router')
    router.push('/owner/pelanggan')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
    await flushPromises()

    const row = wrapper.findAll('tbody tr').find((tr) => tr.text().includes('Bu Rahma'))
    await row.find('button').trigger('click')
    await flushPromises()

    const modal = document.body.querySelector('[role="dialog"]')
    expect(modal).not.toBeNull()
    expect(modal.textContent).toContain('Riwayat pesanan (2)')
    expect(modal.textContent).toContain('Menu yang sering dipesan')
    expect(modal.textContent).toContain('4x Dimsum Ayam Saus Bolognese Daging')
    const { useOrdersStore } = await import('@/stores/orders')
    expect(modal.textContent).toContain(useOrdersStore(pinia).getById('ord-003').invoiceNo)
    wrapper.unmount()
  })

  it('dibuka di tanggal lain (20 Des): dashboard tetap berisi pesanan hari ini dari data contoh', async () => {
    vi.useFakeTimers({ now: new Date(2026, 11, 20, 9, 0), toFake: ['Date'] })
    try {
      localStorage.clear()
      ensureDataVersion()
      const { html, problems } = await render('/owner/dashboard', OWNER)
      expect(html).toContain('2 pesanan untuk hari ini')
      expect(problems).toEqual([])
    } finally {
      vi.useRealTimers()
    }
  })

  it('dashboard yang dibiarkan terbuka ikut berganti hari setelah tengah malam', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 12, 23, 59, 30), toFake: ['Date', 'setInterval', 'clearInterval'] })
    try {
      localStorage.clear()
      ensureDataVersion()
      const pinia = createPinia()
      setActivePinia(pinia)
      useAuthStore().login(OWNER.username, OWNER.password)
      vi.resetModules()
      const { default: router } = await import('@/router')
      router.push('/owner/dashboard')
      await router.isReady()
      const wrapper = mount(App, { global: { plugins: [pinia, router] } })
      await flushPromises()
      // 12 Nov: besok (13 Nov) ada 8 porsi dikonfirmasi.
      expect(wrapper.text()).toContain('8 porsi dikonfirmasi')

      vi.advanceTimersByTime(60_000) // lewat tengah malam → 13 Nov, besok = 14 Nov
      await flushPromises()
      expect(wrapper.text()).toContain('0 porsi dikonfirmasi, 1 menunggu konfirmasi')
      expect(wrapper.text()).toContain('13 Nov 2026')
      wrapper.unmount()
    } finally {
      vi.useRealTimers()
    }
  })

  it('keluar atau ganti akun di tab lain langsung memindahkan halaman di tab ini', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().login(OWNER.username, OWNER.password)
    vi.resetModules()
    const { default: router } = await import('@/router')
    router.push('/owner/dashboard')
    await router.isReady()
    const wrapper = mount(App, { global: { plugins: [pinia, router] } })
    await flushPromises()

    const sessionKey = 'bakoelbunda_session'
    const dapur = { id: 'usr-003', name: 'Dewi Dapur', username: 'dapur', role: 'dapur' }
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: sessionKey, newValue: JSON.stringify(dapur) }))
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('dapur-queue'))

      window.dispatchEvent(new StorageEvent('storage', { key: sessionKey, newValue: null }))
      await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('login'))
    } finally {
      wrapper.unmount()
      localStorage.removeItem(sessionKey)
    }
  })

  it('halaman login tidak menampilkan username/kata sandi akun', async () => {
    const { html } = await render('/login', null)
    for (const secret of ['owner123', 'admin123', 'dapur123']) expect(html).not.toContain(secret)
  })

  it('Admin setelah login diarahkan ke Pesanan Aktif', async () => {
    const { route } = await render('/', ADMIN)
    expect(route).toBe('order-active')
  })
})
