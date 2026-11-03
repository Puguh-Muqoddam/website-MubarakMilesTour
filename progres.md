# Progres — Website Mubarak Miles Tour

## Status saat ini
Tahap: 7 (Hardening Keamanan, SEO JSON-LD, Sitemap/Robots, & Panduan Deployment Cloudflare Workers) — **SELESAI (Tahap 1 s.d. Tahap 7 Tuntas)** | Terakhir diperbarui: 2026-10-20
Seluruh tahapan pembangunan Website Mubarak Miles Tour (Tahap 1 s.d. Tahap 7) telah selesai dikerjakan dan diverifikasi menggunakan TypeScript (`strict`), ESLint, Vitest, serta `next build`.

## Selesai
- [x] 2026-11-03 — **Optimasi Favicon Google Search & Prioritas Gambar Brosur MMT**:
  - Meng-generate multi-resolusi favicon & icon resmi: `public/favicon.ico` (multi-frame 48x48 dan 32x32), `public/icon-48.png`, `public/icon-96.png`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`, dan `src/app/favicon.ico`.
  - Memperbarui `src/app/layout.tsx` dengan konfigurasi icons lengkap (Google Search Favicon standard: kelipatan 48px square + `/favicon.ico` di root).
  - Mengatur prioritas utama gambar OpenGraph (`og:image`) dan Twitter Card (`twitter:image`) langsung ke brosur resmi Mubarak Miles Tour (`/images/brosur/1.png`, 1200x900).
  - Memisahkan secara tegas atribut Schema.org `TravelAgency` di `src/lib/seo.ts` antara `logo` (`/images/logo.png`) dan `image` (`/images/brosur/1.png`) agar rich snippet thumbnail Google selalu menampilkan brosur.
- [x] 2026-11-03 — **Optimasi SEO, Sitemap XML, Robots.txt, & Google Rich Results Schema.org**:
  - Memutakhirkan XML Sitemap (`src/app/sitemap.ts`) dengan `lastModified`, `changeFrequency: "daily"`, dan `priority: 1.0` pada URL kanonis `https://mubarakmilestour.my.id/`.
  - Mengonfigurasi `src/app/robots.ts` dengan izin khusus untuk `Googlebot` dan `Googlebot-Image` (untuk pengindeksan 37 foto destinasi/kuliner/hotel) serta proteksi blokir terhadap `/admin` dan `/pesanan/`.
  - Menambahkan Structured Data Schema.org `FAQPage` (`src/lib/seo.ts` & `src/lib/seo.test.ts`) untuk memicu Google Search Rich Results (dropdown akordeon tanya-jawab langsung di halaman hasil pencarian).
  - Memperkaya metadata `src/app/layout.tsx`: daftar keywords pencarian wisata religi, robot directives (`max-image-preview: large`, `max-snippet: -1`), OpenGraph / Twitter tags, publisher/author, dan dukungan verifikasi Google Search Console (`GOOGLE_SITE_VERIFICATION`).
  - Memverifikasi unit test (69/69 lulus) dan build OpenNext.
- [x] 2026-11-03 — **Koreksi Pemetaan Aset Berdasarkan Nama Asli (`asset image/`)**:
  - Memverifikasi checksum seluruh 37 file di `asset image/` terhadap `public/images/`.
  - Memperbaiki pertukaran foto antara `makamsunanmuria.jpeg` (kini tepat memetakan ke `dest-muria.jpeg`) dan `makamsunankudus3.jpeg` (kini tepat memetakan ke foto kedua Sunan Kudus `dest-kudus-2.jpeg`).
  - Memastikan ke-37 aset terpetakan 100% akurat sesuai nama baru dari pengguna.
  - Deploy dan sinkronisasi aset ke Cloudflare Workers (`https://mubarakmilestour.my.id`).
