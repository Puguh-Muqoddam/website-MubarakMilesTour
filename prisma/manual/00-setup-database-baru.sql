-- =====================================================================
-- SETUP LENGKAP Database Supabase BARU — Mubarak Miles Tour (Ziarah Wali Songo B2B)
-- Cara pakai: Supabase -> SQL Editor -> New query -> tempel SELURUH isi file -> Run.
-- Mencakup: DDL tabel, CHECK constraints, Zero-Trust RLS + REVOKE ALL, dan Seed Data awal.
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum"            VARCHAR(64) NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

CREATE SCHEMA IF NOT EXISTS "public";

-- ===== Enums =====
CREATE TYPE "OrganizationType" AS ENUM ('MAJELIS_TAKLIM', 'KOMUNITAS', 'PESANTREN', 'YAYASAN', 'SEKOLAH', 'LAINNYA');
CREATE TYPE "OriginRegion" AS ENUM ('SURABAYA_RAYA', 'JAWA_TIMUR_LAINNYA', 'LUAR_JAWA_TIMUR');
CREATE TYPE "BookingStatus" AS ENUM ('MENUNGGU_PENAWARAN', 'MOU_DITANDATANGANI', 'DP_DITERIMA', 'LUNAS', 'SELESAI', 'BATAL');
CREATE TYPE "PaymentType" AS ENUM ('DP_50', 'PELUNASAN', 'REFUND');

-- ===== Tabel Package =====
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1200),
    "durationDays" INTEGER NOT NULL DEFAULT 3,
    "durationNights" INTEGER NOT NULL DEFAULT 2,
    "totalDestinations" INTEGER NOT NULL DEFAULT 12,
    "priceNormalPerPax" INTEGER NOT NULL,
    "pricePromoPerPax" INTEGER NOT NULL,
    "minParticipants" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "highlights" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "facilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "hotels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "isCustomAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel DepartureSlot =====
CREATE TABLE "DepartureSlot" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "departDate" DATE NOT NULL,
    "returnDate" DATE NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "maxRombonganQuota" INTEGER NOT NULL DEFAULT 2,
    "bookedRombonganCount" INTEGER NOT NULL DEFAULT 0,
    "seatCapacityPerBus" INTEGER NOT NULL DEFAULT 40,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedReason" VARCHAR(200),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartureSlot_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel GroupBooking =====
CREATE TABLE "GroupBooking" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "packageId" TEXT NOT NULL,
    "departureSlotId" TEXT,
    "requestedDepartDate" DATE NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "elderlyCount" INTEGER NOT NULL DEFAULT 0,
    "wheelchairCount" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" INTEGER NOT NULL,
    "estimatedTotalPrice" INTEGER NOT NULL,
    "estimatedDpAmount" INTEGER NOT NULL,
    "picName" VARCHAR(100) NOT NULL,
    "whatsapp" VARCHAR(16) NOT NULL,
    "email" VARCHAR(254),
    "organizationName" VARCHAR(150) NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "originRegion" "OriginRegion" NOT NULL,
    "originCity" VARCHAR(100) NOT NULL,
    "notes" VARCHAR(600),
    "status" "BookingStatus" NOT NULL DEFAULT 'MENUNGGU_PENAWARAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupBooking_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel BookingStatusLog =====
CREATE TABLE "BookingStatusLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus" NOT NULL,
    "note" VARCHAR(300),
    "changedByEmail" VARCHAR(254) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStatusLog_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel PaymentLog =====
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" VARCHAR(300),
    "recordedByEmail" VARCHAR(254) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel Destination =====
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "description" VARCHAR(600) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "imageUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel Faq =====
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" VARCHAR(2000) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel ClosedDate =====
CREATE TABLE "ClosedDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClosedDate_pkey" PRIMARY KEY ("id")
);

-- ===== Tabel RateLimit =====
CREATE TABLE "RateLimit" (
    "key" VARCHAR(100) NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key", "windowStart")
);

