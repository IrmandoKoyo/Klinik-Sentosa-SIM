# 🏥 Klinik Sentosa - Sistem Informasi Manajemen Klinik (SIM)

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)

**Klinik Sentosa SIM** adalah aplikasi manajemen klinik berbasis web yang dirancang untuk operasional klinik modern tingkat produksi. Sistem ini mengintegrasikan seluruh alur kerja klinik mulai dari pendaftaran pasien, pemeriksaan dokter, pembayaran kasir, hingga pengambilan obat di farmasi secara *real-time* dan efisien.

---

## ✨ Fitur Utama (Production Grade)

### 1. 📋 Pendaftaran Pasien (Registration)
*   **Penyimpanan Otomatis:** Data pasien baru otomatis tersimpan di database master untuk kunjungan berikutnya.
*   **Cek Duplikasi:** Mencegah input ganda dengan validasi NIK.
*   **Antrian Real-time:** Pasien langsung masuk ke antrian dokter setelah mendaftar.

### 2. 👨‍⚕️ Kokpit Dokter (Examination)
*   **Rekam Medis Super Lengkap:**
    *   **Tanda Vital (TTV):** Tekanan Darah, Berat Badan, Suhu, Nadi, Pernapasan.
    *   **Riwayat:** Diagnosa, Keluhan (Anamnesa), Catatan Dokter.
    *   **Waktu & Petugas:** Mencatat waktu pemeriksaan dan nama dokter secara otomatis.
*   **Status Antrian:** Pasien tetap terlihat di daftar dengan status "SEDANG DIPERIKSA" selama proses berlangsung.
*   **E-Resep:** Input resep obat yang terintegrasi langsung dengan stok farmasi.

### 3. 💳 Kasir & Pembayaran (Payment)
*   **Invoice Profesional:** Cetak struk/invoice pembayaran yang rinci (Jasa Dokter + Obat).
*   **Integrasi:** Tagihan otomatis muncul setelah dokter menyelesaikan pemeriksaan.

### 4. 💊 Farmasi & Obat (Pharmacy)
*   **Validasi Stok:** Mencegah pemberian obat jika stok tidak mencukupi.
*   **Cetak Etiket:** Fitur cetak label obat (etiket) otomatis dengan aturan pakai (misal: 3x1 Sesudah Makan).
*   **Manajemen Stok:** Pengurangan stok otomatis saat transaksi selesai.

### 5. 📊 Dashboard & Admin
*   **Reset Antrian:** Fitur admin untuk mereset antrian harian.
*   **Laporan:** (Coming Soon) Visualisasi data kunjungan dan pendapatan.

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend:** React (TypeScript) + Vite
*   **Styling:** Tailwind CSS (Modern UI/UX with Glassmorphism)
*   **Database:** Google Firebase Firestore (NoSQL Real-time Database)
*   **Icons:** Lucide React
*   **Build Tool:** Vite

---

## 💾 Penyimpanan Data (Data Storage)

Aplikasi ini menggunakan **Google Firebase Firestore** sebagai backend serverless. Data tersimpan aman di cloud dan disinkronisasi secara real-time antar pengguna.

**Struktur Koleksi (Collections):**
1.  `users`: Data pengguna (Admin, Dokter, Kasir, Apoteker) untuk login.
2.  `patients`: Master data pasien (NIK, Nama, Tgl Lahir, Asuransi).
3.  `medications`: Master data obat (Nama, Stok, Harga).
4.  `queue`: Data antrian harian (bersifat sementara, di-reset tiap hari).
5.  `transactions`: Riwayat transaksi medis lengkap (Arsip permanen).

---

## 🚀 Cara Penggunaan (Workflow)

### 1. Persiapan (Admin)
*   Pastikan stok obat tersedia di menu **Farmasi**.
*   Pastikan antrian hari sebelumnya sudah di-reset di **Dashboard**.

### 2. Alur Pasien
1.  **Pendaftaran:** Petugas mendaftarkan pasien. Pasien mendapat nomor antrian.
2.  **Pemeriksaan:** Dokter memanggil pasien, melakukan pemeriksaan, input TTV, diagnosa, dan resep. Klik "Simpan & Kirim ke Kasir".
3.  **Pembayaran:** Kasir menerima data tagihan, mencetak invoice, dan memproses pembayaran.
4.  **Farmasi:** Apoteker menyiapkan obat, mencetak etiket, dan menyerahkan obat ke pasien.

---

## 💻 Instalasi & Menjalankan Project

### Prasyarat
*   Node.js (v18+)
*   Akun Firebase (untuk konfigurasi database)

### Langkah-langkah

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/klinik-sentosa-sim.git
    cd klinik-sentosa-sim
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Konfigurasi Firebase**
    *   Buat project di [Firebase Console](https://console.firebase.google.com/).
    *   Buat file `.env` di root folder.
    *   Isi konfigurasi sesuai data dari Firebase:
        ```env
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        ...
        ```

4.  **Jalankan Aplikasi (Development)**
    ```bash
    npm run dev
    ```

5.  **Build untuk Produksi**
    ```bash
    npm run build
    ```

---

## 📄 Lisensi

Project ini dilisensikan di bawah **MIT License**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan ulang untuk keperluan pribadi maupun komersial.

---

**Dibuat dengan ❤️ oleh Tim Klinik Sentosa**