- [x] 2026-11-03 — **Standardisasi Copywriting Profesional B2B**:
  - Menghapus seluruh celetukan informal/kasual di seluruh komponen (`(Bukan Tidur di Bus)`, `Bukan sekadar nasi kotak seadanya`, `All-In Tanpa Pungli`, `uang printilan di jalan`, `tanpa repot`).
  - Mengubah narasi menjadi bahasa korporat & wisata religi profesional berstandar B2B (`Akomodasi Hotel Bintang 3 Selama 2 Malam`, `Istirahat Berkualitas Jamaah Lansia`, `Prinsip Transparansi: Zero-Cash Hassle (Satu Harga All-In)`, `All-In Transparan`).
  - Memverifikasi `typecheck`, `lint`, dan 68 unit test Vitest (`100% pass`).
  - Deploy langsung ke Cloudflare Workers (`https://mubarakmilestour.my.id`).
- [x] 2026-11-03 — **Aktivasi Custom Domain `mubarakmilestour.my.id`**:
  - Domain `mubarakmilestour.my.id` dan `www.mubarakmilestour.my.id` telah resmi terhubung ke Cloudflare Workers dengan SSL/TLS aktif.
  - Runtime secret `SITE_URL` diperbarui ke `https://mubarakmilestour.my.id`.
  - Verifikasi SEO & canonical URL, `sitemap.xml`, `robots.txt`, dan portal `/admin/login` berfungsi normal dengan response HTTP 200 OK dari Cloudflare edge Singapore.
- [x] 2026-11-03 — **Integrasi Aset Asli & Color Palette**:
  - Menyusun dokumentasi palet warna resmi `colpal.md` (Emerald Deep, Emerald Mid, Sage Card, Cream, Sand, Gold, Gold Dark, Ink, Muted, Line, Promo Red) lengkap dengan HEX, RGB, rasio kontras WCAG AA/AAA, dan panduan tipografi.
  - Memetakan dan menyalin seluruh 37 file foto asli ke struktur direktori `public/images/destinasi/` (29 foto untuk 12 destinasi), `public/images/hotel/` (2 hotel bintang 3), dan `public/images/kuliner/` (6 foto sajian prasmanan dan resto transit).
  - Memperbarui database fixtures `src/server/db/fixtures.ts` dan script setup SQL `prisma/manual/00-setup-database-baru.sql` dengan path foto riil.
  - Mengintegrasikan aset ke komponen `Hero.tsx` (carousel brosur + foto destinasi ikonik dengan navigasi interaktif), `MapAndHotels.tsx` (thumbnail foto di kartu destinasi, panel foto/peta OSM interaktif, galeri multi-foto, serta showcase 2 hotel bintang 3 resmi De La Charis Tuban dan Lasnur Syariah Tegal), dan `WhyUs.tsx` (showcase dokumentasi konsumsi prasmanan 3x sehari & resto transit).
  - Memverifikasi `typecheck`, `lint`, dan 68 unit test Vitest (`100% pass`).
  - Mengompilasi dan men-deploy ke Cloudflare Workers (`https://mubarak-miles-tour.puguhmuqoddam151.workers.dev`).
