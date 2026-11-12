import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP_CONFIG, ROLES, ROLE_HOME } from '@/config/app'
import AppLayout from '@/components/layout/AppLayout.vue'
import CustomerLayout from '@/components/layout/CustomerLayout.vue'

const { OWNER, ADMIN, DAPUR } = ROLES

/**
 * meta.roles     : role yang boleh membuka halaman.
 * meta.requiresAuth : wajib login (diwariskan ke semua child route).
 * meta.guestOnly : hanya untuk yang belum login (halaman login).
 * Halaman pembeli (/pesan) terbuka untuk siapa saja tanpa login.
 */
const routes = [
  {
    path: '/pesan',
    component: CustomerLayout,
    children: [
      {
        path: '',
        name: 'customer-order',
        component: () => import('@/views/customer/OrderOnlineView.vue'),
        meta: { title: 'Pesan Dimsum' }
      },
      {
        path: ':id',
        name: 'customer-order-status',
        component: () => import('@/views/customer/OrderStatusView.vue'),
        meta: { title: 'Status Pesanan' }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true, title: 'Masuk' }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        // Staf diarahkan ke halaman awal role-nya; pengunjung lain ke halaman pemesanan.
        redirect: () => ({ name: ROLE_HOME[useAuthStore().role] ?? 'customer-order' })
      },
      {
        path: 'owner/dashboard',
        name: 'owner-dashboard',
        component: () => import('@/views/owner/OwnerDashboardView.vue'),
        meta: { roles: [OWNER], title: 'Dashboard' }
      },
      {
        path: 'owner/menu',
        name: 'owner-products',
        component: () => import('@/views/owner/ProductsView.vue'),
        meta: { roles: [OWNER], title: 'Kelola Menu' }
      },
      {
        path: 'owner/pengguna',
        name: 'owner-users',
        component: () => import('@/views/owner/UsersView.vue'),
        meta: { roles: [OWNER], title: 'Kelola Pengguna' }
      },
      {
        path: 'owner/laporan',
        name: 'owner-reports',
        component: () => import('@/views/owner/ReportsView.vue'),
        meta: { roles: [OWNER], title: 'Laporan Penjualan' }
      },
      {
        path: 'owner/pelanggan',
        name: 'owner-customers',
        component: () => import('@/views/owner/CustomersView.vue'),
        meta: { roles: [OWNER], title: 'Data Pelanggan' }
      },
      {
        path: 'owner/pengaturan',
        name: 'owner-settings',
        component: () => import('@/views/owner/SettingsView.vue'),
        meta: { roles: [OWNER], title: 'Pengaturan Toko' }
      },
      {
        path: 'pesanan/aktif',
        name: 'order-active',
        component: () => import('@/views/admin/ActiveOrdersView.vue'),
        meta: { roles: [ADMIN], title: 'Pesanan Aktif' }
      },
      {
        path: 'pesanan/riwayat',
        name: 'order-history',
        component: () => import('@/views/admin/HistoryView.vue'),
        meta: { roles: [ADMIN], title: 'Riwayat Pesanan' }
      },
      {
        path: 'dapur/antrean',
        name: 'dapur-queue',
        component: () => import('@/views/dapur/KitchenQueueView.vue'),
        meta: { roles: [DAPUR], title: 'Antrean Dapur' }
      },
      {
        path: 'katalog',
        name: 'catalog',
        component: () => import('@/views/shared/CatalogView.vue'),
        meta: { roles: [OWNER, ADMIN, DAPUR], title: 'Katalog Menu' }
      },
      {
        path: '403',
        name: 'forbidden',
        component: () => import('@/views/shared/ForbiddenView.vue'),
        meta: { title: 'Akses Ditolak' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/shared/NotFoundView.vue'),
    meta: { title: 'Halaman Tidak Ditemukan' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/** Penjaga akses berbasis role. */
router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.syncSession()

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: ROLE_HOME[auth.role] }
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !auth.hasRole(to.meta.roles)) {
    return { name: 'forbidden', query: { from: to.fullPath } }
  }

  return true
})

router.afterEach((to) => {
  const isPublic = to.matched[0]?.path === '/pesan'
  const suffix = isPublic ? APP_CONFIG.businessName : APP_CONFIG.systemName
  document.title = to.meta.title ? `${to.meta.title} | ${suffix}` : suffix
})

export default router
