import type { BookingStatus } from "@/generated/prisma/enums";
import { BOOKING_STATUS_LABELS, BOOKING_STATUSES } from "./config";

/**
 * Transisi status resmi pelayanan rombongan B2B sesuai PPBI §6.2:
 * MENUNGGU_PENAWARAN -> MOU_DITANDATANGANI -> DP_DITERIMA -> LUNAS -> SELESAI (atau BATAL).
 * SELESAI dan BATAL adalah status terminal (akhir).
 */
export const STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  MENUNGGU_PENAWARAN: ["MOU_DITANDATANGANI", "BATAL"],
  MOU_DITANDATANGANI: ["DP_DITERIMA", "BATAL"],
  DP_DITERIMA: ["LUNAS", "BATAL"],
  LUNAS: ["SELESAI", "BATAL"],
  SELESAI: [],
  BATAL: [],
};

export const STATUS_LABELS = BOOKING_STATUS_LABELS;
export const ALL_STATUSES = BOOKING_STATUSES;

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

/** Dokumen penawaran/lampiran MOU/invoice dapat dicetak selama pesanan tidak berstatus BATAL. */
export function canPrintDocument(status: BookingStatus): boolean {
  return status !== "BATAL";
}
