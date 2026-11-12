import { ROLES } from './app'

/**
 * Daftar menu sidebar. Sidebar hanya menampilkan item
 * yang `roles`-nya memuat role pengguna yang sedang login.
 */
export const NAVIGATION = [
  { label: 'Dashboard', routeName: 'owner-dashboard', roles: [ROLES.OWNER] },
  { label: 'Kelola Menu', routeName: 'owner-products', roles: [ROLES.OWNER] },
  { label: 'Kelola Pengguna', routeName: 'owner-users', roles: [ROLES.OWNER] },
  { label: 'Laporan Penjualan', routeName: 'owner-reports', roles: [ROLES.OWNER] },
  { label: 'Pelanggan', routeName: 'owner-customers', roles: [ROLES.OWNER] },
  { label: 'Pengaturan Toko', routeName: 'owner-settings', roles: [ROLES.OWNER] },
  { label: 'Pesanan Aktif', routeName: 'order-active', roles: [ROLES.ADMIN] },
  { label: 'Riwayat Pesanan', routeName: 'order-history', roles: [ROLES.ADMIN] },
  { label: 'Antrean Dapur', routeName: 'dapur-queue', roles: [ROLES.DAPUR] },
  { label: 'Katalog Menu', routeName: 'catalog', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.DAPUR] }
]
