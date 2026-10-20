import type {
  BookingStatus,
  OrganizationType,
  OriginRegion,
  PaymentType,
} from "@/generated/prisma/enums";

// Zona waktu bisnis resmi Mubarak Miles Tour (Surabaya, Jawa Timur).
export const BUSINESS_TIME_ZONE = "Asia/Jakarta";

// Aturan waktu pemesanan & pembayaran termin sesuai Laporan PPBI §6.2 & §6.5:
// - DP 50% dibayarkan maksimal H-30 sebelum keberangkatan (setelah tanda tangan MOU).
// - Pelunasan 50% dibayarkan maksimal H-14 sebelum keberangkatan.
// - Pemesanan baru minimal H-14 agar tim operasional dapat menyiapkan bus, hotel, & Ramp Check H-1.
export const MIN_DAYS_AHEAD = 14;
export const MAX_DAYS_AHEAD = 540; // ~18 bulan ke depan untuk perencanaan ziarah tahunan majelis
export const DP_DEADLINE_DAYS_BEFORE = 30;
export const DP_SHORT_NOTICE_GRACE_DAYS = 2;
export const FULL_PAYMENT_DEADLINE_DAYS_BEFORE = 14;

export const DP_RATIO = 0.5; // DP 50%
export const IDEAL_BUS_CAPACITY = 40; // Kapasitas ideal 1 bus pariwisata (PPBI §6.5)

export const ORGANIZATION_TYPES = [
  "MAJELIS_TAKLIM",
  "KOMUNITAS",
  "PESANTREN",
  "YAYASAN",
  "SEKOLAH",
  "LAINNYA",
] as const satisfies readonly OrganizationType[];

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  MAJELIS_TAKLIM: "Majelis Taklim (Muslimat / Fatayat / Pengajian)",
  KOMUNITAS: "Komunitas / Paguyuban Warga",
  PESANTREN: "Pondok Pesantren",
  YAYASAN: "Yayasan Pendidikan / Sosial Islam",
  SEKOLAH: "Sekolah / Madrasah (MI / MTs / MA)",
  LAINNYA: "Instansi / Rombongan Lainnya",
};

export const ORIGIN_REGIONS = [
  "SURABAYA_RAYA",
  "JAWA_TIMUR_LAINNYA",
  "LUAR_JAWA_TIMUR",
] as const satisfies readonly OriginRegion[];

export const ORIGIN_REGION_LABELS: Record<OriginRegion, string> = {
  SURABAYA_RAYA: "Surabaya Raya (Surabaya, Sidoarjo, Gresik)",
  JAWA_TIMUR_LAINNYA: "Jawa Timur Lainnya",
  LUAR_JAWA_TIMUR: "Luar Jawa Timur",
};

export const BOOKING_STATUSES = [
  "MENUNGGU_PENAWARAN",
  "MOU_DITANDATANGANI",
  "DP_DITERIMA",
  "LUNAS",
  "SELESAI",
  "BATAL",
] as const satisfies readonly BookingStatus[];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  MENUNGGU_PENAWARAN: "Menunggu Penawaran & MOU",
  MOU_DITANDATANGANI: "MOU Ditandatangani",
  DP_DITERIMA: "DP 50% Diterima",
  LUNAS: "Lunas (Siap Berangkat)",
  SELESAI: "Perjalanan Selesai",
  BATAL: "Dibatalkan",
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  DP_50: "Down Payment (DP 50%)",
  PELUNASAN: "Pelunasan (50%)",
  REFUND: "Pengembalian Dana (Refund)",
};
