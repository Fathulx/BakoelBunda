# Pre-Order Web Bakoel Bunda — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah SIM Bakoel Bunda dari model "kasir toko (POS)" menjadi sistem **pre-order online**: semua pesanan masuk lewat web `/pesan`, dikonfirmasi Admin Pesanan, diproduksi dapur per tanggal, lalu diantar kurir atau diambil ke rumah.

**Architecture:** Tetap Vue 3 `<script setup>` + Vue Router + Pinia + seed JSON + localStorage. Aturan bisnis baru (tanggal pesanan, batas jam, status bayar) ditaruh di utils/stores yang bisa dites, nilai-nilai yang bisa berubah (jam tutup, rekening, alamat ambil) disimpan sebagai data **Pengaturan Toko** (seed + store + halaman admin) supaya tidak ada hardcode di komponen.

**Tech Stack:** Vue 3.5, Vue Router 4, Pinia 2, Vite 6, Vitest + happy-dom (baru, devDependency untuk unit test).

**Spec:** Tidak ada file spec terpisah; keputusan berasal dari diskusi 2026-11-12 dan dirangkum di bagian *Keputusan* di bawah. Rubrik: lampiran `rubrik_dan_template_laporan_uts.md` (A1–A5).

## Keputusan (dari diskusi)

1. Usaha rumahan tanpa toko, sistem PO. **Fitur POS dihapus**; pesanan WA diarahkan ke link `/pesan`.
2. Role **Kasir → Admin Pesanan** (`admin_pesanan`). Role lain: Admin/Owner, Dapur.
3. Tanggal terima paling cepat **selalu besok (H+1)**, jam berapa pun memesan. Paling jauh **7 hari** dari hari ini. Pesanan yang masuk pada/lewat **jam batas 20:00** (pada H-1) tetap untuk besok, **sesuai urutan antrean** (nomor antrean per tanggal mengikuti urutan masuk, jadi otomatis di belakang), dan diberi penanda **"Pesanan susulan"** untuk Admin Pesanan & Dapur.
4. Jam serah terima (antar/ambil) **10:00–17:00**, hanya ditampilkan sebagai info (tidak dipilih pembeli).
5. Metode bayar: **Bayar di muka (transfer/QRIS)** atau **Bayar saat diterima**. Status bayar: **Belum bayar / Lunas**, ditandai manual oleh Admin Pesanan. Tanpa upload bukti transfer.
6. Cara terima: **Diantar kurir** (alamat wajib) atau **Ambil ke rumah** (alamat ambil ditampilkan). **Tanpa ongkir** di sistem.
7. **Stok = satu angka per menu** (kuota yang sanggup dibuat dari bahan tersedia). Berkurang saat pesanan dibuat, kembali saat ditolak/dibatalkan. Tidak ada kuota per tanggal.
8. Spesifikasi API untuk laporan **didokumentasikan** sebagai pemetaan endpoint ↔ aksi store Pinia (tidak dibuat lapisan HTTP palsu di kode).

## Global Constraints

- Tidak ada nilai bisnis yang ditulis langsung di komponen: konstanta di `src/config/app.js`, nilai yang bisa diubah owner di store `settings`.
- Semua komponen pakai `<script setup>`; komponen baru ≤ ~150 baris (template+script).
- Semua aksi store mengembalikan `{ ok: true, ... }` atau `{ ok: false, errors }` / `{ ok: false, message }` (pola yang sudah ada).
- Tanggal disimpan sebagai `YYYY-MM-DD` waktu lokal lewat `toDateKey()`; **jangan pernah** pakai `toISOString().slice(0,10)` untuk tanggal (bergeser ke UTC sebelum jam 07:00 WIB).
- Teks antarmuka berbahasa Indonesia.
- Proyek **bukan repo git**: langkah "commit" diganti checkpoint `npx vitest run && npm run build` hijau. (Jika pengguna setuju `git init`, commit per task.)

## Review Focus

