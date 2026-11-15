# Log Penggunaan Agentic AI (Bahan Bab 4)

Disusun berurutan dari riwayat sesi pengerjaan. Untuk tiap iterasi, tempelkan **tangkapan layar utuh** yang memperlihatkan teks prompt dan hasil eksekusi AI di bagian *Tangkapan Layar*. Prompt yang hanya berupa tes koneksi ("test", "halo") tidak dimasukkan.

- **Alat Agentic AI:** Claude Code (ekstensi VS Code), model Claude Opus
- **Cara kerja:** AI membaca seluruh proyek, berdiskusi dulu sebelum menulis kode, lalu mengubah file, menjalankan `npm test` dan `npm run build`, dan melaporkan hasilnya.

> **Catatan:** versi awal proyek (masih berkonsep kasir/POS) dibuat sebelum sesi-sesi di bawah. Jika masih ada tangkapan layar prompt pembuatan awal, masukkan sebagai **Prompt ke-0** di urutan paling atas.

---

### Prompt ke-1. Menjalankan aplikasi
- **Tanggal:** 11 Nov 2026
- **Prompt:** "run web tolong"
- **Tujuan Perintah:** Menjalankan aplikasi versi awal di browser untuk dilihat.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI menjalankan `npm run dev` dan memberi alamat `http://localhost:5173`. Berfungsi langsung.

### Prompt ke-2. Mempertanyakan cara pelanggan memesan
- **Tanggal:** 11 Nov 2026
- **Prompt:** "jadi untuk user bagaimana memesannya? karena sistem ini hanya untuk online tidak terdapat tempat untuk makan di tempat"
- **Tujuan Perintah:** Mengoreksi asumsi awal sistem (kasir di toko) yang tidak cocok dengan usaha tanpa toko.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI menjelaskan alur yang ada. Mahasiswa menilai konsep kasir tidak sesuai dengan kondisi usaha, sehingga dibahas ulang di sesi berikutnya.

### Prompt ke-3. Diskusi konsep: kasir vs pemesanan online
- **Tanggal:** 12 Nov 2026
- **Prompt:** "coba kita diskusi terlebih dahulu, jangan mengoding ya. saya ingin menanyakan mengenai fitur kasir mengapa dia dapat memesan punya pelanggan? bukannya pelanggan pesannya via online" dan dilanjutkan "masalahnya di sini untuk umkm ini memang tidak mempunyai toko, jadi pelanggan harus memesan terlebih dahulu baru dibuatkan dimsumnya"
- **Tujuan Perintah:** Menyesuaikan konsep sistem dengan proses bisnis nyata Bakoel Bunda (tanpa toko, pre-order).
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI tidak menulis kode. AI mengajukan pertanyaan tentang aturan PO, pembayaran, pengantaran, dan stok. Keputusan bisnis tetap diambil mahasiswa berdasarkan hasil observasi.

### Prompt ke-4. Menjawab aturan bisnis hasil observasi
- **Tanggal:** 12 Nov 2026
- **Prompt:** "iya ini merupakan proyek UTS PBK … 1. pelanggan biasanya paling lama H-1, jadi seperti sistem PO karena belum tentu bahan tersedia 2. Pembayaran dapat di muka atau saat dimsum diterima 3. Pesanan biasanya masih sering via WA tapi saya ingin mengarahkan semuanya melalui web …"
- **Tujuan Perintah:** Memberikan aturan bisnis nyata sebagai dasar rancangan ulang.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI merangkum menjadi rancangan: halaman pesan tanpa login, PO minimal H-1, dua metode bayar, kurir/ambil sendiri, stok per menu.

### Prompt ke-5. Batas jam, nama role, dan ketentuan UTS
- **Tanggal:** 12 Nov 2026
- **Prompt:** "1. boleh diberikan batas juga dikarenakan tidak memungkinkan jualan rumahan 24 jam 2. Admin Pesanan boleh deh 3. … saya akan melampirkan file md mengenai ketentuan UTS nya", lalu melampirkan `rubrik_dan_template_laporan_uts.md`
- **Tujuan Perintah:** Menambah jam batas pesanan, mengganti role Kasir, dan memberi AI rubrik UTS sebagai acuan.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI memetakan rancangan ke aspek A1–A5 rubrik. Mahasiswa memastikan rancangan mengikuti template laporan.

### Prompt ke-6. Ongkir dan aturan pesanan lewat jam batas
- **Tanggal:** 12 Nov 2026
- **Prompt:** "1. udah cocok 2. ongkir kurir tidak ada 3. buatkan saja mana yang simpel nanti saya lihat …" dan "3. untuk aturan tanggal PO yaitu ketika pelanggan memesan lewat jam 20.00 pesanan tetap diantar besok tetapi sesuai antrian"
- **Tujuan Perintah:** Menetapkan aturan akhir: tanpa ongkir, pesanan setelah 20.00 tetap untuk besok tetapi antre di belakang.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI awalnya mengusulkan pesanan setelah jam batas digeser ke lusa. Mahasiswa mengoreksi sesuai kebiasaan usaha, sehingga aturan menjadi "tetap besok, label Pesanan susulan".

