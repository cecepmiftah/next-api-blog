# Blueprint: Aplikasi Blog Next.js

## 1. Ikhtisar

Aplikasi ini adalah blog sederhana yang dibuat dengan Next.js dan MongoDB. Pengguna dapat melihat daftar postingan, membaca detail setiap postingan, dan membuat postingan baru. Aplikasi ini dirancang dengan estetika modern, bersih, dan berfokus pada pengalaman pengguna yang luar biasa.

## 2. Garis Besar Proyek (Fitur & Desain)

### Fungsionalitas Inti
- **Melihat Semua Postingan (Route: `/`)**: Halaman utama menampilkan semua postingan dalam format kartu.
- **Membuat Postingan Baru (Route: `/create-post`)**: Formulir khusus untuk membuat dan mengirim postingan baru.
- **Melihat Detail Postingan (Route: `/posts/[id]`)**: Halaman dinamis untuk setiap postingan.

### Sistem Desain
- **Framework**: Tailwind CSS.
- **Tema**: Tema gelap modern untuk tampilan yang elegan dan mengurangi ketegangan mata.
- **Palet Warna**:
  - **Latar Belakang**: `slate-900`
  - **Konten/Kartu**: `slate-800`
  - **Teks Utama**: `slate-100`
  - **Teks Sekunder**: `slate-400`
  - **Aksen Utama (Link & Tombol)**: `indigo-500`
- **Tipografi**:
  - Font sans-serif yang bersih untuk keterbacaan.
  - Hirarki ukuran font yang jelas untuk judul, subjudul, dan teks isi.
- **Komponen**:
  - **Kartu**: Dengan bayangan lembut untuk efek "terangkat".
  - **Tombol**: Latar belakang warna aksen dengan efek `hover`.
  - **Formulir**: Input yang bersih dan terstruktur dengan label yang jelas untuk aksesibilitas.

## 3. Rencana Saat Ini

1.  **Menyiapkan API Endpoints**:
    - `GET /api/posts`: Mengambil semua postingan.
    - `GET /api/posts/[id]`: Mengambil satu postingan.
    - `POST /api/posts`: Membuat postingan baru (sudah ada).
2.  **Membangun Komponen UI**:
    - Tata letak utama dengan navigasi.
    - Halaman utama untuk menampilkan semua postingan.
    - Halaman formulir untuk membuat postingan.
    - Halaman detail untuk postingan tunggal.
3.  **Menerapkan Styling**: Menggunakan Tailwind CSS untuk menerapkan sistem desain yang telah ditentukan.