1. **Pesan tepat jam 20:00** → tetap boleh untuk besok, ditandai pesanan susulan, nomor antrean setelah pesanan yang masuk lebih dulu (test di Task 3 & 6).
2. **localStorage versi lama** (role `kasir`, pesanan POS tanpa `deliveryDate`) → data direset otomatis ke seed baru, aplikasi tidak crash (test di Task 1).
3. **Menyelesaikan pesanan yang belum lunas** → ditolak dengan pesan jelas, termasuk pesanan bayar-saat-diterima (test di Task 6).
4. **Jam pembukaan pagi WIB** (00:00–06:59) → `earliestDeliveryDate` tetap memakai tanggal lokal, bukan UTC (test di Task 3).
5. **Pengaturan tidak masuk akal** (jam selesai serah terima ≤ jam mulai, format jam salah, maxDaysAhead 0) → ditolak oleh `validateSettings` (test di Task 2).

---

### Task 1: Infrastruktur test + versi data + seed objek

**Files:**
- Modify: `package.json` (devDeps `vitest`, `happy-dom`; script `"test": "vitest run"`)
- Modify: `vite.config.js` (blok `test: { environment: 'happy-dom' }`)
- Modify: `src/services/storage.js`
- Modify: `src/config/app.js` (`APP_CONFIG.dataVersion: 2`)
- Modify: `src/main.js` (panggil `ensureDataVersion()` sebelum `app.use(pinia)`)
- Test: `tests/services/storage.test.js`

**Interfaces:**
- Produces:
  - `loadWithSeed(name, seed)` — sekarang menerima seed array **atau objek**; data tersimpan dipakai bila `Array.isArray(stored) === Array.isArray(seed)` dan `stored !== null`.
  - `ensureDataVersion(): boolean` — jika `bakoelbunda_data_version` ≠ `APP_CONFIG.dataVersion`, panggil `clearAppStorage()`, tulis versi baru, return `true`; selain itu `false`.

- [ ] **Step 1: Pasang Vitest** — `npm i -D vitest happy-dom`, tambah script dan blok `test`.
- [ ] **Step 2: Tulis test gagal** di `tests/services/storage.test.js`:
  - `loadWithSeed('settings', { a: 1 })` pada storage kosong → return `{ a: 1 }` dan `localStorage['bakoelbunda_settings']` berisi JSON itu.
  - Storage berisi `[1]` untuk kunci objek seed → diabaikan, return seed.
  - `ensureDataVersion()` dengan `bakoelbunda_orders` lama dan tanpa versi → return `true`, kunci `orders` terhapus, versi = `2`.
  - Panggilan kedua → `false`, data tidak dihapus.
- [ ] **Step 3:** `npx vitest run tests/services` → FAIL (`ensureDataVersion` tidak ada).
- [ ] **Step 4: Implementasi** di `storage.js` + panggil di `main.js`.
- [ ] **Step 5:** `npx vitest run && npm run build` → PASS.

---

### Task 2: Pengaturan Toko (seed, store, validasi, halaman admin)

**Files:**
- Create: `src/seed/settings.json`
- Create: `src/stores/settings.js`
- Modify: `src/utils/validators.js` (+ `validateSettings`)
- Modify: `src/config/app.js` (`VALIDATION_LIMITS.time: /^([01]\d|2[0-3]):[0-5]\d$/`, `maxDaysAhead: { min: 1, max: 30 }`, `bankAccountNo: /^\d{6,20}$/`); hapus `deliveryFeeNote`, `QUICK_CASH_AMOUNTS`
- Create: `src/components/features/settings/SettingsForm.vue`
- Create: `src/views/admin/SettingsView.vue`
- Test: `tests/utils/validateSettings.test.js`

**Interfaces:**
- Produces:
  - Bentuk data settings:
    ```json
    { "businessWhatsApp": "081234567890", "pickupAddress": "…", "orderCutoffTime": "20:00",
      "maxDaysAhead": 7, "handoverStart": "10:00", "handoverEnd": "17:00",
      "bankName": "BCA", "bankAccountNo": "1234567890", "bankAccountName": "Bunda" }
    ```
    (alamat, WA, rekening = **placeholder**, nanti diganti pemilik lewat halaman Pengaturan.)
  - `useSettingsStore()` → `{ data (ref objek), updateSettings(payload) → {ok}|{ok:false, errors} }`, dipersist dengan `loadWithSeed('settings', seed)` + `watch` deep + `subscribeStorage`.
  - `validateSettings(data) → errors` dengan kunci field di atas.
  - `SettingsForm.vue`: `v-model` objek settings, props `errors`, emits `submit`.

