import {
  DP_RATIO,
  IDEAL_BUS_CAPACITY,
  MAX_DAYS_AHEAD,
  MIN_DAYS_AHEAD,
} from "./config";
import {
  addDays,
  bookingWindow,
  computeContractDeadlines,
  type ContractDeadlines,
  daysBetween,
  formatDateOnly,
  parseDateOnly,
  todayInJakarta,
} from "./dates";

export {
  addDays,
  bookingWindow,
  computeContractDeadlines,
  type ContractDeadlines,
  daysBetween,
  formatDateOnly,
  parseDateOnly,
  todayInJakarta,
};

export type RuleError =
  | "INVALID_DATE"
  | "TOO_SOON"
  | "TOO_FAR"
  | "DATE_CLOSED"
  | "PACKAGE_UNAVAILABLE"
  | "SLOT_REQUIRED"
  | "SLOT_UNAVAILABLE"
  | "SLOT_QUOTA_EXCEEDED"
  | "PARTICIPANTS_OUT_OF_RANGE"
  | "ELDERLY_COUNT_INVALID"
  | "WHEELCHAIR_COUNT_INVALID";

export type RuleResult = { ok: true } | { ok: false; error: RuleError };

const ok: RuleResult = { ok: true };
const fail = (error: RuleError): RuleResult => ({ ok: false, error });

/**
 * Validasi tanggal keberangkatan rombongan:
 * - Format YYYY-MM-DD valid
 * - Minimal H-14 dari hari ini (WIB) untuk persiapan bus, hotel, & Ramp Check H-1
 * - Maksimal +540 hari ke depan
 * - Tidak berada pada tanggal tutup operasional penuh
 */
export function validateDepartDate(
  departDate: string,
  now: Date,
  isDateClosed: boolean,
): RuleResult {
  const d = parseDateOnly(departDate);
  if (!d) return fail("INVALID_DATE");
  const diff = daysBetween(todayInJakarta(now), departDate);
  if (diff < MIN_DAYS_AHEAD) return fail("TOO_SOON");
  if (diff > MAX_DAYS_AHEAD) return fail("TOO_FAR");
  if (isDateClosed) return fail("DATE_CLOSED");
  return ok;
}

/** Validasi ketersediaan slot keberangkatan terjadwal & kuota rombongan bus. */
export function validateDepartureSlot(
  slot: {
    isActive: boolean;
    isClosed: boolean;
    maxRombonganQuota: number;
    bookedRombonganCount: number;
  } | null,
): RuleResult {
  if (!slot || !slot.isActive || slot.isClosed) {
    return fail("SLOT_UNAVAILABLE");
  }
  if (slot.bookedRombonganCount >= slot.maxRombonganQuota) {
    return fail("SLOT_QUOTA_EXCEEDED");
  }
  return ok;
}

/** Pemeriksaan kuota rombongan saat mengunci slot di dalam transaksi. */
export function checkRombonganQuota(
  alreadyBookedRombongan: number,
  requestedRombongan: number,
  maxRombonganQuota: number,
): RuleResult {
  if (
    !Number.isInteger(alreadyBookedRombongan) ||
    !Number.isInteger(requestedRombongan) ||
    !Number.isInteger(maxRombonganQuota) ||
    alreadyBookedRombongan < 0 ||
    requestedRombongan < 1 ||
    maxRombonganQuota < 1
  ) {
    return fail("SLOT_QUOTA_EXCEEDED");
  }
  return alreadyBookedRombongan + requestedRombongan <= maxRombonganQuota
    ? ok
    : fail("SLOT_QUOTA_EXCEEDED");
}

/**
 * Validasi jumlah jamaah rombongan beserta kebutuhan lansia & kursi roda:
 * - `participantCount` berada dalam rentang `[pkg.minParticipants, pkg.maxParticipants]`
 * - `elderlyCount` integer `0 <= elderlyCount <= participantCount`
 * - `wheelchairCount` integer `0 <= wheelchairCount <= participantCount`
 */
export function validateParticipantsAndSpecialNeeds(
  pkg: { minParticipants: number; maxParticipants: number },
  counts: {
    participantCount: number;
    elderlyCount: number;
    wheelchairCount: number;
  },
): RuleResult {
  const { participantCount, elderlyCount, wheelchairCount } = counts;
  if (
    !Number.isInteger(participantCount) ||
    participantCount < pkg.minParticipants ||
    participantCount > pkg.maxParticipants
  ) {
    return fail("PARTICIPANTS_OUT_OF_RANGE");
  }
  if (
    !Number.isInteger(elderlyCount) ||
    elderlyCount < 0 ||
    elderlyCount > participantCount
  ) {
    return fail("ELDERLY_COUNT_INVALID");
  }
  if (
    !Number.isInteger(wheelchairCount) ||
    wheelchairCount < 0 ||
    wheelchairCount > participantCount
  ) {
    return fail("WHEELCHAIR_COUNT_INVALID");
  }
  return ok;
}

