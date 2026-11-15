import { ROLES } from './app'

/**
 * Daftar menu sidebar (icon = nama ikon di AppIcon). Sidebar hanya menampilkan item
 * yang `roles`-nya memuat role pengguna yang sedang login.
 */
export const NAVIGATION = [
  { label: 'Dashboard', routeName: 'owner-dashboard', icon: 'dashboard', roles: [ROLES.OWNER] },
  { label: 'Kelola Menu', routeName: 'owner-products', icon: 'menu', roles: [ROLES.OWNER] },
  { label: 'Kelola Pengguna', routeName: 'owner-users', icon: 'users', roles: [ROLES.OWNER] },
  { label: 'Laporan Penjualan', routeName: 'owner-reports', icon: 'reports', roles: [ROLES.OWNER] },
  { label: 'Pelanggan', routeName: 'owner-customers', icon: 'customers', roles: [ROLES.OWNER] },
  { label: 'Pengaturan Toko', routeName: 'owner-settings', icon: 'settings', roles: [ROLES.OWNER] },
  { label: 'Pesanan Aktif', routeName: 'order-active', icon: 'orders', roles: [ROLES.ADMIN] },
  { label: 'Riwayat Pesanan', routeName: 'order-history', icon: 'history', roles: [ROLES.ADMIN] },
  { label: 'Antrean Dapur', routeName: 'dapur-queue', icon: 'kitchen', roles: [ROLES.DAPUR] },
  { label: 'Katalog Menu', routeName: 'catalog', icon: 'catalog', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.DAPUR] }
]
