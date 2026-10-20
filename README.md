# Website Mubarak Miles Tour — Wisata Religi Ziarah Wali Songo (B2B)

Website resmi **Mubarak Miles Tour** (Surabaya, Jawa Timur), penyelenggara perjalanan ziarah Wali Songo + wisata religi khusus **rombongan terstruktur (B2B)**: Majelis Taklim (Muslimat/Fatayat NU), Komunitas, Pondok Pesantren, Yayasan, dan Sekolah/Madrasah.

## 1. Tech Stack
- **Framework**: Next.js 16 (App Router, React Server Components, TypeScript `strict`)
- **Styling**: Tailwind CSS v4 (design tokens di `src/app/globals.css`, kontras WCAG AA)
- **Database**: PostgreSQL di Supabase via **Prisma 7** (`@prisma/adapter-pg`, compiler `small`)
- **Edge Runtime**: Cloudflare Workers via `@opennextjs/cloudflare` + binding **Hyperdrive** (Supabase Session Pooler port 5432)
- **Autentikasi Admin**: Supabase Auth (`@supabase/ssr`, cookie `httpOnly`) + allowlist `ADMIN_EMAILS`
- **Keamanan**: Cloudflare Turnstile, Zod 4, Rate Limit tabel Postgres, Honeypot, dan RLS Zero-Trust

## 2. Perintah Penting
```bash
npm install          # pasang dependensi
npm run dev          # jalankan server development lokal (http://localhost:3000)
npm run typecheck    # next typegen + tsc --noEmit
npm run lint         # jalankan ESLint
npm test             # jalankan unit test Vitest
npm run build        # prisma generate + next build
npm run preview      # build & preview di runtime Cloudflare Worker lokal
npm run deploy       # build & deploy ke Cloudflare Workers
npm run db:generate  # generate Prisma 7 client ke src/generated/prisma
npm run db:seed      # jalankan seed data idempoten ke database
```

## 3. Environment Variables (Tanpa Nilai)
- **`.env` (CLI lokal / Prisma migrate & seed):**
  - `DIRECT_URL`: Connection string PostgreSQL Supabase (port 5432).
  - `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`: Sama dengan `DIRECT_URL` untuk simulasi Hyperdrive lokal.
- **`.dev.vars` (Runtime Worker lokal) / Cloudflare Secrets (Produksi):**
  - `SUPABASE_URL`: URL project Supabase.
  - `SUPABASE_ANON_KEY`: Anon key Supabase (hanya untuk alur login admin).
  - `ADMIN_EMAILS`: Daftar email admin yang diizinkan, dipisah koma.
  - `BOOKING_WHATSAPP_NUMBER`: Nomor WhatsApp PIC format `628...` (contoh: `6285847879784`).
  - `SITE_URL`: URL kanonis produksi (contoh: `https://mubarakmilestour.com`).
  - `TURNSTILE_SITE_KEY`: Site key widget Cloudflare Turnstile.
  - `TURNSTILE_SECRET_KEY`: Secret key verifikasi Cloudflare Turnstile.