- [ ] **Step 1: Test gagal** — `validateSettings`: data seed valid → `{}`; `orderCutoffTime: '25:00'` → error; `handoverEnd: '09:00'` dengan start `10:00` → `errors.handoverEnd`; `maxDaysAhead: 0` → error; `bankAccountNo: '12ab'` → error; `pickupAddress: ''` → error.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3: Implementasi** validator, seed, store, form (pakai `BaseInput` type `time`/`number`, `BaseTextarea`), view (`PageHeader` + form + toast sukses).
- [ ] **Step 4:** `npx vitest run && npm run build` → PASS. (Route ditambah di Task 4.)

---

### Task 3: Aturan tanggal pre-order

**Files:**
- Create: `src/utils/orderDates.js`
- Test: `tests/utils/orderDates.test.js`

**Interfaces:**
- Consumes: `toDateKey`, `formatLongDate` dari `@/utils/format`.
- Produces:
  - `addDays(dateKey: string, days: number): string`
  - `isPastCutoff(now: Date, cutoffTime: string): boolean` — `true` bila `HH:MM` lokal `now` ≥ cutoff.
  - `earliestDeliveryDate(now: Date): string` — selalu `addDays(toDateKey(now), 1)`.
  - `latestDeliveryDate(now: Date, settings): string` — `addDays(toDateKey(now), settings.maxDaysAhead)`.
  - `isLateOrder(order, settings): boolean` — `true` bila `toDateKey(order.createdAt) === addDays(order.deliveryDate, -1)` **dan** `isPastCutoff(new Date(order.createdAt), settings.orderCutoffTime)`.
  - `deliveryDateError(dateKey: string, now: Date, settings): string | null` — pesan: kosong → `'Tanggal pesanan wajib dipilih.'`; < earliest → `` `Pesanan paling cepat untuk ${formatLongDate(earliest)}.` ``; > latest → `` `Pesanan paling lambat untuk ${formatLongDate(latest)}.` ``

- [ ] **Step 1: Test gagal** (pakai `settings = { orderCutoffTime: '20:00', maxDaysAhead: 7 }`):
  - `new Date(2026, 10, 12, 19, 59)` dan `new Date(2026, 10, 12, 23, 30)` → earliest keduanya `'2026-11-13'`
  - `new Date(2026, 10, 30, 10, 0)` → earliest `'2026-12-01'` (ganti bulan)
  - `new Date(2026, 10, 12, 3, 0)` → earliest `'2026-11-13'` (pagi, bukan UTC)
  - latest dari 12 Nov → `'2026-11-19'`; `maxDaysAhead: 1` → latest = earliest
  - `isPastCutoff` jam 19:59 → `false`, 20:00 → `true`
  - `isLateOrder`: dibuat 12 Nov 20:00 untuk 13 Nov → `true`; dibuat 12 Nov 19:59 untuk 13 Nov → `false`; dibuat 12 Nov 21:00 untuk 15 Nov → `false`
  - `deliveryDateError('2026-11-12', …)` → pesan "paling cepat"; `'2026-11-20'` → "paling lambat"; `''` → wajib dipilih; `'2026-11-13'` → `null`
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** Implementasi (hitung tanggal pakai `new Date(y, m-1, d + days)` agar aman zona waktu).
- [ ] **Step 4:** run → PASS.

---

### Task 4: Role Admin Pesanan, hapus POS, routing & navigasi

