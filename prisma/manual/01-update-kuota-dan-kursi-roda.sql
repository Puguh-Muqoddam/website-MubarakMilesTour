-- =============================================================================
-- Mubarak Miles Tour — Migrasi Inkremental Supabase (SQL Editor)
-- Pembaruan: Kuota 1 Bus per slot, Batas Jamaah 20-45 untuk semua paket,
-- Biaya Tambahan Kursi Roda Rp62.500/unit, serta pembaruan FAQ terkait.
-- =============================================================================

BEGIN;

-- 1. Kuota bus default & eksisting: 1 bus per slot keberangkatan terjadwal
ALTER TABLE "DepartureSlot"
  ALTER COLUMN "maxRombonganQuota" SET DEFAULT 1;

UPDATE "DepartureSlot"
SET
  "maxRombonganQuota" = GREATEST(1, "bookedRombonganCount"),
  "updatedAt" = now();

-- 2. Samakan rentang peserta paket Reguler & Custom menjadi 20–45 jamaah (1 bus)
--    dan perbarui daftar fasilitas ramah lansia (Oxycan + opsi kursi roda)
UPDATE "Package"
SET
  "facilities" = ARRAY[
    'Hotel Bintang 3 (2 Malam)',
    'Konsumsi Prasmanan Halal 3x Sehari',
    'Armada Bus AC Resmi SPIONAM & Lulus Uji BLUE',
    'Pendampingan Muthawwif Profesional Bersanad',
    'Travel Documentation (Foto & Video Rombongan)',
    'Ziarah Handbook Cetak & Digital',
    'Asuransi Perjalanan Mikro Syariah',
    'Fasilitas Ramah Lansia (Tabung Oxycan & Opsi Kursi Roda)'
  ],
  "updatedAt" = now()
WHERE "id" = 'pkg_walisongo_3h2m' OR "slug" = 'ziarah-wali-songo-3h2m';

UPDATE "Package"
SET
  "minParticipants" = 20,
  "maxParticipants" = 45,
  "highlights" = ARRAY[
    'Jadwal Keberangkatan Bebas Pilih',
    'Titik Jemput Langsung di Lokasi Komunitas',
    'Rute & Destinasi Fleksibel Sesuai MOU',
    'Eksklusif 1 Bus Rombongan (20–45 Jamaah)'
  ],
  "facilities" = ARRAY[
    'Hotel Bintang 3 Pilihan',
    'Konsumsi Halal 3x Sehari Ramah Lansia',
    'Armada Bus AC Resmi SPIONAM & Ramp Check H-1',
    'Muthawwif Profesional & Ziarah Handbook',
    'Dokumentasi Eksklusif & LPJ Kegiatan',
    'Asuransi Perjalanan Syariah',
    'Oksigen Portabel (Oxycan) & Opsi Kursi Roda'
  ],
  "updatedAt" = now()
WHERE "id" = 'pkg_custom_rombongan' OR "slug" = 'custom-rombongan-komunitas';

-- 3. Perbarui CHECK constraint GroupBooking agar mendukung biaya tambahan
--    kursi roda (Rp62.500/unit) sekaligus tetap kompatibel dengan data historis.
ALTER TABLE "GroupBooking" DROP CONSTRAINT IF EXISTS "GroupBooking_price_check";
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_price_check"
  CHECK (
    "unitPrice" >= 0
    AND "estimatedTotalPrice" IN (
      "unitPrice" * "participantCount",
      "unitPrice" * "participantCount" + "wheelchairCount" * 62500
    )
    AND "estimatedDpAmount" >= 0
    AND "estimatedDpAmount" <= "estimatedTotalPrice"
  );

-- 4. Sinkronisasi konten FAQ di database
UPDATE "Faq"
SET
  "answer" = 'Kami menyediakan 2 tabung oksigen portabel (Oxycan), kotak P3K lengkap, menu konsumsi bergizi yang ramah jamaah lansia, serta pemilihan titik transit dan hotel bintang 3 dengan akses yang ramah lansia. Apabila rombongan membutuhkan kursi roda lipat tambahan, tersedia opsi tambahan sewa Rp62.500/unit selama perjalanan.',
  "updatedAt" = now()
WHERE "id" = 'faq_lansia';

UPDATE "Faq"
SET
  "answer" = 'Setiap keberangkatan dialokasikan untuk 1 armada bus pariwisata dengan kapasitas ideal 40 jamaah (rentang pemesanan minimal 20 dan maksimal 45 jamaah).',
  "updatedAt" = now()
WHERE "id" = 'faq_kapasitas';

COMMIT;

-- Verifikasi hasil pembaruan:
SELECT "id", "minParticipants", "maxParticipants" FROM "Package" ORDER BY "sortOrder";
SELECT "id", "label", "maxRombonganQuota", "bookedRombonganCount" FROM "DepartureSlot" ORDER BY "sortOrder";
