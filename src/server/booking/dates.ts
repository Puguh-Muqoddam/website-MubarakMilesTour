import {
  BUSINESS_TIME_ZONE,
  DP_DEADLINE_DAYS_BEFORE,
  DP_SHORT_NOTICE_GRACE_DAYS,
  FULL_PAYMENT_DEADLINE_DAYS_BEFORE,
  MAX_DAYS_AHEAD,
  MIN_DAYS_AHEAD,
} from "./config";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** Tanggal hari ini menurut zona waktu bisnis (WIB / Asia/Jakarta), format YYYY-MM-DD. */
export function todayInJakarta(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Parse YYYY-MM-DD ketat ke Date 00:00 UTC; null jika tidak valid (mis. 2027-02-30). */
export function parseDateOnly(value: string): Date | null {
  if (!DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
}

/** Format Date 00:00 UTC ke string YYYY-MM-DD. */
export function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Geser tanggal YYYY-MM-DD sebanyak `days` hari (positif atau negatif). */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateOnly(dateStr);
  if (!d) throw new Error("Tanggal tidak valid");
  return formatDateOnly(new Date(d.getTime() + days * DAY_MS));
}

/** Selisih hari kalender (`toDate - fromDate`). */
export function daysBetween(fromDate: string, toDate: string): number {
  const a = parseDateOnly(fromDate);
  const b = parseDateOnly(toDate);
  if (!a || !b) throw new Error("Tanggal tidak valid");
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/** Rentang tanggal keberangkatan yang dapat diajukan oleh komunitas (WIB): H-14 s.d. +540 hari. */
export function bookingWindow(now: Date): { from: string; to: string } {
  const today = todayInJakarta(now);
  return {
    from: addDays(today, MIN_DAYS_AHEAD),
    to: addDays(today, MAX_DAYS_AHEAD),
  };
}

export type ContractDeadlines = {
  dpDeadline: string;
  fullPaymentDeadline: string;
  daysUntilDeparture: number;
};

/**
 * Menghitung tenggat pembayaran kontrak rombongan sesuai PPBI §6.2:
 * - Pelunasan 50%: paling lambat H-14 sebelum keberangkatan.
 * - DP 50%: paling lambat H-30 sebelum keberangkatan.
 *   Jika pemesanan diajukan kurang dari H-30 (namun masih >= H-14),
 *   tenggat DP adalah +2 hari sejak tanggal pemesanan (dibatasi tidak melewati H-14).
 */
export function computeContractDeadlines(
  departDate: string,
  bookingDateWib: string,
): ContractDeadlines {
  const daysUntilDeparture = daysBetween(bookingDateWib, departDate);
  const fullPaymentDeadline = addDays(departDate, -FULL_PAYMENT_DEADLINE_DAYS_BEFORE);
  const standardDpDeadline = addDays(departDate, -DP_DEADLINE_DAYS_BEFORE);

  let dpDeadline = standardDpDeadline;
  if (dpDeadline < bookingDateWib) {
    const graceDeadline = addDays(bookingDateWib, DP_SHORT_NOTICE_GRACE_DAYS);
    dpDeadline = graceDeadline <= fullPaymentDeadline ? graceDeadline : fullPaymentDeadline;
  }

  return {
    dpDeadline,
    fullPaymentDeadline,
    daysUntilDeparture,
  };
}
