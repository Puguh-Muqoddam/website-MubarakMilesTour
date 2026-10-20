# Progres — Website Mubarak Miles Tour

## Status saat ini
Tahap: 7 (Hardening Keamanan, SEO JSON-LD, Sitemap/Robots, & Panduan Deployment Cloudflare Workers) — **SELESAI (Tahap 1 s.d. Tahap 7 Tuntas)** | Terakhir diperbarui: 2026-10-20
Seluruh tahapan pembangunan Website Mubarak Miles Tour (Tahap 1 s.d. Tahap 7) telah selesai dikerjakan dan diverifikasi menggunakan TypeScript (`strict`), ESLint, Vitest, serta `next build`.

## Selesai
- [x] 2026-10-20 — Analisis referensi (`brave-franklin`, Dreamtour, Royal Holiday, Brosur & Laporan PPBI Mubarak Miles Tour) dan penyusunan `implementation_plan.md`.
- [x] 2026-10-20 — **Tahap 1**: Inisialisasi `package.json`, `tsconfig.json`, `next.config.ts`, `wrangler.jsonc`, `vitest.config.ts`, `AGENTS.md`, `README.md`, design tokens `src/app/globals.css`, komponen UI (`Container`, `Eyebrow`, `SectionHeading`, `Button`, `AnimateIn`, `PhotoPlaceholder`), `src/lib/env.ts` + unit test.
- [x] 2026-10-20 — **Tahap 2**: Skema database `prisma/schema.prisma` (Prisma 7, compiler `small`), SQL setup + hardening RLS `prisma/manual/00-setup-database-baru.sql`, `prisma/seed.ts`, `src/server/db/{types,fixtures,client,log,public}.ts`, dan unit test keamanan skema `src/server/db/schema-security.test.ts`.
- [x] 2026-10-20 — **Tahap 3**: Logika bisnis server `src/server/booking/{config,dates,rules,input,code,whatsapp}.ts` (kalkulasi kontrak rombongan, DP 50%, tenggat H-30 & H-14 WIB, validasi Zod `.strict()`, normalisasi WA, kode CSPRNG `MMT-`, builder pesan WA) beserta unit test `rules.test.ts` dan `input.test.ts`.
- [x] 2026-10-20 — **Tahap 4**: Aset brosur `public/images/brosur/{1,2}.png`, komponen section publik `src/components/sections/{Navbar,Hero,About,WhyUs,Packages,MapAndHotels,ProcessFlow,Faq,Footer}.tsx`, dan perakitan halaman utama `src/app/(public)/page.tsx`.
- [x] 2026-10-20 — **Tahap 5**: Modul anti-bot & rate limit `src/server/security/{turnstile,rate-limit}.ts` + `src/server/db/rate-limit.ts`, transaksi penguncian slot `src/server/db/bookings.ts` (`SELECT ... FOR UPDATE`), Server Action `src/app/actions/booking.ts`, komponen `src/components/booking/{Turnstile,BookingForm}.tsx` & `BookingSection.tsx`, halaman `/pesanan/terkirim`, serta unit test konkurensi `src/server/db/bookings.test.ts`.
- [x] 2026-10-20 — **Tahap 6**: Modul autentikasi & otorisasi dua lapis `src/server/auth/{authorize,supabase,admin}.ts`, state machine `src/server/booking/status.ts`, query & mutasi admin `src/server/db/admin.ts`, Server Actions `src/app/actions/admin.ts`, halaman `/admin/login`, dashboard `/admin`, halaman cetak lampiran MOU & invoice `/admin/pesanan/[id]/cetak`, serta unit test `src/server/auth/authorize.test.ts`.
- [x] 2026-10-20 — **Tahap 7**: Structured data JSON-LD (`TravelAgency` & `TouristTrip`) di `src/lib/seo.ts` + unit test XSS escaping `src/lib/seo.test.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, halaman `src/app/not-found.tsx` & `src/app/error.tsx`, panduan produksi `DEPLOY.md`, serta verifikasi penuh (`typecheck`, `lint`, `test`, & `build`).

## Sedang dikerjakan
- Tidak ada (seluruh 7 tahap implementasi telah selesai).

## Berikutnya
- Menunggu konfigurasi kredensial Supabase & Cloudflare Hyperdrive produksi dari pengelola sesuai panduan di `DEPLOY.md`.

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