-- ===== Indexes & Unique Constraints =====
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");
CREATE UNIQUE INDEX "DepartureSlot_packageId_departDate_key" ON "DepartureSlot"("packageId", "departDate");
CREATE INDEX "DepartureSlot_departDate_isActive_idx" ON "DepartureSlot"("departDate", "isActive");
CREATE UNIQUE INDEX "GroupBooking_code_key" ON "GroupBooking"("code");
CREATE INDEX "GroupBooking_departureSlotId_status_idx" ON "GroupBooking"("departureSlotId", "status");
CREATE INDEX "GroupBooking_requestedDepartDate_idx" ON "GroupBooking"("requestedDepartDate");
CREATE INDEX "GroupBooking_organizationType_idx" ON "GroupBooking"("organizationType");
CREATE INDEX "GroupBooking_originRegion_idx" ON "GroupBooking"("originRegion");
CREATE INDEX "GroupBooking_status_createdAt_idx" ON "GroupBooking"("status", "createdAt");
CREATE INDEX "BookingStatusLog_bookingId_createdAt_idx" ON "BookingStatusLog"("bookingId", "createdAt");
CREATE INDEX "PaymentLog_bookingId_paidAt_idx" ON "PaymentLog"("bookingId", "paidAt");
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");
CREATE UNIQUE INDEX "ClosedDate_date_key" ON "ClosedDate"("date");
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- ===== Foreign Keys =====
ALTER TABLE "DepartureSlot" ADD CONSTRAINT "DepartureSlot_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_departureSlotId_fkey" FOREIGN KEY ("departureSlotId") REFERENCES "DepartureSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookingStatusLog" ADD CONSTRAINT "BookingStatusLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "GroupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "GroupBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== CHECK Constraints (Integritas Data Bisnis) =====
ALTER TABLE "Package" ADD CONSTRAINT "Package_price_check"
  CHECK ("priceNormalPerPax" >= 0 AND "pricePromoPerPax" >= 0 AND "pricePromoPerPax" <= "priceNormalPerPax");
ALTER TABLE "Package" ADD CONSTRAINT "Package_participants_check"
  CHECK ("minParticipants" >= 1 AND "maxParticipants" >= "minParticipants");
ALTER TABLE "DepartureSlot" ADD CONSTRAINT "DepartureSlot_quota_check"
  CHECK ("maxRombonganQuota" >= 1 AND "bookedRombonganCount" >= 0 AND "bookedRombonganCount" <= "maxRombonganQuota" AND "seatCapacityPerBus" >= 1 AND "returnDate" >= "departDate");
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_participants_check"
  CHECK ("participantCount" >= 1 AND "elderlyCount" >= 0 AND "elderlyCount" <= "participantCount" AND "wheelchairCount" >= 0 AND "wheelchairCount" <= "participantCount");
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_price_check"
  CHECK ("unitPrice" >= 0 AND "estimatedTotalPrice" = "unitPrice" * "participantCount" AND "estimatedDpAmount" >= 0 AND "estimatedDpAmount" <= "estimatedTotalPrice");
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_amount_check"
  CHECK ("amount" > 0);

