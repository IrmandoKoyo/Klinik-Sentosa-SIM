# 🏥 Klinik Sentosa - Enterprise Healthcare System
> **The Ultimate Solution for Modern Clinic Management**

<div align="center">

![License](https://img.shields.io/badge/License-Enterprise-gold.svg?style=for-the-badge) 
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) 
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) 
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 🌟 Overview
**Klinik Sentosa SIM** adalah **Sistem Informasi Manajemen (SIM) Kelas Enterprise** yang dirancang untuk efisiensi operasional klinik modern. Dibangun dengan teknologi web terkini (**React + TypeScript + Vite**), sistem ini menawarkan performa tinggi, sinkronisasi data *real-time*, dan antarmuka **Glassmorphism** yang elegan.

Sistem ini mengintegrasikan seluruh alur kerja klinik mulai dari pendaftaran pasien, rekam medis elektronik, manajemen farmasi, hingga pelaporan keuangan dalam satu platform terpadu.

---

## 🎥 Demo Aplikasi (Live Preview)

<div align="center">
  <h3>✨ Experience the Future of Clinic Management ✨</h3>
  <br/>
  <video src="https://github.com/user-attachments/assets/e38a12e3-21c2-4ea5-9c6e-1296ff59b2d1" controls="controls" style="max-width: 100%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.2);"></video>
  <br/>
  <p><i>(Tonton video demonstrasi lengkap di atas)</i></p>
</div>

---

## 🔄 System Workflow (Alur Kerja Profesional)

Sistem ini dirancang mengikuti standar operasional medis internasional:

### 1️⃣ Pendaftaran (Registration)
*   **Pasien Datang:** Mendaftar mandiri via **Kiosk (Visitor Portal)** atau dibantu petugas di meja registrasi.
*   **Smart Search:** Petugas mencari data pasien lama hanya dengan mengetik nama/NIK.
*   **Tiket Antrian:** Sistem mencetak tiket dengan QR Code dan nomor antrian otomatis.

### 2️⃣ Pemeriksaan Dokter (Examination)
*   **Pemanggilan:** Dokter memanggil pasien dari dashboard antrian.
*   **Diagnosa & Tindakan:** Dokter menginput ICD-10, tanda vital, dan tindakan medis.
*   **E-Resep:** Resep obat dikirim digital ke farmasi (tanpa kertas).

### 3️⃣ Pembayaran (Payment)
*   **Kasir:** Tagihan muncul otomatis (Jasa Dokter + Tindakan + Obat).
*   **Pelunasan:** Petugas memproses pembayaran dan mencetak struk resmi.
*   **Validasi:** Status pasien berubah menjadi "Lunas", siap untuk pengambilan obat.

### 4️⃣ Farmasi (Pharmacy)
*   **Verifikasi:** Apoteker menerima resep yang sudah dibayar.
*   **Penyiapan Obat:** Stok obat berkurang otomatis saat disiapkan.
*   **Penyerahan:** Obat diserahkan kepada pasien dan transaksi selesai sepenuhnya.

---

## 💎 Fitur Unggulan (Key Features)

### 🚀 1. Real-Time Operational Dashboard
Pusat komando canggih untuk memantau aktivitas klinik.
*   **Live Metrics:** Pemantauan *real-time* untuk antrian pasien, pendapatan harian, dan stok kritis.
*   **Interactive Charts:** Visualisasi tren kunjungan dan pendapatan 7 hari terakhir.
*   **Quick Access Modals:** Lihat detail antrian dan riwayat transaksi lengkap tanpa berpindah halaman.

### 👨‍⚕️ 2. Intelligent Doctor Station (EMR)
Modul Rekam Medis Elektronik (EMR) yang komprehensif.
*   **ICD-10 Integration:** Pencarian kode diagnosa standar internasional yang cepat.
*   **Smart Vitals:** Input tanda vital dengan format otomatis.
*   **E-Prescription:** Resep digital terintegrasi langsung dengan stok farmasi.
*   **Patient History:** Akses riwayat medis pasien sebelumnya dalam satu klik.

### 💊 3. Integrated Pharmacy System
Manajemen inventaris obat yang ketat dan akurat.
*   **Auto-Stock Deduction:** Stok berkurang otomatis saat obat diserahkan ke pasien.
*   **Low Stock Alerts:** Peringatan dini saat stok obat menipis.
*   **Restock Workflow:** Fitur upload faktur dan penambahan stok yang mudah.

### 💳 4. Secure Payment & Billing
Sistem kasir yang transparan dan profesional.
*   **Auto-Invoicing:** Tagihan terbentuk otomatis dari tindakan dokter dan resep obat.
*   **Professional Receipts:** Cetak struk pembayaran detail dengan logo klinik.
*   **Transaction History:** Riwayat transaksi lengkap dengan tanggal dan waktu presisi.

---

## 🛠️ Tech Stack

Dibangun dengan standar industri tertinggi untuk performa dan skalabilitas:

| Technology | Role | Description |
| :--- | :--- | :--- |
| **React 18** | Frontend | Library UI modern dengan Hooks dan Functional Components. |
| **TypeScript** | Language | Menjamin keamanan tipe data (*Type Safety*) dan meminimalkan bug. |
| **Vite** | Build Tool | Waktu *build* dan *hot-reload* super cepat. |
| **Firebase** | Backend | Database NoSQL Firestore untuk sinkronisasi data *real-time*. |
| **Tailwind CSS** | Styling | Framework CSS *utility-first* untuk desain responsif dan custom. |
| **Recharts** | Charts | Library visualisasi data yang responsif dan kustomisasi tinggi. |

---

## 🚀 Getting Started

### Prasyarat
*   Node.js (v18+)
*   Akun Google Firebase

### Instalasi
1.  **Clone Repository**
    ```bash
    git clone https://github.com/IrmandoKoyo/Klinik-Sentosa-SIM.git
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Setup Environment**
    Buat file `.env` di root folder dan tambahkan konfigurasi Firebase Anda:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    ...
    ```
4.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

---
<div align="center">
  <p>© 2025 Klinik Sentosa Systems. All Rights Reserved.</p>
  <p><i>Developed with ❤️ for Advanced Web Development Course</i></p>
</div>
