/**
 * Konfigurasi global aplikasi.
 * Semua nilai tetap (nama usaha, role, status, batas validasi) dipusatkan di sini
 * agar tidak ada data yang ditulis langsung (hardcode) di dalam komponen.
 */

export const APP_CONFIG = {
  businessName: 'Bakoel Bunda',
  systemName: 'SIM Bakoel Bunda',
  tagline: 'Dimsum Ayam Rumahan',
  invoicePrefix: 'BKB',
  locale: 'id-ID',
  currency: 'IDR',
  storagePrefix: 'bakoelbunda_',
  /** Naikkan angka ini bila struktur data berubah; data lama di localStorage akan direset ke seed. */
  dataVersion: 3,
  /** Tanggal acuan data seed; saat dimuat pertama kali, tanggal seed digeser ke hari ini. */
  seedReferenceDate: '2026-11-12'
}

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  DAPUR: 'dapur'
}

export const ROLE_OPTIONS = [
  { value: ROLES.OWNER, label: 'Owner' },
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.DAPUR, label: 'Dapur' }
]

/** Halaman tujuan pertama setelah login, per role. */
export const ROLE_HOME = {
  [ROLES.OWNER]: 'owner-dashboard',
  [ROLES.ADMIN]: 'order-active',
  [ROLES.DAPUR]: 'dapur-queue'
}

export const ORDER_STATUS = {
  PENDING: 'menunggu',
  PROCESSING: 'diproses',
  READY: 'siap',
  COMPLETED: 'selesai',
  CANCELLED: 'dibatalkan'
}

export const ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUS.PENDING, label: 'Menunggu konfirmasi', variant: 'primary' },
  { value: ORDER_STATUS.PROCESSING, label: 'Diproses', variant: 'warning' },
  { value: ORDER_STATUS.READY, label: 'Siap', variant: 'info' },
  { value: ORDER_STATUS.COMPLETED, label: 'Selesai', variant: 'success' },
  { value: ORDER_STATUS.CANCELLED, label: 'Dibatalkan', variant: 'danger' }
]

/**
 * Aturan perpindahan status pesanan.
 * Kunci = status sekarang, nilai = status tujuan beserta role yang boleh mengubahnya.
 */
export const ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: {
    [ORDER_STATUS.PROCESSING]: [ROLES.ADMIN, ROLES.OWNER],
    [ORDER_STATUS.CANCELLED]: [ROLES.ADMIN, ROLES.OWNER]
  },
  [ORDER_STATUS.PROCESSING]: {
    [ORDER_STATUS.READY]: [ROLES.DAPUR],
    [ORDER_STATUS.CANCELLED]: [ROLES.ADMIN, ROLES.OWNER]
  },
  [ORDER_STATUS.READY]: {
    [ORDER_STATUS.COMPLETED]: [ROLES.ADMIN]
  }
}

/** Usaha rumahan tanpa toko: pesanan diantar kurir atau diambil ke rumah. */
export const ORDER_TYPE = {
  PICKUP: 'ambil',
  DELIVERY: 'antar'
}

export const ORDER_TYPE_OPTIONS = [
  { value: ORDER_TYPE.PICKUP, label: 'Ambil ke rumah' },
  { value: ORDER_TYPE.DELIVERY, label: 'Diantar kurir' }
]

export const PAYMENT_METHOD = {
  PREPAID: 'transfer',
  ON_DELIVERY: 'cod'
}

export const PAYMENT_METHOD_OPTIONS = [
  // label: teks lengkap (struk, detail); choice: teks singkat di tombol pilihan; short: kolom tabel/kartu.
  { value: PAYMENT_METHOD.PREPAID, label: 'Bayar di muka (transfer bank)', choice: 'Transfer di muka', short: 'Transfer' },
  { value: PAYMENT_METHOD.ON_DELIVERY, label: 'Bayar saat diterima', choice: 'Bayar saat diterima', short: 'Bayar di tempat' }
]

/** Status bayar ditandai manual oleh Admin (tanpa upload bukti transfer). */
export const PAYMENT_STATUS = {
  UNPAID: 'belum_bayar',
  PAID: 'lunas'
}

export const PAYMENT_STATUS_OPTIONS = [
  { value: PAYMENT_STATUS.UNPAID, label: 'Belum bayar', variant: 'danger' },
  { value: PAYMENT_STATUS.PAID, label: 'Lunas', variant: 'success' }
]

/** Role yang boleh menandai pesanan lunas. */
export const PAYMENT_ROLES = [ROLES.ADMIN, ROLES.OWNER]

export const VALIDATION_LIMITS = {
  productName: { min: 3, max: 60 },
  description: { max: 200 },
  price: { min: 1, max: 1000000 },
  portionPcs: { min: 1, max: 50 },
  stock: { min: 0, max: 9999 },
  customerName: { min: 2, max: 40 },
  phone: { pattern: /^(\+62|62|0)8[0-9]{7,12}$/ },
  address: { min: 10, max: 200 },
  orderNote: { max: 120 },
  personName: { min: 3, max: 50 },
  username: { min: 4, max: 20, pattern: /^[a-z0-9_]+$/ },
  password: { min: 6, max: 50 },
  maxQtyPerItem: 99,
  time: { pattern: /^([01]\d|2[0-3]):[0-5]\d$/ },
  maxDaysAhead: { min: 1, max: 30 },
  bankName: { min: 2, max: 30 },
  bankAccountNo: { pattern: /^\d{6,20}$/ },
  bankAccountName: { min: 3, max: 50 }
}

export const TOAST_DURATION_MS = 3000

/** Batas jumlah data yang ditampilkan di ringkasan. */
export const DISPLAY_LIMITS = {
  recentOrders: 5,
  topProductDays: 7,
  topProducts: 5,
  customerFavorites: 3
}
