import { z } from "zod";
import { ORGANIZATION_TYPES, ORIGIN_REGIONS } from "./config";

/** Normalisasi nomor WA Indonesia ke format 628…; null jika tidak valid. */
export function normalizeWhatsapp(raw: string): string | null {
  let n = raw.replace(/[\s\-().]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("0")) n = `62${n.slice(1)}`;
  else if (n.startsWith("8")) n = `62${n}`;
  return /^628\d{7,12}$/.test(n) ? n : null;
}

const trimmed = (max: number) => z.string().trim().max(max);

const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.email().safeParse(v).success, {
    message: "Format email tidak valid",
  });

/**
 * Skema input Permintaan Penawaran & Booking Jadwal Rombongan B2B.
 * Hanya identitas PIC, komunitas, dan preferensi jadwal yang diterima dari klien.
 * Harga satuan, estimasi total kontrak, dan DP 50% TIDAK PERNAH diterima dari klien (.strict()).
 */
export const bookingInputSchema = z
  .object({
    packageId: trimmed(40).min(1, "Paket wajib dipilih"),
    departureSlotId: optionalText(40),
    requestedDepartDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal keberangkatan tidak valid"),
    participantCount: z.coerce.number().int().min(1).max(200),
    elderlyCount: z.coerce.number().int().min(0).max(200).default(0),
    wheelchairCount: z.coerce.number().int().min(0).max(200).default(0),
    picName: trimmed(100).min(2, "Nama PIC minimal 2 karakter"),
    whatsapp: z
      .string()
      .max(20)
      .transform((v, ctx) => {
        const n = normalizeWhatsapp(v);
        if (!n) {
          ctx.addIssue({
            code: "custom",
            message: "Nomor WhatsApp tidak valid",
          });
          return z.NEVER;
        }
        return n;
      }),
    email: optionalEmail,
    organizationName: trimmed(150).min(
      3,
      "Nama Majelis / Komunitas / Instansi minimal 3 karakter",
    ),
    organizationType: z.enum(ORGANIZATION_TYPES),
    originRegion: z.enum(ORIGIN_REGIONS),
    originCity: trimmed(100).min(2, "Kota/kabupaten asal minimal 2 karakter"),
    notes: optionalText(600),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.elderlyCount > data.participantCount) {
      ctx.addIssue({
        code: "custom",
        path: ["elderlyCount"],
        message: "Jumlah jamaah lansia tidak boleh melebihi total peserta",
      });
    }
    if (data.wheelchairCount > data.participantCount) {
      ctx.addIssue({
        code: "custom",
        path: ["wheelchairCount"],
        message: "Jumlah kebutuhan kursi roda tidak boleh melebihi total peserta",
      });
    }
  });

export type BookingInput = z.output<typeof bookingInputSchema>;
