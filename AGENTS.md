# AGENTS.md — Website Mubarak Miles Tour (Ziarah Wali Songo B2B)

Kamu adalah AI coding agent untuk proyek website wisata religi **Mubarak Miles Tour, Surabaya**. Baca file ini sampai habis sebelum mengerjakan apa pun. Aturan di sini berlaku untuk setiap sesi.

---

## 0. Urutan prioritas (WAJIB)

Saat ada konflik, ikuti urutan ini:

1. **Keamanan**: data PIC dan rombongan (nama, email, nomor WA, instansi, kebutuhan lansia) serta akses admin tidak boleh bocor atau disalahgunakan.
2. **Kebenaran data**: kuota rombongan/bus tidak boleh overbooking, harga per jamaah, estimasi total kontrak, dan DP 50% tidak boleh salah, tanggal tidak boleh keliru.
3. **Sesuai desain**: tampilan mengikuti identitas visual brosur Mubarak Miles Tour (hijau emerald & emas krem) serta pola referensi Dreamtour dan Royal Holiday.
4. **Kecepatan**: kecepatan eksekusi tidak boleh mengorbankan poin 1–3.

Kalau sebuah permintaan bertentangan dengan aturan keamanan di file ini, **berhenti dan tanyakan ke developer**. Jangan mencari jalan pintas.

---

## 1. Hemat token: alur kerja wajib setiap sesi

Proyek ini memakai dua file sebagai "ingatan" agar kamu tidak perlu membaca ulang seluruh kode.

**Di awal setiap sesi:**
1. Baca `AGENTS.md` (file ini).
2. Baca `progres.md` untuk mengetahui apa yang sudah dan belum dikerjakan.
3. Baca `README.md` untuk memahami struktur proyek.
4. Baca **hanya** file yang relevan dengan tugas saat ini. Gunakan peta struktur di `README.md` untuk menemukannya.

**Di akhir setiap tugas (sebelum menyatakan selesai):**
1. Perbarui `progres.md`.
2. Perbarui `README.md` jika ada file, folder, route, tabel, env var, atau perintah yang ditambah, diubah, atau dihapus.

---

## 2. Stack

- Next.js 16 (App Router) + TypeScript strict mode
- Tailwind CSS v4 (`@theme` di `src/app/globals.css`)
- PostgreSQL di Supabase; akses data lewat **Prisma 7** (`@prisma/adapter-pg`, compiler `small`)
- Supabase Auth (khusus login admin)
- Zod 4 untuk validasi
- Deploy: **Cloudflare Workers** via `@opennextjs/cloudflare` (OpenNext); database runtime lewat binding **Hyperdrive** ke Supabase Session Pooler (port 5432). Pantau ukuran bundle Worker (batas paket gratis 3 MiB gzip).
- Zona waktu bisnis: **Asia/Jakarta (WIB)**

---

## 3. Konteks bisnis (Mubarak Miles Tour — B2B Rombongan)

