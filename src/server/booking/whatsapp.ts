import { formatBookingCodeDisplay } from "./code";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value);
}

/** "2027-02-01" -> "Senin, 1 Februari 2027" */
export function formatDateId(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export type GroupBookingWhatsappSummary = {
  code: string;
  packageName: string;
  scheduleLabel?: string;
  requestedDepartDate: string;
  participantCount: number;
  elderlyCount: number;
  wheelchairCount: number;
  unitPrice: number;
  estimatedTotalPrice: number;
  estimatedDpAmount: number;
  picName: string;
  organizationName: string;
  organizationTypeLabel: string;
  originCity: string;
  originRegionLabel: string;
  notes?: string;
};

/**
 * Menyusun pesan WhatsApp resmi dari PIC Rombongan ke Tim Mubarak Miles Tour (Tiya)
 * untuk pengajuan penawaran kontrak B2B & penjadwalan tanda tangan MOU.
 */
export function buildWhatsappMessage(s: GroupBookingWhatsappSummary): string {
  const displayCode = formatBookingCodeDisplay(s.code);
  const scheduleInfo = s.scheduleLabel
    ? `${s.scheduleLabel} (${formatDateId(s.requestedDepartDate)})`
    : `Jadwal Custom — ${formatDateId(s.requestedDepartDate)}`;

  const lines: string[] = [
    "Assalamu'alaikum Tim Mubarak Miles Tour, saya ingin mengajukan Permintaan Penawaran & Booking Jadwal Rombongan.",
    "",
    `Kode Penawaran: ${displayCode}`,
    `Nama Majelis/Instansi: ${s.organizationName} (${s.organizationTypeLabel})`,
    `Nama PIC: ${s.picName}`,
    `Asal Rombongan: ${s.originCity} (${s.originRegionLabel})`,
    `Paket: ${s.packageName}`,
    `Jadwal Keberangkatan: ${scheduleInfo}`,
    `Jumlah Jamaah: ${s.participantCount} orang (Lansia: ${s.elderlyCount} orang, Kursi Roda: ${s.wheelchairCount} unit)`,
    `Harga Satuan All-In: ${formatRupiah(s.unitPrice)} / jamaah`,
    `Estimasi Total Kontrak: ${formatRupiah(s.estimatedTotalPrice)}`,
    `Estimasi DP 50% (H-30): ${formatRupiah(s.estimatedDpAmount)}`,
  ];

  if (s.notes) {
    lines.push(`Catatan Tambahan: ${s.notes}`);
  }

  lines.push(
    "",
    "Mohon informasi draf MOU rombongan serta jadwal koordinasi lebih lanjut. Terima kasih.",
  );

  return lines.join("\n");
}

export function buildWhatsappUrl(phone: string, message: string): string {
  if (!/^62\d{8,13}$/.test(phone)) {
    throw new Error("Nomor WA pengelola tidak valid");
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