**Files:**
- Modify: `src/config/app.js` — `ROLES = { ADMIN: 'admin', ORDER_ADMIN: 'admin_pesanan', DAPUR: 'dapur' }`, `ROLE_OPTIONS` label `'Admin Pesanan'`, `ROLE_HOME[ORDER_ADMIN] = 'order-active'`, `ORDER_TRANSITIONS` ganti `KASIR` → `ORDER_ADMIN` (COMPLETED: `[ORDER_ADMIN]`); hapus `ORDER_SOURCE`.
- Modify: `src/seed/users.json` — `usr-002`: name `"Rina (Admin Pesanan)"`, username `pesanan`, password `pesanan123`, role `admin_pesanan`.
- Modify: `src/stores/users.js` — `cashiers` → `orderAdmins`.
- Modify: `src/router/index.js` — hapus `kasir-pos`; `kasir/pesanan` → path `pesanan/aktif` name `order-active`; `kasir/riwayat` → `pesanan/riwayat` name `order-history` (roles `[ORDER_ADMIN]`); tambah `admin/pengaturan` (`admin-settings`, SettingsView) dan `admin/pelanggan` (`admin-customers`, CustomersView dari Task 9).
- Modify: `src/config/navigation.js` — hapus POS; label `'Pesanan Aktif'`, `'Riwayat Pesanan'`, tambah `'Pelanggan'`, `'Pengaturan Toko'` (admin).
- Move: `src/views/kasir/` → `src/views/pesanan/` (ActiveOrdersView, HistoryView).
- Move: `src/components/features/pos/CartPanel.vue`, `CartItem.vue` → `src/components/features/cart/`.
- Delete: `src/views/kasir/PosView.vue`, `src/components/features/pos/CheckoutForm.vue`.
- Modify: `src/stores/cart.js` — hanya satu store `useCartStore` dengan storage key `'customer_cart'` (hapus factory & keranjang POS); perbarui import di `OrderOnlineView.vue`.
- Modify: `src/views/auth/LoginView.vue` — daftar akun demo (jika ada) ikut berubah.

**Interfaces:**
- Produces: route names `order-active`, `order-history`, `admin-settings`, `admin-customers`; `ROLES.ORDER_ADMIN`; `useCartStore` (keranjang pembeli).

- [ ] **Step 1:** Lakukan perubahan di atas; `grep -rn "KASIR\|kasir-pos\|ORDER_SOURCE\|useCustomerCartStore\|features/pos" src` harus kosong.
- [ ] **Step 2:** `npm run build` → PASS (CustomersView boleh berupa view sementara sampai Task 9, atau tambahkan route-nya di Task 9).
- [ ] **Step 3: Cek manual** — login `pesanan`/`pesanan123` → masuk `/pesanan/aktif`; buka `/admin/menu` → 403; login `kasir` → "Username atau kata sandi salah".

---

### Task 5: Store Pelanggan

**Files:**
- Create: `src/seed/customers.json` (3–4 pelanggan, id `cus-001`…, cocok dengan seed pesanan Task 6)
- Create: `src/stores/customers.js`
- Test: `tests/stores/customers.test.js`

**Interfaces:**
- Produces: `useCustomersStore()` → `{ items, getById(id), upsertCustomer({ name, phone }) → customer }`.
  - Entitas: `{ id, name, phone, createdAt, updatedAt }`; `phone` dinormalisasi (hapus spasi/strip).
  - `upsertCustomer` mencari berdasarkan `phone`; jika ada → perbarui `name` & `updatedAt`; jika tidak → buat baru (`generateId('cus')`).

- [ ] **Step 1: Test gagal** (pakai `setActivePinia(createPinia())`, `localStorage.clear()` di `beforeEach`): upsert nomor baru → `items` +1; upsert `'0812-3456-7890'` lalu `'081234567890'` → tetap satu pelanggan, nama terbaru.
- [ ] **Step 2:** run → FAIL. **Step 3:** implementasi. **Step 4:** run → PASS.

---

### Task 6: Model pesanan pre-order (store + seed)

**Files:**
- Modify: `src/config/app.js` — `PAYMENT_METHOD = { PREPAID: 'transfer', ON_DELIVERY: 'cod' }`, `PAYMENT_METHOD_OPTIONS` label `'Bayar di muka (transfer/QRIS)'` dan `'Bayar saat diterima'`; `PAYMENT_STATUS = { UNPAID: 'belum_bayar', PAID: 'lunas' }` + `PAYMENT_STATUS_OPTIONS` (variant `danger` / `success`); `ORDER_TYPE_OPTIONS` label pickup → `'Ambil ke rumah'`.
- Modify: `src/utils/validators.js` — `validateCheckout(data, productsById, { now, settings })`: hapus opsi `online` & cek uang tunai; WhatsApp selalu wajib; tambah `errors.deliveryDate = deliveryDateError(...)`.
- Modify: `src/stores/orders.js`
- Rewrite: `src/seed/orders.json`
- Test: `tests/stores/orders.test.js`, update/tambah `tests/utils/validateCheckout.test.js`