### Prompt ke-7. Implementasi rancangan PO dan font Poppins
- **Tanggal:** 12 Nov 2026
- **Prompt:** "langsung saja di sesi ini biar tidak ribet dan saya ingin semua font nya diubah menjadi poppins"
- **Tujuan Perintah:** Mengubah sistem kasir menjadi sistem pre-order: halaman `/pesan`, status pesanan, Pesanan Aktif, Antrean Dapur, Pengaturan Toko, aturan tanggal PO, status bayar, seed JSON baru.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Sebagian besar langsung berfungsi dan lulus test otomatis. Beberapa hal masih diperbaiki di prompt berikutnya (navbar HP, detail pelanggan).

### Prompt ke-8. Navbar berantakan di HP
- **Tanggal:** 12 Nov 2026
- **Prompt:** "ini kok berantakan navbar nya ketika menggunakan mobile" (disertai tangkapan layar)
- **Tujuan Perintah:** Memperbaiki header yang meluber pada layar HP.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI menyingkat tanggal, menyembunyikan nama pengguna di layar kecil, dan memotong teks panjang. Dicek ulang manual di mode HP.

### Prompt ke-9. Detail pesanan per pelanggan
- **Tanggal:** 12 Nov 2026
- **Prompt:** "untuk data pelanggan ni bisakah berikan detail yang dia pesan apa saja?"
- **Tujuan Perintah:** Menambah modal Detail pelanggan: riwayat pesanan, isi menu, dan menu yang sering dipesan.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Komponen `CustomerDetail` dan `CustomerOrderItem` dibuat. Tombol Detail ternyata belum bereaksi (lihat prompt berikutnya).

### Prompt ke-10. Tombol Detail tidak bereaksi
- **Tanggal:** 12 Nov 2026
- **Prompt:** "kenapa ketika diklik button detail tidak bereaksi apa apa ya?"
- **Tujuan Perintah:** Mencari penyebab bug.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Penyebabnya hot reload: store Pinia lama belum punya fungsi `ordersByCustomer`. Solusinya refresh halaman, dan AI menambahkan `acceptHMRUpdate` di semua store supaya tidak terulang. Ditambah test otomatis untuk tombol Detail.

### Prompt ke-11. Review menyeluruh dan nama role
- **Tanggal:** 12 Nov 2026
- **Prompt:** "coba dilihat menurut kamu apakah sudah sesuai semuanya? oiya menurut saya untuk owner menggunakan role "owner" saja … dan admin pesanan ni diubah menjadi "admin""
- **Tujuan Perintah:** Menyederhanakan nama role menjadi `owner`, `admin`, `dapur`.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Role, route, navigasi, seed, dan dokumen diganti. Versi data dinaikkan supaya localStorage lama otomatis direset.

### Prompt ke-12. Memisahkan akun login dari halaman login
- **Tanggal:** 12 Nov 2026
- **Prompt:** "bisakah untuk data role username beserta password berikan file md saja? jadi ketika web dideploy user tidak dapat login juga"
- **Tujuan Perintah:** Menghapus daftar akun demo dari halaman login dan memindahkannya ke `AKUN_LOGIN.md`.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** File dibuat dan dimasukkan ke `.gitignore`. AI juga mengingatkan bahwa kata sandi seed masih ada di bundle JavaScript karena belum ada backend.

### Prompt ke-13. Pemeriksaan logika
- **Tanggal:** 12 Nov 2026
- **Prompt:** "… coba kamu periksa dengan logika kamu apakah ada yang miss atau tidak"
- **Tujuan Perintah:** Mencari celah logika bisnis.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Ditemukan dan diperbaiki, antara lain: pesanan belum lunas tidak boleh diserahkan, menu di pesanan aktif tidak boleh dihapus, owner terakhir tidak boleh dihapus, nomor `+62` dinormalkan, dan tanggal seed digeser ke hari ini.

### Prompt ke-14. Semua data real time
- **Tanggal:** 12 Nov 2026
- **Prompt:** "tetapi isinya semua real time kan?" lalu "boleh deh supaya semuanya terasa real time"
- **Tujuan Perintah:** Sinkron antar-tab (pembeli, Admin, Dapur) dan pergantian hari otomatis.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Ditambah `subscribeStorage` (event `storage`) di semua store dan composable `useNow`. Bug "Ringkasan hari ini, -" di dashboard ditemukan dan diperbaiki, dan test diperketat.

### Prompt ke-15. Tampilan Data Pelanggan memanjang
- **Tanggal:** 12 Nov 2026
- **Prompt:** "coba liat di bagian pelanggan ini, mengapa ketika berbasis web malah di samping memanjang begitu" (disertai tangkapan layar)
- **Tujuan Perintah:** Memperbaiki tata letak halaman pelanggan di layar lebar.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Tata letak diperbaiki dan dicek ulang di browser.