-- ===== Zero-Trust RLS & Pencabutan Hak Publik =====
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Package" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DepartureSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GroupBooking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookingStatusLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Destination" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Faq" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClosedDate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","applied_steps_count")
VALUES ('a1c4b8e2-7320-4f9a-8c3d-0001mubarak01', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', now(), '0001_init_mubarak_miles', 1);

-- ===== Data Awal (Seed sesuai Brosur & PPBI) =====
INSERT INTO "Package" (
  "id","slug","name","description","durationDays","durationNights","totalDestinations",
  "priceNormalPerPax","pricePromoPerPax","minParticipants","maxParticipants",
  "highlights","facilities","hotels","isCustomAllowed","sortOrder","updatedAt"
) VALUES
(
  'pkg_walisongo_3h2m',
  'ziarah-wali-songo-3h2m',
  'Ziarah Wali Songo + Tour Wisata (12 Destinasi)',
  'Paket perjalanan ziarah Wali Songo dan wisata religi 3 Hari 2 Malam berkonsep All-In Zero-Cash Hassle khusus rombongan Majelis Taklim, Komunitas, Pesantren, dan Yayasan. Seluruh retribusi makam, konsumsi, hotel bintang 3, hingga perlengkapan ramah lansia sudah tercakup penuh.',
  3, 2, 12,
  1499000, 1399000, 20, 45,
  ARRAY['Makam Walisongo','Masjid Agung Jawa Tengah','Kota Lama Semarang','Masjid Agung Demak'],
  ARRAY['Hotel Bintang 3 (2 Malam)','Konsumsi Prasmanan Halal 3x Sehari','Armada Bus AC Resmi SPIONAM & Lulus Uji BLUE','Pendampingan Muthawwif Profesional Bersanad','Travel Documentation (Foto & Video Rombongan)','Ziarah Handbook Cetak & Digital','Asuransi Perjalanan Mikro Syariah','Fasilitas Ramah Lansia (Kursi Roda Lipat & Tabung Oxycan)'],
  ARRAY['Lasnur Pallace Hotel Tegal (Bintang 3)','De La Charis Hotel Tuban (Bintang 3)'],
  false, 1, now()
),
(
  'pkg_custom_rombongan',
  'custom-rombongan-komunitas',
  'Paket Custom Rombongan Majelis & Instansi',
  'Fleksibilitas penuh penentuan tanggal keberangkatan, titik penjemputan di Jawa Timur, serta penyesuaian titik destinasi ziarah sesuai kesepakatan MOU komunitas atau lembaga Anda.',
  3, 2, 12,
  1499000, 1399000, 20, 120,
  ARRAY['Jadwal Keberangkatan Bebas Pilih','Titik Jemput Langsung di Lokasi Komunitas','Rute & Destinasi Fleksibel Sesuai MOU','Bisa Lebih dari 1 Armada Bus'],
  ARRAY['Hotel Bintang 3 Pilihan','Konsumsi Halal 3x Sehari Ramah Lansia','Armada Bus AC Resmi SPIONAM & Ramp Check H-1','Muthawwif Profesional & Ziarah Handbook','Dokumentasi Eksklusif & LPJ Kegiatan','Asuransi Perjalanan Syariah','Kursi Roda Lipat & Oksigen Portabel (Oxycan)'],
  ARRAY['Lasnur Pallace Hotel Tegal / Setara','De La Charis Hotel Tuban / Setara'],
  true, 2, now()
);

INSERT INTO "DepartureSlot" (
  "id","packageId","departDate","returnDate","label",
  "maxRombonganQuota","bookedRombonganCount","seatCapacityPerBus","sortOrder","updatedAt"
) VALUES
('slot_2027_02_01','pkg_walisongo_3h2m','2027-02-01','2027-02-03','Gelombang Perdana: 1–3 Februari 2027',2,0,40,1,now()),
('slot_2027_02_15','pkg_walisongo_3h2m','2027-02-15','2027-02-17','Gelombang Kedua: 15–17 Februari 2027',2,0,40,2,now());

INSERT INTO "Destination" ("id","slug","name","city","category","description","lat","lng","imageUrl","sortOrder","updatedAt") VALUES
('dest_ampel','makam-sunan-ampel','Makam Sunan Ampel','Surabaya','MAKAM','Titik awal keberangkatan dan ziarah ke makam Raden Rahmat (Sunan Ampel) di kawasan Masjid Agung Sunan Ampel Surabaya.',-7.2302,112.7428,'/images/dest-ampel.webp',1,now()),
('dest_gresik','makam-sunan-gresik','Makam Syekh Maulana Malik Ibrahim','Gresik','MAKAM','Ziarah ke makam wali tertua di jajaran Wali Songo, Syekh Maulana Malik Ibrahim di pusat Kota Gresik.',-7.1592,112.6562,'/images/dest-malik-ibrahim.webp',2,now()),
('dest_giri','makam-sunan-giri','Makam Sunan Giri','Gresik','MAKAM','Ziarah ke makam Raden Paku (Sunan Giri) di perbukitan Kebomas, dilengkapi koordinasi shuttle lokal ramah lansia.',-7.1695,112.6311,'/images/dest-giri.webp',3,now()),
('dest_drajat','makam-sunan-drajat','Makam Sunan Drajat','Lamongan','MAKAM','Ziarah ke makam Raden Qasim (Sunan Drajat) di Paciran, Lamongan yang sarat warisan filosofi kepedulian sosial.',-6.8851,112.3924,'/images/dest-drajat.webp',4,now()),
('dest_bonang','makam-sunan-bonang','Makam Sunan Bonang','Tuban','MAKAM','Ziarah ke kompleks makam Raden Makhdum Ibrahim (Sunan Bonang) di jantung Kota Tuban.',-6.8947,112.0632,'/images/dest-bonang.webp',5,now()),
('dest_muria','makam-sunan-muria','Makam Sunan Muria','Kudus','MAKAM','Ziarah ke makam Raden Umar Said (Sunan Muria) di lereng Gunung Muria dengan koordinasi ojek/shuttle terpadu All-In.',-6.6624,110.8975,'/images/dest-muria.webp',6,now()),
('dest_kudus','makam-sunan-kudus','Masjid Menara & Makam Sunan Kudus','Kudus','MAKAM','Ziarah ke makam Ja''far Shadiq (Sunan Kudus) dan menyaksikan arsitektur ikonik Menara Kudus.',-6.8044,110.8328,'/images/dest-menara-kudus.webp',7,now()),
('dest_kalijaga','makam-sunan-kalijaga','Makam Sunan Kalijaga (Kadilangu)','Demak','MAKAM','Ziarah ke makam Raden Said (Sunan Kalijaga) di Kadilangu, Demak dengan bimbingan tahlil bersanad Aswaja.',-6.9061,110.6524,'/images/dest-kalijaga.webp',8,now()),
('dest_masjid_demak','masjid-agung-demak','Masjid Agung Demak','Demak','MASJID','Kunjungan ibadah dan tadabbur sejarah kesultanan Islam pertama di Jawa pada masjid bersejarah peninggalan para Wali.',-6.8946,110.6373,'/images/dest-masjid-demak.webp',9,now()),
('dest_majt','masjid-agung-jawa-tengah','Masjid Agung Jawa Tengah (MAJT)','Semarang','MASJID','Shalat berjamaah dan wisata religi di masjid megah berpayung raksasa hidrolik di Kota Semarang.',-6.9836,110.4455,'/images/dest-majt.webp',10,now()),
('dest_kota_lama','kota-lama-semarang','Kawasan Wisata Kota Lama Semarang','Semarang','WISATA','Tour wisata santai dan dokumentasi kebersamaan rombongan di kawasan cagar budaya berarsitektur klasik.',-6.9682,110.4275,'/images/dest-kota-lama.webp',11,now()),
('dest_gunung_jati','makam-sunan-gunung-jati','Makam Sunan Gunung Jati','Cirebon','MAKAM','Ziarah penutup rangkaian Wali Songo di kompleks makam Syarif Hidayatullah (Sunan Gunung Jati) sebelum istirahat di Hotel Tegal.',-6.6714,108.5393,'/images/dest-gunung-jati.webp',12,now());

INSERT INTO "Faq" ("id","question","answer","sortOrder","updatedAt") VALUES
('faq_all_in','Apa yang dimaksud dengan Paket All-In Zero-Cash Hassle?','Seluruh pos pengeluaran selama perjalanan (bus pariwisata AC resmi, hotel bintang 3 selama 2 malam, makan prasmanan halal 3x sehari, retribusi masuk makam, infaq resmi, shuttle lokal, tol, parkir, hingga tips kru) sudah tercakup dalam satu harga kontrak di awal. Jamaah dan pengurus majelis tidak dibebani pungutan uang printilan di jalan.',1,now()),
('faq_lansia','Fasilitas apa saja yang disiapkan khusus untuk jamaah lansia?','Kami menyediakan 1 unit kursi roda lipat (atau sesuai permintaan di awal), 2 tabung oksigen portabel (Oxycan), kotak P3K & tim pendamping medis, menu konsumsi yang ramah orang tua, serta pemilihan titik transit dan hotel dengan akses yang mudah bagi lansia.',2,now()),
('faq_mou_dp','Bagaimana alur pemesanan dan pembayaran untuk rombongan Majelis Taklim?','Setelah mengisi form Permintaan Penawaran di website, tim kami akan menindaklanjuti via WhatsApp untuk penyusunan MOU di atas materai. Pembayaran dilakukan 2 tahap: Uang Muka (DP) minimal 50% paling lambat H-30 sebelum keberangkatan, dan pelunasan 50% paling lambat H-14 sebelum keberangkatan.',3,now()),
('faq_kapasitas','Berapa jumlah jamaah dalam satu rombongan keberangkatan?','Kapasitas ideal untuk 1 bus pariwisata adalah 40 jamaah (rentang pemesanan 20–45 jamaah per bus). Jika komunitas Anda berjumlah lebih dari 45 jamaah, kami dapat menyiapkan lebih dari 1 unit armada bus.',4,now()),
('faq_keamanan_bus','Bagaimana standar keamanan armada bus yang digunakan?','Mubarak Miles Tour hanya bermitra dengan Perusahaan Otobus (PO) resmi yang terdaftar aktif di portal SPIONAM Kementerian Perhubungan dan memiliki Bukti Lulus Uji Elektronik (BLUE) aktif. Selain itu, tim operasional kami wajib melakukan Ramp Check fisik H-1 sebelum keberangkatan.',5,now()),
('faq_custom','Apakah tanggal keberangkatan dan titik penjemputan bisa menyesuaikan majelis kami?','Bisa. Selain jadwal reguler (seperti 1–3 Februari 2027), Anda dapat memilih Paket Custom Rombongan untuk menentukan tanggal keberangkatan sendiri serta titik penjemputan langsung di lokasi majelis/komunitas di Surabaya Raya maupun Jawa Timur.',6,now());

COMMIT;

SELECT
  (SELECT count(*) FROM "Package")        AS paket,
  (SELECT count(*) FROM "DepartureSlot")  AS slot_jadwal,
  (SELECT count(*) FROM "Destination")    AS destinasi,
  (SELECT count(*) FROM "Faq")            AS faq;