**Interfaces:**
- Consumes: `useSettingsStore().data`, `useCustomersStore().upsertCustomer`, `deliveryDateError`.
- Produces:
  - Bentuk pesanan:
    `{ id, invoiceNo, queueNo, customerId, customerName, customerPhone, orderType, address, deliveryDate, note, paymentMethod, paymentStatus, paidAt, items[{productId,name,price,qty,subtotal}], total, status, handledById, handledByName, createdAt, confirmedAt, readyAt, completedAt, cancelledAt }`
    (`customerName/Phone` = snapshot saat memesan; `queueNo` = urutan per `deliveryDate`; `invoiceNo` tetap per tanggal dibuat.)
  - `createOrder(payload, now = new Date())` — payload `{ lines, customerName, customerPhone, orderType, address, deliveryDate, note, paymentMethod }`; status `menunggu`, `paymentStatus: 'belum_bayar'`; potong stok.
  - `updateStatus(id, next, role, actor)` — seperti sekarang; `handledById/Name` diisi saat dikonfirmasi; ke `selesai` ditolak bila belum lunas: `'Pesanan belum lunas. Tandai lunas terlebih dahulu.'`
  - `markPaid(id, role) → { ok, message }` — role `ORDER_ADMIN`/`ADMIN`; tolak jika dibatalkan atau sudah lunas; isi `paidAt`.
  - Getter: `pendingOrders`, `kitchenQueue`, `readyOrders` diurutkan `deliveryDate` lalu `createdAt`; `ordersForDate(dateKey)`; `unpaidActiveOrders`.
  - `filterOrders({ from, to, status, paymentMethod, paymentStatus, orderType, search })` — `from/to` berdasarkan **`deliveryDate`**.
  - Export `summarizeProduction(orders, productsById) → [{ deliveryDate, items: [{ productId, name, portions, pcs }] }]`, urut tanggal; `pcs = portions × product.portionPcs`.
  - Hapus `ordersByCashier`, `normalizeOrder` legacy (sudah ditangani `ensureDataVersion`).
  - Seed: ~10 pesanan bervariasi (status, metode bayar, lunas/belum, ambil/antar) dengan `deliveryDate` 2026-11-10 s/d 2026-11-15, semua `customerId` ada di `customers.json`.

- [ ] **Step 1: Test gagal** (now = `new Date(2026, 10, 12, 10, 0)`, pinia baru, storage kosong):
  - createOrder valid untuk `'2026-11-13'` → ok, status `menunggu`, `paymentStatus` `belum_bayar`, stok produk berkurang, pelanggan dibuat.
  - deliveryDate `'2026-11-12'` → `errors.deliveryDate`.
  - orderType antar tanpa alamat → `errors.address`; qty > stok → `errors.cart`.
  - dua pesanan untuk tanggal sama → `queueNo` 1 dan 2; pesanan tanggal lain → `queueNo` 1.
  - pesanan dibuat 12 Nov 21:00 untuk `'2026-11-13'` → ok (tidak ditolak), `queueNo` setelah pesanan 13 Nov yang dibuat lebih awal.
  - alur menunggu → diproses → siap → selesai **tanpa** markPaid → selesai ditolak; setelah `markPaid` → ok.
  - tolak pesanan menunggu → stok kembali.
  - `markPaid` oleh role `dapur` → `ok:false`.
  - `summarizeProduction` dua pesanan berisi produk sama di tanggal sama → `portions` dijumlah, `pcs` benar.
- [ ] **Step 2:** run → FAIL. **Step 3:** implementasi. **Step 4:** `npx vitest run && npm run build` → PASS.

---