- [x] 2026-10-20 — Analisis referensi (`brave-franklin`, Dreamtour, Royal Holiday, Brosur & Laporan PPBI Mubarak Miles Tour) dan penyusunan `implementation_plan.md`.
- [x] 2026-10-20 — **Tahap 1**: Inisialisasi `package.json`, `tsconfig.json`, `next.config.ts`, `wrangler.jsonc`, `vitest.config.ts`, `AGENTS.md`, `README.md`, design tokens `src/app/globals.css`, komponen UI (`Container`, `Eyebrow`, `SectionHeading`, `Button`, `AnimateIn`, `PhotoPlaceholder`), `src/lib/env.ts` + unit test.
- [x] 2026-10-20 — **Tahap 2**: Skema database `prisma/schema.prisma` (Prisma 7, compiler `small`), SQL setup + hardening RLS `prisma/manual/00-setup-database-baru.sql`, `prisma/seed.ts`, `src/server/db/{types,fixtures,client,log,public}.ts`, dan unit test keamanan skema `src/server/db/schema-security.test.ts`.
- [x] 2026-10-20 — **Tahap 3**: Logika bisnis server `src/server/booking/{config,dates,rules,input,code,whatsapp}.ts` (kalkulasi kontrak rombongan, DP 50%, tenggat H-30 & H-14 WIB, validasi Zod `.strict()`, normalisasi WA, kode CSPRNG `MMT-`, builder pesan WA) beserta unit test `rules.test.ts` dan `input.test.ts`.
- [x] 2026-10-20 — **Tahap 4**: Aset brosur `public/images/brosur/{1,2}.png`, komponen section publik `src/components/sections/{Navbar,Hero,About,WhyUs,Packages,MapAndHotels,ProcessFlow,Faq,Footer}.tsx`, dan perakitan halaman utama `src/app/(public)/page.tsx`.
- [x] 2026-10-20 — **Tahap 5**: Modul anti-bot & rate limit `src/server/security/{turnstile,rate-limit}.ts` + `src/server/db/rate-limit.ts`, transaksi penguncian slot `src/server/db/bookings.ts` (`SELECT ... FOR UPDATE`), Server Action `src/app/actions/booking.ts`, komponen `src/components/booking/{Turnstile,BookingForm}.tsx` & `BookingSection.tsx`, halaman `/pesanan/terkirim`, serta unit test konkurensi `src/server/db/bookings.test.ts`.
- [x] 2026-10-20 — **Tahap 6**: Modul autentikasi & otorisasi dua lapis `src/server/auth/{authorize,supabase,admin}.ts`, state machine `src/server/booking/status.ts`, query & mutasi admin `src/server/db/admin.ts`, Server Actions `src/app/actions/admin.ts`, halaman `/admin/login`, dashboard `/admin`, halaman cetak lampiran MOU & invoice `/admin/pesanan/[id]/cetak`, serta unit test `src/server/auth/authorize.test.ts`.
- [x] 2026-10-20 — **Tahap 7**: Structured data JSON-LD (`TravelAgency` & `TouristTrip`) di `src/lib/seo.ts` + unit test XSS escaping `src/lib/seo.test.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, halaman `src/app/not-found.tsx` & `src/app/error.tsx`, panduan produksi `DEPLOY.md`, push ke GitHub (`website-MubarakMilesTour`), koneksi Supabase (`guzniqzpdpqgwyropdlf`) + Cloudflare Hyperdrive (`2f06eb9be4c54c71919775983c353b68`), serta deploy live ke `https://mubarak-miles-tour.puguhmuqoddam151.workers.dev`.

## Sedang dikerjakan
- Tidak ada (seluruh 7 tahap implementasi & deployment produksi telah selesai).

## Berikutnya
- Opsional: Menghubungkan Custom Domain di Cloudflare Dashboard jika sudah memiliki domain khusus.

## Keputusan penting
- 2026-10-20 — Nama resmi ditetapkan **Mubarak Miles Tour** dengan model konversi 100% **B2B Rombongan / Komunitas** (harga Rp1.399.000/jamaah adalah patokan per kepala dalam kontrak rombongan ±40 jamaah/bus).
- 2026-10-20 — Arsitektur mengikuti `brave-franklin`: Next.js 16 + Tailwind v4 + Cloudflare Workers (OpenNext) + Supabase PostgreSQL via Hyperdrive (Session Pooler port 5432) + Prisma 7 (`queryCompiler = "small"`), tanpa GCP.

## Menunggu dari klien / belum jelas (`TODO(klien)`)
- Daftar lengkap ke-12 titik destinasi ziarah & urutan rundown jam per hari (Hari 1–3).
- Kuota maksimal jumlah bus per slot tanggal keberangkatan (asumsi awal: 2 rombongan bus per slot jadwal).
- Nomor rekening bank syariah / QRIS resmi untuk halaman cetak penawaran/invoice.
- File logo vektor/PNG transparan resolusi tinggi.

## Masalah diketahui
- Belum ada.