### Prompt ke-16. Menghapus QRIS
- **Tanggal:** 12 Nov 2026
- **Prompt:** "payment nya transfer saja tidak perlu ada qris"
- **Tujuan Perintah:** Menyesuaikan metode bayar dengan usaha (transfer bank saja).
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Opsi QRIS dihapus dari config, seed, dan tampilan.

### Prompt ke-17. Push ke GitHub
- **Tanggal:** 12 Nov 2026
- **Prompt:** "okee saya rasa semuanya sudah, bisakah tolong push ke github?" lalu memberikan alamat repository
- **Tujuan Perintah:** Mengunggah proyek ke `github.com/Fathulx/BakoelBunda`.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI menanyakan dulu apakah `AKUN_LOGIN.md` ikut diunggah. Mahasiswa memilih tidak. Commit dan push dijalankan AI; login GitHub dilakukan mahasiswa sendiri.

### Prompt ke-18. Judul sidebar terpotong
- **Tanggal:** 15 Nov 2026
- **Prompt:** "boy ini side bar pada judul bakoel bunda nya serasa ilang" dan "\"dimsum ayam rumah....\" kok kepotong gitu"
- **Tujuan Perintah:** Memperbaiki judul dan tagline di sidebar.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Perbaikan pertama masih memotong tagline dengan "…". Mahasiswa meminta lagi, lalu tagline dibuat boleh turun baris.

### Prompt ke-19. Review UI/UX
- **Tanggal:** 15 Nov 2026
- **Prompt:** "coba lihat pada ui nya, apakah semuanya sudah sesuai mengenai modern, simpel dan tidak ribet mengenai experience user dan warna enak dilihat oleh mata" lalu "boleh"
- **Tujuan Perintah:** Audit tampilan dan menerapkan perbaikan nomor 1–4.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Kontras warna dicek dengan standar WCAG dan beberapa warna digelapkan. Ikon ditambahkan di sidebar, form pemesanan dirapikan, dan data pembeli terakhir diisi otomatis.

### Prompt ke-20. Kartu pesanan
- **Tanggal:** 15 Nov 2026
- **Prompt:** "untuk mengenai pesanan apakah sudah enak dilihat? apa harus ada perubahan?" lalu "boleh deh ketiganya"
- **Tujuan Perintah:** Membuat kartu pesanan lebih ringkas: label Hari ini/Besok, info bayar satu baris, tombol Tandai lunas.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** `OrderCard` ditulis ulang dan diuji otomatis. Badge status yang dobel dengan judul kolom dihapus.

### Prompt ke-21. Keterbatasan localStorage
- **Tanggal:** 15 Nov 2026
- **Prompt:** "jadi ini mereka kan tidak perlu buat akun, nah mesannya menggunakan browser dari hp masing masing … apakah ada kemungkinan untuk reset yang membuat pesanan mereka tadi tidak terlihat lagi"
- **Tujuan Perintah:** Memahami batas penyimpanan di browser.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI menjelaskan bahwa localStorage tidak tersinkron antar perangkat. Mahasiswa memutuskan tetap memakai localStorage sesuai ketentuan UTS dan mencatatnya sebagai keterbatasan sistem.

### Prompt ke-22. Tabel menjadi kartu di HP
- **Tanggal:** 15 Nov 2026
- **Prompt:** "lanjut nomor 5 tabel jadi kartu di hp"
- **Tujuan Perintah:** Membuat semua tabel nyaman dibaca di layar HP.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Cukup satu perubahan di `BaseTable` dan semua tabel ikut berubah. Ini contoh manfaat komponen reusable. Ditambah 4 test otomatis.

### Prompt ke-23. Tombol pilihan berantakan di HP
- **Tanggal:** 15 Nov 2026
- **Prompt:** "ini kok berantakan seperti ini? pada button button nya" (disertai tangkapan layar)
- **Tujuan Perintah:** Merapikan tombol pilihan cara terima dan metode bayar.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** Tinggi tombol disamakan dan label tombol bayar disingkat ("Transfer di muka"). Label lengkap tetap dipakai di struk.

### Prompt ke-24. Pemeriksaan kesesuaian dengan template UTS
- **Tanggal:** 15 Nov 2026
- **Prompt:** "coba lihat secara keseluruhan apa yang perlu diubah atau semuanya sudah sesuai dengan template yang diperintahkan untuk UTS" lalu "boleh kerjain semua nomor 1-7"
- **Tujuan Perintah:** Mencocokkan proyek dengan rubrik A1–A5 dan melengkapi bahan laporan.
- **Tangkapan Layar:** *[tempel di sini]*
- **Evaluasi dan Penyesuaian Manual:** AI melengkapi `docs/perancangan.md`: analisis kebutuhan Bab 1, component tree sesuai nama file, spesifikasi lengkap 24 endpoint, PK tabel SETTINGS, bahan Bab 3.2, dan 68 skenario uji (minimal 3 per fitur). AI juga membuat log ini. Bukti izin, tangkapan layar, dan kolom Hasil Aktual tetap dikerjakan mahasiswa.
