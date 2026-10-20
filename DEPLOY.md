# Panduan Deploy ke Cloudflare Workers — Mubarak Miles Tour

Panduan deploy **Website Mubarak Miles Tour** (Next.js 16 + OpenNext Cloudflare + Supabase PostgreSQL via Hyperdrive). Seluruh langkah dirancang tanpa Google Cloud Platform (GCP) dan mengikuti arsitektur Zero-Trust yang telah teruji. **Jangan pernah menulis nilai rahasia (password, anon key, secret key) di file mana pun di dalam repositori.**

Produksi saat ini: **https://mubarak-miles-tour.puguhmuqoddam151.workers.dev**, Worker `mubarak-miles-tour`, GitHub `https://github.com/Puguh-Muqoddam/website-MubarakMilesTour`, Supabase project `guzniqzpdpqgwyropdlf`, Hyperdrive ID `2f06eb9be4c54c71919775983c353b68` (Session Pooler port 5432).

---

## 0. Rekomendasi Paket Cloudflare Workers

| Spesifikasi | Paket Gratis | Paket Paid ($5/bulan) |
|---|---|---|
| Batas CPU per request | **10 ms** | **30 s** (default) |
| Batas ukuran Worker (gzip) | **3 MiB** | **10 MiB** |
| Kuota request | 100.000 / hari | 10.000.000 / bulan |

Render halaman SSR Next.js 16 + Prisma 7 membutuhkan waktu CPU ±150–350 ms per request. Pada paket gratis berisiko memunculkan `Error 1102: Worker exceeded CPU time limit`. **Disarankan menggunakan Cloudflare Workers Paid** untuk operasional produksi.

---

## 1. Setup Database Supabase (PostgreSQL + Zero-Trust RLS)

1. Buat project baru di **Supabase Dashboard** dengan region **Southeast Asia (Singapore)**. Gunakan password database yang hanya terdiri dari huruf dan angka (hindari karakter `@ # / ? %` agar tidak merusak format URI).
2. Inisialisasi skema tabel, `CHECK` constraints, Row Level Security (RLS), `REVOKE ALL`, serta data awal (pilih **salah satu** metode):
   - **Metode A — Tanpa Terminal (SQL Editor Supabase):**
     Buka **SQL Editor → New query** → salin dan tempel seluruh isi file `prisma/manual/00-setup-database-baru.sql` → klik **Run**. Seluruh perintah dieksekusi di dalam satu transaksi (`BEGIN ... COMMIT`). Pastikan tabel verifikasi di akhir menampilkan:
     `total_paket: 2 | total_slot_jadwal: 2 | total_destinasi: 12 | total_faq: 6`.
   - **Metode B — Lewat Terminal Lokal:**
     Isi `.env` lokal dengan `DIRECT_URL` (URI Session Pooler port 5432), lalu jalankan:
     ```bash
     npm run db:seed
     ```
3. Periksa **Supabase Advisors → Security Advisor**: pastikan tidak ada peringatan RLS terbuka karena seluruh tabel (`Package`, `DepartureSlot`, `GroupBooking`, `BookingStatusLog`, `PaymentLog`, `Destination`, `Faq`, `ClosedDate`, `RateLimit`) telah memiliki `ENABLE ROW LEVEL SECURITY` tanpa policy publik serta `REVOKE ALL FROM anon, authenticated`.
4. **Konfigurasi Supabase Authentication (Khusus Login Admin):**
   - Buka **Authentication → Sign In / Providers** → matikan opsi **Allow new users to sign up**.
   - Buka **Authentication → Users → Add user → Create new user** → masukkan email pengelola (mis. `mubarakmilestour@gmail.com`) beserta kata sandi yang kuat, lalu centang **Auto Confirm User**. Pastikan email ini juga didaftarkan di Secret `ADMIN_EMAILS`.
5. Catat 3 informasi berikut dari Supabase Dashboard untuk langkah selanjutnya:
   - **Project URL** (`https://<PROJECT_REF>.supabase.co`) dari *Project Settings → API*.
   - **anon public key** dari *Project Settings → API*.
   - **URI Session Pooler (Port 5432)** dari tombol *Connect → Connection String → Method: Session Pooler (IPv4 compatible)*:
     ```text
     postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```

---

## 2. Setup Cloudflare Hyperdrive (Wajib Session Pooler Port 5432)

Hyperdrive **WAJIB** diarahkan ke **Supabase Session Pooler (port 5432)** dengan username `postgres.<PROJECT_REF>`:
- Jangan gunakan *Direct Connection* (`db.<ref>.supabase.co`) karena hanya mendukung IPv6 pada tier standar.
- Jangan gunakan *Transaction Pooler* (port 6543) bersama Hyperdrive.

Langkah di **Cloudflare Dashboard → Storage & Databases → Hyperdrive**:
1. Klik **Create Configuration**, beri nama (mis. `mubarak-miles-tour-db`), lalu tempel URI Session Pooler port 5432 dari Langkah 1.5.
2. Salin **Hyperdrive ID** (32 karakter hex) yang dihasilkan, lalu tempelkan ke field `hyperdrive[0].id` di dalam file `wrangler.jsonc`:
   ```jsonc
   "hyperdrive": [
     {
       "binding": "HYPERDRIVE",
       "id": "ISI_DENGAN_32_KARAKTER_ID_HYPERDRIVE_ANDA"
     }
   ]
   ```
   *(Catatan: ID Hyperdrive bukan rahasia dan memang harus disimpan di `wrangler.jsonc`; password database tersimpan aman di sisi Cloudflare Hyperdrive).*