/** Menentukan harga satuan aktif per jamaah dari database (tidak pernah dari input klien). */
export function resolveUnitPrice(pkg: {
  priceNormalPerPax: number;
  pricePromoPerPax: number;
}): number {
  const active =
    pkg.pricePromoPerPax > 0 ? pkg.pricePromoPerPax : pkg.priceNormalPerPax;
  if (!Number.isSafeInteger(active) || active < 0) {
    throw new Error("Harga paket tidak valid");
  }
  return active;
}

/** Total kontrak rombongan dalam integer rupiah (`unitPrice * participantCount`). */
export function computeTotal(unitPrice: number, participantCount: number): number {
  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
    throw new Error("Harga per jamaah tidak valid");
  }
  if (!Number.isSafeInteger(participantCount) || participantCount < 1) {
    throw new Error("Jumlah peserta tidak valid");
  }
  const total = unitPrice * participantCount;
  if (!Number.isSafeInteger(total)) {
    throw new Error("Total kontrak melebihi batas");
  }
  return total;
}

/**
 * Menghitung Down Payment (DP 50%) dibulatkan ke atas ke ribuan terdekat,
 * dan dipastikan tidak melebihi `totalPrice` (sesuai CHECK constraint database).
 */
export function computeDpAmount(totalPrice: number): number {
  if (!Number.isSafeInteger(totalPrice) || totalPrice < 0) {
    throw new Error("Total harga tidak valid");
  }
  if (totalPrice === 0) return 0;
  const roundedDp = Math.ceil((totalPrice * DP_RATIO) / 1000) * 1000;
  return Math.min(totalPrice, roundedDp);
}

export type GroupContractPricing = {
  unitPrice: number;
  estimatedTotalPrice: number;
  estimatedDpAmount: number;
  estimatedRemainingAmount: number;
  recommendedBusCount: number;
};

/** Kalkulasi lengkap estimasi kontrak rombongan B2B (Total All-In, DP 50%, Sisa Pelunasan, & Rekomendasi Bus). */
export function computeGroupContractPricing(
  pkg: { priceNormalPerPax: number; pricePromoPerPax: number },
  participantCount: number,
): GroupContractPricing {
  const unitPrice = resolveUnitPrice(pkg);
  const estimatedTotalPrice = computeTotal(unitPrice, participantCount);
  const estimatedDpAmount = computeDpAmount(estimatedTotalPrice);
  const estimatedRemainingAmount = estimatedTotalPrice - estimatedDpAmount;
  const recommendedBusCount = Math.max(
    1,
    Math.ceil(participantCount / IDEAL_BUS_CAPACITY),
  );

  return {
    unitPrice,
    estimatedTotalPrice,
    estimatedDpAmount,
    estimatedRemainingAmount,
    recommendedBusCount,
  };
}

/** Pesan umum ramah pengguna (tanpa membocorkan detail teknis internal). */
export const RULE_MESSAGES: Record<RuleError, string> = {
  INVALID_DATE: "Tanggal keberangkatan tidak valid.",
  TOO_SOON: `Permintaan jadwal rombongan paling lambat H-${MIN_DAYS_AHEAD} sebelum tanggal keberangkatan.`,
  TOO_FAR: "Tanggal keberangkatan melampaui batas periode perencanaan yang tersedia.",
  DATE_CLOSED: "Tanggal tersebut sedang ditutup operasional. Silakan pilih jadwal keberangkatan lain.",
  PACKAGE_UNAVAILABLE: "Paket perjalanan yang dipilih sedang tidak tersedia.",
  SLOT_REQUIRED: "Silakan pilih salah satu jadwal keberangkatan yang tersedia untuk paket ini.",
  SLOT_UNAVAILABLE: "Jadwal keberangkatan yang dipilih sudah ditutup atau tidak tersedia.",
  SLOT_QUOTA_EXCEEDED:
    "Kuota rombongan bus pada jadwal ini sudah penuh. Silakan pilih jadwal lain atau ajukan Paket Custom Rombongan.",
  PARTICIPANTS_OUT_OF_RANGE:
    "Jumlah peserta rombongan tidak sesuai dengan batas minimal atau maksimal paket.",
  ELDERLY_COUNT_INVALID:
    "Jumlah jamaah lansia tidak boleh negatif atau melebihi total peserta rombongan.",
  WHEELCHAIR_COUNT_INVALID:
    "Jumlah kebutuhan kursi roda tidak boleh negatif atau melebihi total peserta rombongan.",
};
