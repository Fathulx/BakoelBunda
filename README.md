# SIM Bakoel Bunda

Sistem Informasi Manajemen Bakoel Bunda Berbasis Komponen. Aplikasi ini dibuat untuk UMKM dimsum ayam rumahan **tanpa toko** yang berjualan dengan sistem **pre-order (PO)**: pelanggan memesan lewat web, dimsum dibuat setelah dipesan, lalu diantar kurir atau diambil ke rumah. Dibangun dengan Vue.js 3 (`<script setup>`), Vue Router, Pinia, data seed JSON, dan `localStorage`.

## Menjalankan Proyek

Syarat: Node.js 18 atau lebih baru.

```bash
npm install
npm run dev     # jalankan aplikasi (biasanya http://localhost:5173)
npm test        # jalankan unit test dan smoke test (Vitest)
npm run build   # build produksi
```

## Akun Login

Ada tiga role staf: **Owner**, **Admin**, dan **Dapur**. Pembeli tidak perlu login, cukup membuka `/pesan`. Username dan kata sandi akun bawaan **tidak ditampilkan di halaman login**. Daftarnya disimpan di file terpisah `AKUN_LOGIN.md` yang **tidak disertakan di repository** ini (ada di `.gitignore`). Minta file tersebut ke pemilik proyek.

Tips demo: buka tiga tab browser, yaitu halaman `/pesan` sebagai pembeli, login sebagai Admin di tab kedua, dan login sebagai Dapur di tab ketiga. Pesanan baru dan perubahan status langsung muncul di tab lain tanpa reload.

## Kendala dan Fitur Solusi

| Kendala Pemilik Usaha | Fitur |
|---|---|
| Tidak punya toko, pesanan masuk lewat chat WA dan sering terselip | Halaman pemesanan `/pesan` tanpa login: pilih menu, tanggal, cara terima, metode bayar, lalu pantau status pesanan |
| Dimsum dibuat setelah dipesan, bahan belum tentu tersedia hari itu | Sistem PO: tanggal terima paling cepat **besok**, paling lambat sesuai pengaturan (bawaan 7 hari) |
| Usaha rumahan tidak bisa melayani 24 jam | Jam batas pesanan (bawaan 20:00). Pesanan yang lewat jam batas tetap untuk besok sesuai antrean, dan diberi tanda **Pesanan susulan** |
| Pembayaran ada yang transfer di muka, ada yang bayar saat terima | Metode bayar *Bayar di muka (transfer bank)* atau *Bayar saat diterima*, status **Belum bayar / Lunas**, instruksi rekening untuk pembeli |
| Dapur bingung berapa yang harus dibuat | **Rekap produksi** per tanggal (porsi dan pcs per menu) dan antrean dikelompokkan per tanggal |
| Stok bahan terbatas | Stok per menu = kuota yang sanggup dibuat. Berkurang otomatis saat dipesan, kembali saat ditolak/dibatalkan, ada peringatan stok menipis |
| Omzet susah direkap | Dashboard omzet harian dan laporan dengan filter tanggal terima, status, status bayar, metode bayar, dan cara terima |
| Data pelanggan tercecer | Data pelanggan tercatat otomatis dari nomor WhatsApp |

## Alur Pesanan

1. Pembeli membuka `/pesan` (alamat `/` juga mengarah ke sini), memilih menu, tanggal terima, cara terima (diantar kurir / ambil ke rumah), dan metode bayar, lalu menekan **Kirim pesanan**. Stok langsung dipesan.
2. Pembeli diarahkan ke halaman status `/pesan/<id>`. Jika memilih bayar di muka, nomor rekening dan tombol kirim bukti via WhatsApp ditampilkan.
3. Admin melihat pesanan di **Pesanan Aktif**, kolom *Pesanan Baru*, lalu menekan **Terima** (masuk antrean dapur) atau **Tolak** (stok dikembalikan). Setelah transfer dicek, tekan **Tandai lunas**.
4. Dapur melihat rekap produksi, membuat dimsum sesuai tanggal, lalu menekan **Tandai siap**.
5. Admin menekan **Tandai diserahkan** saat pesanan diambil atau dibawa kurir. Pesanan yang **belum lunas tidak bisa diserahkan**. Untuk bayar saat diterima, tandai lunas dulu saat uang diterima.
6. Halaman status pembeli ikut berubah otomatis.

Status pesanan: `menunggu` → `diproses` → `siap` → `selesai`, atau `dibatalkan`.

Catatan: data masih disimpan di `localStorage`, jadi pesanan hanya terlihat oleh pengguna di browser yang sama. Untuk dipakai pembeli sungguhan perlu backend/database bersama.

## Hak Akses per Role

| Halaman | Owner | Admin | Dapur | Pembeli |
|---|:-:|:-:|:-:|:-:|
| Pemesanan & Status Pesanan (`/pesan`) | ✓ | ✓ | ✓ | ✓ |
| Dashboard | ✓ | | | |
| Kelola Menu | ✓ | | | |
| Kelola Pengguna | ✓ | | | |
| Laporan Penjualan | ✓ | | | |
| Data Pelanggan | ✓ | | | |
| Pengaturan Toko | ✓ | | | |
| Pesanan Aktif | | ✓ | | |
| Riwayat Pesanan | | ✓ | | |
| Antrean Dapur | | | ✓ | |
| Katalog Menu | ✓ | ✓ | ✓ | |

Jika role yang tidak berhak membuka URL halaman lain (misalnya Admin membuka `/owner/menu`), Vue Router menolak akses dan mengarahkan ke halaman **403**.

## Pengaturan Toko