### Task 7: Halaman pembeli (pesan + status)

**Files:**
- Modify: `src/components/features/customer/CustomerCheckoutForm.vue` — tambah `BaseInput type="date"` (`min`/`max` dari props `minDate`/`maxDate`, error `errors.deliveryDate`); info jam serah terima (`settings.handoverStart–handoverEnd`); jika ambil → tampilkan `settings.pickupAddress`; opsi bayar baru; hapus catatan ongkir.
- Modify: `src/views/customer/OrderOnlineView.vue` — field `deliveryDate` default = earliest; hitung `minDate/maxDate` dari `orderDates` + settings; bila `isPastCutoff(now)` tampilkan info `` `Pesanan setelah pukul ${settings.orderCutoffTime} tetap dikirim besok, sesuai urutan antrean.` ``
- Split: `src/views/customer/OrderStatusView.vue` → create `src/components/features/customer/OrderProgress.vue` (props `order`; langkah status), `OrderReceipt.vue` (props `order`; rincian + tanggal terima + status bayar), `PaymentInstructions.vue` (props `order`, `settings`; tampil hanya bila `transfer` & `belum_bayar`: bank, no rek, a.n., total, tombol WA ke `settings.businessWhatsApp` via `toWhatsAppLink`).
- Modify: `src/composables/useCustomerOrders.js` (tidak berubah kecuali import).

**Interfaces:**
- Consumes: `earliestDeliveryDate`, `latestDeliveryDate`, `useSettingsStore`, `PAYMENT_STATUS_OPTIONS`, `useCartStore`.
- Produces: `OrderStatusView.vue` ≤ ~120 baris.

- [ ] **Step 1:** Implementasi.
- [ ] **Step 2:** `npm run build` → PASS.
- [ ] **Step 3: Cek manual** — `/pesan`: date picker tidak bisa pilih hari ini; pilih "Ambil ke rumah" → alamat ambil muncul; kirim pesanan transfer → halaman status menampilkan instruksi rekening; reload → tetap.

---

### Task 8: Halaman Admin Pesanan

**Files:**
- Create: `src/components/features/orders/PaymentStatusBadge.vue` (props `status`; pakai `BaseBadge` + `PAYMENT_STATUS_OPTIONS`)
- Create: `src/components/features/orders/OrderContact.vue` (props `order`; WA link + alamat — dipindah dari OrderCard)
- Modify: `src/components/features/orders/OrderCard.vue` — tampilkan tanggal terima (`formatLongDate`), metode bayar + `PaymentStatusBadge`; ganti peringatan lama-tunggu dengan sorotan bila `deliveryDate === today` (prop `today: String`, hapus prop `now` dan `KITCHEN_WAIT_WARNING_MINUTES`); prop baru `canMarkPaid: Boolean`, emit baru `mark-paid(order)` (tombol "Tandai lunas" bila belum lunas); badge **"Pesanan susulan"** bila `isLateOrder(order, settings)` (dipakai juga di antrean Dapur Task 9).
- Modify: `src/views/pesanan/ActiveOrdersView.vue` — kolom: *Pesanan Baru* (Terima/Tolak), *Diproses Dapur* (Batalkan), *Siap Diserahkan* (Tandai diserahkan); `can-mark-paid` di semua kolom; panggil `orders.markPaid`.
- Modify: `src/views/pesanan/HistoryView.vue` — judul "Riwayat Pesanan", sumber `orders.sorted` (bukan per kasir), pencarian tetap.
- Modify: `src/components/features/orders/OrderTable.vue` — hapus kolom/prop Kasir; tambah kolom "Tanggal terima" dan status bayar.
- Modify: `src/components/features/orders/OrderDetail.vue` — hapus "Asal"/"Kasir"; tambah tanggal terima, status bayar, "Ditangani oleh".

- [ ] **Step 1:** Implementasi. **Step 2:** `npm run build` → PASS.
- [ ] **Step 3: Cek manual** — tab A pembeli kirim pesanan COD, tab B Admin Pesanan: Terima → (dapur siap) → "Tandai diserahkan" ditolak dengan toast belum lunas → "Tandai lunas" → diserahkan berhasil.

---