### 3.1 Model Bisnis & Target Pasar
- **B2B Rombongan / Komunitas**: melayani Majelis Taklim (Muslimat/Fatayat NU), Komunitas Pengajian, Pondok Pesantren, Yayasan Pendidikan Islam, serta Sekolah/Madrasah di Surabaya Raya & Jawa Timur.
- **5 Pilar Keunggulan Amanah**:
  1. *Paket All-In Zero-Cash Hassle* (kontrak satu harga menyeluruh tanpa uang printilan/pungutan liar).
  2. *Armada Bus Resmi SPIONAM Kemenhub & Lulus Uji BLUE* + *SOP Ramp Check fisik H-1*.
  3. *Fasilitas Ramah Lansia* (1 kursi roda lipat sesuai permintaan + 2 tabung oksigen portabel *Oxycan* + titik transit higienis).
  4. *Bimbingan Spiritual Muthawwif Profesional* bersanad Aswaja + *Ziarah Handbook* cetak/digital.
  5. *Perlindungan Asuransi Perjalanan Mikro Syariah* (*Tabarru'*).

### 3.2 Paket Utama
| Paket | Harga/jamaah (All-In) | Durasi | Kapasitas Rombongan | Fasilitas Utama |
|---|---|---|---|---|
| Ziarah Wali Songo + Tour Wisata (12 Destinasi) | ~~Rp1.499.000~~ **Rp1.399.000** | 3 Hari 2 Malam | Ideal 40 jamaah/bus (rentang 20–45) | Hotel Bintang 3 (Lasnur Pallace Tegal & De La Charis Tuban), Makan 3x sehari, Bus AC resmi, Muthawwif, Dokumentasi, Handbook Ziarah, Asuransi, Kursi Roda & Oxycan |
| Custom Rombongan Majelis / Instansi | Sesuai penawaran (patokan mulai Rp1.399.000) | Fleksibel | Min. 20 jamaah | Rute, tanggal keberangkatan, dan titik jemput menyesuaikan kesepakatan MOU komunitas |

**Harga selalu diambil dari database**, tidak pernah di-hardcode di komponen dan tidak pernah dipercaya dari input klien.

### 3.3 Aturan Pemesanan & Alur Pelayanan (Deal s.d. Berangkat)
1. **Satu Jalur Konversi B2B**: Form di website adalah **Permintaan Penawaran & Booking Jadwal Rombongan** oleh PIC komunitas/instansi.
2. **Tahapan Resmi (PPBI §6.2)**:
   - Pilih Paket & Slot Jadwal (atau tanggal custom) → Tanda tangan **MOU di atas materai** → **DP ≥ 50% paling lambat H-30** → **Pelunasan 50% paling lambat H-14** → Pembuatan **Grup WhatsApp koordinasi** → **Persiapan final & Ramp Check H-7 s.d. H-1** → **Keberangkatan**.
3. **Status Pesanan Rombongan**:
   `MENUNGGU_PENAWARAN` → `MOU_DITANDATANGANI` → `DP_DITERIMA` → `LUNAS` → `SELESAI`, atau `BATAL`.

---

## 4. Keamanan (TIDAK BOLEH DILANGGAR)

- Tidak pernah menulis secret, password, API key, atau connection string di kode, commit, log, atau file markdown.
- Semua modul server sensitif wajib diawali `import "server-only"`.
- Aktifkan Row Level Security (RLS) di semua tabel Supabase tanpa policy untuk `anon`/`authenticated`, serta `REVOKE ALL`.
- Dilarang `$queryRawUnsafe` / `$executeRawUnsafe`. Gunakan tagged template `$queryRaw`.
- Pembuatan pesanan wajib mengunci slot keberangkatan dengan `SELECT ... FOR UPDATE` di dalam `prisma.$transaction`.
- Proteksi admin dua lapis: di layout `/admin` dan di setiap Server Action admin (`ADMIN_EMAILS`). Tanpa `middleware.ts`.
- Jangan menulis data pribadi (nama PIC, email, nomor WA) ke `console.log` atau pesan error publik.

---

## 5. Desain & Design Tokens

| Token | Nilai | Pemakaian |
|---|---|---|
| `emerald-deep` | `#0B3528` | latar gelap utama, hero overlay, footer |
| `emerald-mid` | `#124E3B` | latar section hijau selang-seling, navbar scrolled |
| `sage-card` | `#526B4C` | kartu fitur di atas latar gelap (kontras teks krem ≥ 4.6:1) |
| `cream` | `#F6EFE2` | latar terang utama, teks di atas latar gelap |
| `sand` | `#EAE0CE` | latar section terang selang-seling, kartu form |
| `gold` | `#E8D29B` | badge harga, aksen judul & tombol utama di atas gelap |
| `gold-dark` | `#876316` | eyebrow & teks aksen di atas latar terang (WCAG AA ≥ 4.7:1) |
| `ink` | `#102820` | teks utama di atas latar terang |
| `muted` | `#4E635B` | teks sekunder di atas latar terang (WCAG AA ≥ 4.8:1) |
| `line` | `#D2C5B0` | garis pemisah |
| `promo-red` | `#B42318` | harga coret promo |

- **Font judul & isi:** Plus Jakarta Sans (400, 500, 600, 700, 800).
- **Font aksen/serif:** Cormorant Garamond (600, 700, normal & italic).