Nilai yang bisa berubah tidak ditulis di kode, tetapi disimpan sebagai data **Pengaturan Toko** (seed `src/seed/settings.json`, diubah Owner di menu *Pengaturan Toko*):

| Pengaturan | Nilai awal |
|---|---|
| Jam batas pesanan | 20:00 |
| Bisa pesan sampai | 7 hari ke depan |
| Jam antar / ambil | 10:00–17:00 |
| Alamat pengambilan, WhatsApp usaha, rekening | contoh, **ganti dengan data asli** |

## Struktur Folder

```
src/
├── assets/styles/        # variables.css (style guide) dan base.css
├── components/
│   ├── common/           # komponen reusable: BaseButton, BaseInput, BaseTable, BaseModal, QtyStepper, AppIcon, dll.
│   ├── layout/           # AppLayout, AppSidebar, AppHeader, CustomerLayout
│   └── features/         # komponen per fitur
│       ├── cart/         # CartPanel, CartItem
│       ├── customer/     # CustomerCheckoutForm, OrderProgress, OrderReceipt, PaymentInstructions
│       ├── customers/    # CustomerTable, CustomerDetail, CustomerOrderItem
│       ├── dashboard/    # TopProductList, LowStockList
│       ├── kitchen/      # ProductionSummary
│       ├── orders/       # OrderCard, OrderContact, OrderTable, OrderDetail, OrderFilter, badge status
│       ├── products/     # ProductTable, ProductForm, MenuCard, StockIndicator
│       ├── settings/     # SettingsForm
│       └── users/        # UserTable, UserForm
├── composables/          # useCustomerOrders, useCustomerProfile, useFormModal, useNow
├── config/               # app.js (konstanta, role, status, batas validasi), navigation.js (menu sidebar)
├── router/               # definisi route + guard role
├── seed/                 # data awal JSON: users, products, customers, orders, settings
├── services/             # storage.js (akses localStorage + versi data)
├── stores/               # Pinia: auth, users, products, customers, orders, cart, settings, toast
├── utils/                # format, validators, orderDates (aturan tanggal PO), seedDates, id
└── views/                # halaman per role: auth, owner, admin, dapur, customer, shared
tests/                    # Vitest: services, utils, stores, components, smoke test semua halaman
docs/perancangan.md       # bahan laporan Bab 1, 2, 3.2, 5: analisis, component tree, API, ERD, style guide, seed, skenario uji
docs/log-agentic-ai.md    # bahan laporan Bab 4: urutan prompt Agentic AI
```

## Alur Data Seed dan localStorage

1. Saat aplikasi dibuka, `ensureDataVersion()` (`src/services/storage.js`) membandingkan `bakoelbunda_data_version` dengan `APP_CONFIG.dataVersion`. Jika berbeda (struktur data berubah), semua data lama dihapus agar dimuat ulang dari seed.
2. Saat store Pinia pertama kali dipakai, store memanggil `loadWithSeed(key, seed)`.
3. Jika `localStorage` sudah punya data dengan bentuk yang sama (array untuk koleksi, objek untuk pengaturan), data itu yang dipakai.
4. Jika masih kosong, isi file JSON di `src/seed/` disalin lalu langsung disimpan ke `localStorage`. Khusus pesanan dan pelanggan, tanggal di seed (acuan `APP_CONFIG.seedReferenceDate` = 12 Nov 2026) digeser dulu ke hari ini (`src/utils/seedDates.js`), supaya kapan pun aplikasi didemokan selalu ada pesanan untuk hari ini dan besok.
5. Setiap store memakai `watch(..., { deep: true })`, jadi semua aksi tambah, ubah, hapus, dan perubahan status otomatis tersimpan kembali ke `localStorage`. Perubahan dari tab lain diterima lewat event `storage`, termasuk sesi login (keluar di satu tab = keluar di semua tab) dan keranjang pembeli. Halaman yang memakai tanggal (dashboard, pemesanan, antrean) ikut berganti hari sendiri setelah tengah malam.
6. Tombol **Reset Data Demo** di Dashboard Owner menghapus semua kunci `bakoelbunda_*`, lalu data dimuat ulang dari seed.

Kunci `localStorage`: `bakoelbunda_users`, `bakoelbunda_products`, `bakoelbunda_customers`, `bakoelbunda_orders`, `bakoelbunda_settings`, `bakoelbunda_customer_cart`, `bakoelbunda_customer_order_ids`, `bakoelbunda_customer_profile`, `bakoelbunda_session`, `bakoelbunda_data_version`.

## Validasi (Bahan Skenario Uji Negatif)

- Login: field kosong, kata sandi salah, akun nonaktif
- Menu: nama kosong atau dobel, harga 0 atau negatif, stok bukan bilangan bulat atau negatif
- Pengguna: username dobel atau format salah, kata sandi kurang dari 6 karakter, tidak bisa menghapus/menonaktifkan diri sendiri atau owner terakhir
- Pemesanan: keranjang kosong, nama kosong, WhatsApp kosong/salah format, jumlah melebihi stok, tanggal kosong/hari ini/lewat batas hari, diantar tanpa alamat, metode bayar tidak dipilih
- Status pesanan: hanya Dapur yang bisa menandai Siap, hanya Admin yang bisa menandai Selesai, pesanan **belum lunas tidak bisa diselesaikan**, penolakan/pembatalan mengembalikan stok
- Pembayaran: hanya Owner/Admin yang bisa menandai lunas, pesanan batal atau sudah lunas ditolak
- Pengaturan Toko: format jam salah, jam selesai serah terima tidak setelah jam mulai, batas hari di luar 1–30, nomor rekening bukan angka, alamat ambil/WA kosong

Semua aturan di atas juga diuji otomatis di folder `tests/` (`npm test`).