---

## 3. Setup Cloudflare Turnstile (Proteksi Anti-Bot Form Penawaran)

1. Buka **Cloudflare Dashboard → Turnstile → Add widget**.
2. Tambahkan hostname domain produksi Anda (mis. `mubarakmilestour.com`, `www.mubarakmilestour.com`, serta subdomain `<worker>.<akun>.workers.dev`).
3. Pilih mode **Managed**, lalu simpan **Site Key** dan **Secret Key** untuk dimasukkan ke Cloudflare Secrets pada Langkah 4.

---

## 4. Konfigurasi 7 Runtime Secrets di Cloudflare Worker

File `wrangler.jsonc` menggunakan `"keep_vars": true` dan sengaja **tidak** menyimpan variabel di dalam repo (dijaga oleh unit test `test/wrangler-secrets.test.ts`).

Buka **Cloudflare Dashboard → Workers & Pages → `mubarak-miles-tour` → Settings → Variables and Secrets → Add**, pilih tipe **Secret**, dan tambahkan ke-7 variabel berikut:

| Nama Secret | Contoh Format / Isi |
|---|---|
| `SUPABASE_URL` | `https://<PROJECT_REF>.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key dari Supabase Project Settings → API |
| `ADMIN_EMAILS` | Daftar email pengelola dipisah koma (mis. `mubarakmilestour@gmail.com,tiya@mubarakmilestour.com`) |
| `BOOKING_WHATSAPP_NUMBER` | Nomor WhatsApp konsultan format `628...` tanpa `+` atau `-` (mis. `6285847879784`) |
| `SITE_URL` | URL kanonis produksi tanpa garis miring akhir (mis. `https://mubarakmilestour.com`) |
| `TURNSTILE_SITE_KEY` | Site key widget Cloudflare Turnstile dari Langkah 3 |
| `TURNSTILE_SECRET_KEY` | Secret key widget Cloudflare Turnstile dari Langkah 3 |

---

## 5. Verifikasi Pra-Deploy & Perintah Deploy

Sebelum melakukan deploy, jalankan pemeriksaan kualitas dan keamanan kode di terminal:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Untuk men-deploy ke Cloudflare Workers:
- **Otomatis via GitHub (Workers Builds):** Hubungkan repositori ke Cloudflare Workers Builds dengan *Build command* `npx opennextjs-cloudflare build` dan *Deploy command* `npx opennextjs-cloudflare deploy`.
- **Manual via Terminal:**
  ```bash
  npm run deploy
  ```

---

## 6. Checklist Verifikasi Pasca-Deploy

- [ ] **Halaman Utama Publik (`/`)**: Tampil dengan identitas visual Emerald & Gold, paket *Ziarah Wali Songo + Tour Wisata (3H2M · 12 Destinasi)* seharga ~~Rp1.499.000~~ **Rp1.399.000/jamaah**, indikator sisa kuota bus jadwal *1–3 Februari 2027*, peta 12 destinasi & 2 hotel bintang 3 (*Lasnur Pallace Tegal* & *De La Charis Tuban*), serta 7 tahapan alur MOU.
- [ ] **Form Permintaan Penawaran B2B (`/#booking`)**: Kalkulator estimasi kontrak All-In dan DP 50% berjalan *real-time*; pengiriman form menghasilkan kode `MMT-XXXXXXXX`, mengalihkan ke `/pesanan/terkirim`, dan membuka pesan WhatsApp terstruktur ke nomor konsultan.
- [ ] **Proteksi Portal Admin (`/admin`)**: Mengakses `/admin` tanpa sesi otomatis dialihkan ke `/admin/login`. Login dengan email di luar `ADMIN_EMAILS` ditolak dengan pesan generik.
- [ ] **Manajemen MOU, DP 50%, & Pelepasan Kuota Slot**: Mengubah status pesanan rombongan mencatat `BookingStatusLog`; mencatat pembayaran termin menyimpan `PaymentLog`; membatalkan pesanan ber-slot (`BATAL`) otomatis mengembalikan 1 kuota bus pada `DepartureSlot`.
- [ ] **Halaman Cetak Lampiran MOU / Invoice (`/admin/pesanan/[id]/cetak`)**: Tampilan cetak (`Ctrl+P` / Simpan PDF A4) bersih tanpa elemen navigasi (`@media print`).
- [ ] **SEO & Security Headers**: `/robots.txt` memblokir `/admin` dan `/pesanan/`; `/sitemap.xml` aktif; response header memuat `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, dan `Strict-Transport-Security`.

---

## 7. Pemeliharaan Berkala

Bersihkan baris lama pada tabel `RateLimit` secara berkala (misalnya sebulan sekali) melalui Supabase SQL Editor:
```sql
DELETE FROM "RateLimit" WHERE "windowStart" < now() - interval '1 day';
```