### Task 9: Dapur, Dashboard, Laporan, Pelanggan

**Files:**
- Create: `src/components/features/kitchen/ProductionSummary.vue` (props `groups` dari `summarizeProduction`; tabel per tanggal: menu, porsi, pcs)
- Modify: `src/views/dapur/KitchenQueueView.vue` — atas: `ProductionSummary` untuk pesanan `diproses`; bawah: antrean dikelompokkan per `deliveryDate` dengan heading `formatLongDate`; label bagian siap → "Menunggu diserahkan Admin Pesanan".
- Modify: `src/components/features/orders/OrderFilter.vue` — ganti filter kasir dengan `paymentMethod`, `paymentStatus`, `orderType`; label tanggal "Tanggal terima dari/sampai".
- Modify: `src/views/admin/ReportsView.vue` — filter baru; hapus `users`.
- Modify: `src/views/admin/AdminDashboardView.vue` — StatCard: "Omzet Hari Ini" (pesanan `deliveryDate` hari ini), "Pesanan Besok", "Belum Lunas" (`unpaidActiveOrders`), "Stok Menipis".
- Create: `src/components/features/customers/CustomerTable.vue` (props `rows`: `{ name, phone, orderCount, totalSpent, lastOrderAt }`)
- Create: `src/views/admin/CustomersView.vue` (hitung statistik dari `orders.items` per `customerId`; pencarian nama/WA)
- Modify: `src/router/index.js`, `src/config/navigation.js` jika belum di Task 4.

- [ ] **Step 1:** Implementasi. **Step 2:** `npx vitest run && npm run build` → PASS.
- [ ] **Step 3: Cek manual** — dapur melihat rekap "13 Nov: 4 porsi (20 pcs) Dimsum Ayam Saus Biasa"; laporan filter "Belum bayar" hanya menampilkan pesanan belum lunas; halaman Pelanggan menampilkan jumlah pesanan.

---

### Task 10: Dokumentasi (README + bahan laporan Bab 2 & 5)

**Files:**
- Modify: `README.md` — akun demo (`pesanan`/`pesanan123`), tabel kendala→fitur (pre-order, batas jam, status bayar, rekap produksi), alur pesanan baru, hak akses per role, kunci localStorage baru (`settings`, `customers`, `data_version`), daftar validasi baru, `npm test`.
- Create: `docs/perancangan.md` untuk bahan laporan:
  - 2.1 Component tree (Mermaid) + tabel komponen reusable (props/emits).
  - 2.2 Tabel Halaman–Role–Fitur–Endpoint–Method dan detail tiap endpoint (request, 201, 400) — 400 memakai pesan dari validator nyata. Endpoint minimal: `POST/GET /api/v1/orders`, `PATCH /api/v1/orders/:id/status`, `PATCH /api/v1/orders/:id/payment`, `GET/POST/PUT/DELETE /api/v1/products`, `GET/POST/PUT/DELETE /api/v1/users`, `GET /api/v1/customers`, `GET/PUT /api/v1/settings`, `POST /api/v1/auth/login`, `GET /api/v1/reports/sales`, `GET /api/v1/kitchen/production`. Kolom tambahan: aksi store yang mengimplementasikan.
  - 2.3 ERD (Mermaid `erDiagram`): `users`, `customers`, `products`, `orders`, `order_items`, `settings`, dengan PK/FK/tipe dan kardinalitas (`customers 1–N orders`, `orders 1–N order_items`, `products 1–N order_items`, `users 1–N orders` via `handled_by`).
  - 2.4 Style guide diambil dari `src/assets/styles/variables.css` (HEX & tipografi aktual).
  - 5.1 Tabel QA (≥3 skenario per fitur: valid, kosong/salah, batas) — termasuk semua kasus di Review Focus.

- [ ] **Step 1:** Tulis dokumen. **Step 2:** Cek setiap nama route/store/field di dokumen ada di kode (`grep`).
- [ ] **Step 3: Verifikasi akhir** — `npx vitest run && npm run build` hijau; jalankan `npm run dev`, ulangi cek manual Task 4, 7, 8, 9 dan klik "Reset Data Demo".