## 4. Peta Struktur Folder
```text
├── AGENTS.md                  # Aturan wajib AI agent (keamanan, bisnis, desain)
├── DEPLOY.md                  # Panduan lengkap deploy ke Cloudflare Workers + Supabase Hyperdrive
├── implementation_plan.md     # Rencana implementasi lengkap (Tahap 1 s.d. Tahap 7)
├── progres.md                 # Catatan progres pengerjaan per sesi
├── README.md                  # Dokumentasi dan peta struktur proyek
├── next.config.ts             # Security headers (CSP) & konfigurasi OpenNext
├── wrangler.jsonc             # Konfigurasi Cloudflare Worker & binding Hyperdrive
├── vitest.config.ts           # Konfigurasi unit test Vitest
├── prisma.config.ts           # Konfigurasi CLI Prisma 7
├── prisma/
│   ├── schema.prisma          # Skema database PostgreSQL (Prisma 7, compiler small)
│   ├── seed.ts                # Seed idempoten (2 paket, 2 slot, 12 destinasi, 6 FAQ)
│   └── manual/
│       └── 00-setup-database-baru.sql # Skrip SQL lengkap: DDL, CHECK, RLS Zero-Trust, & seed
├── public/
│   └── images/
│       └── brosur/            # Aset visual halaman 1 & 2 brosur resmi Mubarak Miles Tour
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── admin.ts       # Server Actions admin (login, logout, updateBookingStatus, addPaymentLog) + requireAdminAction
│   │   │   └── booking.ts     # Server Action pengajuan penawaran rombongan (Honeypot, Rate Limit, Turnstile, Zod, Transaksi)
│   │   ├── admin/
│   │   │   ├── layout.tsx     # Layout root /admin (noindex, nofollow, force-dynamic)
│   │   │   ├── login/         # Halaman & form login pengelola (Supabase Auth + allowlist ADMIN_EMAILS)
│   │   │   └── (panel)/       # Dashboard pengelola dilindungi requireAdminPage, StatusForm, PaymentForm, & /pesanan/[id]/cetak
│   │   ├── error.tsx          # Error boundary publik ramah pengguna (tanpa bocor detail teknis)
│   │   ├── globals.css        # Design tokens Tailwind v4 (emerald, sage, gold, cream)
│   │   ├── layout.tsx         # Root layout, font Plus Jakarta Sans & Cormorant Garamond, metadata OpenGraph
│   │   ├── not-found.tsx      # Halaman 404 kustom beridentitas Mubarak Miles Tour
│   │   ├── robots.ts          # Aturan robots.txt (disallow /admin & /pesanan/)
│   │   ├── sitemap.ts         # Generator sitemap.xml dinamis
│   │   └── (public)/
│   │       ├── page.tsx       # Halaman utama publik + JSON-LD TravelAgency & TouristTrip
│   │       └── pesanan/
│   │           └── terkirim/  # Halaman ringkasan kode penawaran MMT- & tombol WhatsApp MOU
│   ├── components/
│   │   ├── booking/           # Komponen BookingForm (kalkulator kontrak & DP 50% live) & Turnstile
│   │   ├── sections/          # Section landing: Navbar, Hero, About, WhyUs, Packages, MapAndHotels, ProcessFlow, BookingSection, Faq, Footer
│   │   └── ui/                # Komponen dasar: Container, Eyebrow, SectionHeading, Button, AnimateIn, PhotoPlaceholder
│   ├── lib/
│   │   ├── env.ts             # Validasi environment variables server dengan Zod (server-only)
│   │   ├── env.test.ts        # Unit test validasi env
│   │   ├── public-config.ts   # Konfigurasi runtime non-rahasia (Turnstile site key, nomor WA publik)
│   │   ├── seo.ts             # Helper URL kanonis situs & builder JSON-LD TravelAgency
│   │   ├── seo.test.ts        # Unit test JSON-LD & proteksi XSS escaping
│   │   └── site.ts            # Konstanta identitas publik Mubarak Miles Tour & menu navigasi
│   └── server/
│       ├── auth/
│       │   ├── admin.ts       # Guard dua lapis: requireAdminPage (Lapis 1) & requireAdminAction (Lapis 2)
│       │   ├── authorize.ts   # Fungsi murni pencocokan sesi Supabase dengan allowlist ADMIN_EMAILS
│       │   ├── authorize.test.ts # Unit test otorisasi admin, state machine status, & pelepasan kuota slot saat BATAL
│       │   └── supabase.ts    # Klien Supabase SSR dengan cookie httpOnly
│       ├── booking/
│       │   ├── code.ts        # Generator kode penawaran 8 karakter CSPRNG & format MMT-
│       │   ├── config.ts      # Konstanta bisnis B2B (DP 50%, H-30, H-14, label enum)
│       │   ├── dates.ts       # Konversi tanggal WIB (Asia/Jakarta) & kalkulasi tenggat MOU/DP
│       │   ├── input.ts       # Validasi Zod 4 (.strict()) & normalisasi nomor WhatsApp
│       │   ├── input.test.ts  # Unit test validasi input, kode CSPRNG, & builder WhatsApp
│       │   ├── rules.ts       # Aturan kuota slot, peserta/lansia/kursi roda, & harga kontrak B2B
│       │   ├── rules.test.ts  # Unit test aturan tanggal WIB, kuota, & perhitungan DP 50%
│       │   ├── status.ts      # State machine tahapan MOU -> DP 50% -> Lunas -> Selesai / Batal
│       │   └── whatsapp.ts    # Formatter Rupiah/tanggal & builder URL wa.me ter-encode
│       ├── db/
│       │   ├── admin.ts       # Query dashboard admin, transisi status + SELECT FOR UPDATE saat BATAL, & PaymentLog
│       │   ├── bookings.ts    # Transaksi pembuatan GroupBooking dengan SELECT ... FOR UPDATE
│       │   ├── bookings.test.ts # Unit test konkurensi anti-overbooking & rate limit hashing
│       │   ├── client.ts      # Klien Prisma 7 via Cloudflare Hyperdrive (maxUses: 1 per request)
│       │   ├── fixtures.ts    # Data fallback dev/preview (paket, slot jadwal, 12 destinasi, FAQ)
│       │   ├── log.ts         # Logger error DB aman tanpa bocor PII
│       │   ├── public.ts      # Query baca publik (getPackages, getDepartureSlots, getDestinations, getFaqs)
│       │   ├── rate-limit.ts  # UPSERT rate limit atomik di PostgreSQL + SHA-256 IP hashing
│       │   ├── schema-security.test.ts # Unit test verifikasi RLS, REVOKE ALL, & integritas fixture
│       │   └── types.ts       # Tipe publik data katalog
│       └── security/
│           ├── rate-limit.ts  # Pembatas laju request per hash IP (fail-closed di produksi)
│           └── turnstile.ts   # Verifikasi token Cloudflare Turnstile ke endpoint siteverify
└── test/
    ├── server-only-stub.ts    # Stub modul server-only untuk Vitest
    └── wrangler-secrets.test.ts # Test penjaga agar wrangler.jsonc bebas dari rahasia
```

