# 🚂 Kereta Manager Indonesia (Tycoon Game)

**Kereta Manager Indonesia** adalah game simulasi dan manajemen perkeretaapian berbasis web yang interaktif, dirancang khusus untuk berjalan secara responsif di browser HP maupun PC/Laptop melalui **GitHub Pages**. Game ini menggabungkan simulasi operasional rute nyata di Indonesia, manajemen armada, sistem rekrutmen SDM, serta integrasi teknologi database cloud dan sistem Top-Up mandiri.

![Kereta Manager Indonesia](https://img.shields.io/badge/Status-Live-success)
![Platform](https://img.shields.io/badge/Platform-GitHub%20Pages-blue)
![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Fitur Utama

### 🚆 1. Operasional & Live Dispatch Rute
* **Katalog Armada Lengkap:** Menghadirkan berbagai seri lokomotif legendaris dan modern (BB 301, CC 201, CC 202, CC 206, CC 300, KRL, MRT/LRT, hingga KCIC Whoosh).
* **Rute Fleksibel Jarak Dekat & Jauh:** Sistem pemilihan stasiun asal dan tujuan dinamis mencakup rute antarkota hingga lintas pulau (Jawa & Sumatera), seperti Bogor ke Banyuwangi.
* **Kalkulasi Otomatis (ETA & Speed):** Menghitung jarak tempuh (km), kecepatan operasional, estimasi waktu perjalanan (durasi jam & menit), serta estimasi jam tiba (*ETA*) secara akurat.
* **Live Dispatch Tracking:** Mendukung pemberangkatan banyak kereta secara bersamaan dengan penghitung waktu mundur (*real-time countdown*).

### 👥 2. Rekrutmen SDM & Sistem Tiket
* **Manajemen Staf & Masinis:** Rekrut Masinis Pemula, Masinis Senior, Master Instructor, Teknisi Dipo, hingga Kondektur untuk meningkatkan efisiensi dan pendapatan.
* **Manajemen Tarif Tiket:** Pengaturan *multiplier* harga tiket (Diskon Promo, Harga Normal, hingga Layanan VIP) untuk memaksimalkan margin keuntungan.

### 💳 3. Monetisasi QRIS & Koleksi Eksklusif
* **Top-Up Pembelian Kas & VIP:** Pembayaran langsung menggunakan scan QRIS (DANA, GoPay, OVO, ShopeePay, Mobile Banking).
* **Konfirmasi Otomatis WhatsApp:** Pemain dapat mengirimkan bukti pendaftaran dan konfirmasi transaksi langsung ke WhatsApp Admin.
* **Armada & Gerbong Eksklusif:** Unit langka seperti *CC 201 Livery Vintage 1953*, *CC 206 Special Commemorative*, *Retro Luxury Wood*, dan *Gerbong VIP Kepresidenan*.

### 🛡️ 4. Sistem Admin & Keamanan (Firebase)
* **Persetujuan Admin via UID:** Admin/Moderator dapat menyetujui transaksi Top-Up dan mengirimkan unit/kas langsung ke Player UID target.
* **Sistem Banned / Unban:** Fitur moderasi untuk memblokir atau membuka akses akun pemain secara instan berbasis Firestore UID.
* **Leaderboard Realtime:** Peringkat 10 besar perusahaan terkaya yang tersinkronisasi otomatis ke cloud.

### 📱 5. Tampilan Responsif Otomatis
* Layout UI yang otomatis menyesuaikan ukuran layar smartphone (Mobile View) dan monitor PC/Laptop (Desktop View).

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Responsive Flexbox & Grid System), JavaScript (ES6+).
* **Backend & Database:** Firebase Compatibility SDK (Firestore & Anonymous Auth).
* **Hosting & Deployment:** GitHub Pages.
* **Payment Gateway UI:** QRIS / DANA Integration.

---

## 📁 Struktur Proyek

```text
Kereta-Manager-ID/
├── assets/                  # Gambar visual (qris.png, ikon, logo)
├── css/
│   └── style.css            # Styling utama & aturan UI responsif (HP & Laptop)
├── js/
│   ├── data.js              # Master data lokomotif, gerbong, stasiun, & SDM
│   ├── ui.js                # Pengendali tampilan modal, dropdown, & listener
│   └── game.js              # Game loop, logika waktu/kalender, & Firebase sync
├── index.html               # Struktur utama antarmuka game
└── README.md                # Dokumentasi proyek

## 🎮 Cara Bermain
1. Buka link game melalui [GitHub Pages](https://fastxgaming.github.io/Kereta-Manager-ID/)) .
2. Beli lokomotif pertama Anda di menu **Dipo Kereta**.
3. Pilih rute perjalanan dan tetapkan jadwal serta tarif tiket.
4. Perhatikan kondisi keuangan, bayar pinjaman bank jika ada, dan kembangkan perusahaan kereta api terbesar di Indonesia!