## 5. Ringkasan Skema Database (`prisma/schema.prisma`)
Semua tabel di-hardening dengan `ENABLE ROW LEVEL SECURITY` tanpa policy untuk `anon`/`authenticated` serta `REVOKE ALL`:
- **`packages`**: Paket perjalanan B2B (harga dasar Rp1.399.000/jamaah, harga coret Rp1.499.000, rentang kapasitas jamaah per bus, persentase DP 50%, daftar fasilitas JSON).
- **`departure_slots`**: Slot keberangkatan terjadwal (contoh: `1–3 Februari 2027`) dengan kuota rombongan/bus (`max_groups`, `booked_groups`) dan penguncian `SELECT ... FOR UPDATE`.
- **`group_bookings`**: Pesanan rombongan B2B oleh PIC komunitas/instansi (`booking_code`, data PIC & instansi, estimasi jamaah, kebutuhan lansia/kursi roda, nilai kontrak & DP 50%, status siklus hidup pesanan).
- **`booking_status_logs` & `payment_logs`**: Audit trail perubahan status pesanan dan pencatatan pembayaran (DP 50%, Pelunasan H-14).
- **`destinations`**: 12 titik destinasi ziarah Wali Songo + wisata religi beserta koordinat peta (`latitude`, `longitude`) dan urutan hari (`day_number`).
- **`faqs`, `closed_dates`, & `rate_limits`**: Pertanyaan umum B2B, pemblokiran tanggal operasional, dan pembatasan laju request per hash IP/email.
