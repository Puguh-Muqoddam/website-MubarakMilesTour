"use server";

import { headers } from "next/headers";
import { getContactWhatsapp } from "@/lib/public-config";
import { bookingInputSchema } from "@/server/booking/input";
import { type ContractDeadlines, RULE_MESSAGES } from "@/server/booking/rules";
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  type GroupBookingWhatsappSummary,
} from "@/server/booking/whatsapp";
import {
  createFixtureGroupBooking,
  createGroupBooking,
} from "@/server/db/bookings";
import { getDb, isDbConfigured } from "@/server/db/client";
import { logDbError } from "@/server/db/log";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  resolveTurnstileSecretKey,
  verifyTurnstile,
} from "@/server/security/turnstile";

export type BookingActionState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
    }
  | {
      status: "success";
      summary: GroupBookingWhatsappSummary;
      deadlines: ContractDeadlines;
      recommendedBusCount: number;
      whatsappUrl: string;
    };

const GENERIC_ERROR =
  "Permintaan penawaran belum dapat diproses saat ini. Silakan coba lagi atau hubungi tim kami via WhatsApp.";

const FIELD_NAMES = [
  "packageId",
  "departureSlotId",
  "requestedDepartDate",
  "participantCount",
  "elderlyCount",
  "wheelchairCount",
  "picName",
  "whatsapp",
  "email",
  "organizationName",
  "organizationType",
  "originRegion",
  "originCity",
  "notes",
] as const;

const FIELD_MESSAGES: Record<string, string> = {
  packageId: "Silakan pilih paket perjalanan rombongan.",
  departureSlotId: "Jadwal keberangkatan tidak valid.",
  requestedDepartDate: "Pilih tanggal rencana keberangkatan yang valid.",
  participantCount: "Jumlah peserta rombongan tidak valid.",
  elderlyCount:
    "Jumlah jamaah lansia tidak valid atau melebihi total peserta.",
  wheelchairCount:
    "Jumlah kebutuhan kursi roda tidak valid atau melebihi total peserta.",
  picName: "Nama lengkap PIC wajib diisi (2–100 karakter).",
  whatsapp: "Nomor WhatsApp PIC tidak valid (contoh: 0858xxxxxxx).",
  email: "Format alamat email tidak valid.",
  organizationName:
    "Nama Majelis / Komunitas / Instansi wajib diisi (3–150 karakter).",
  organizationType: "Pilih jenis lembaga/komunitas.",
  originRegion: "Pilih wilayah asal rombongan.",
  originCity: "Kota/kabupaten asal wajib diisi (2–100 karakter).",
  notes: "Catatan tambahan maksimal 600 karakter.",
};

export async function submitGroupBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") ?? "unknown";
    const dbReady = await isDbConfigured();
    const db = dbReady ? await getDb() : null;

    if (!db && process.env.NODE_ENV === "production") {
      throw new Error("Koneksi database produksi belum tersedia");
    }

    // 1. Rate Limit per hash IP (maks 5 permintaan / 10 menit)
    if (!(await checkRateLimit(db, "booking", ip))) {
      return {
        status: "error",
        message:
          "Terlalu banyak percobaan pengiriman dalam waktu singkat. Silakan tunggu beberapa menit.",
      };
    }

    // 2. Honeypot Anti-Bot (ditolak dengan pesan umum tanpa petunjuk teknis)
    const honeypot = formData.get("website");
    if (typeof honeypot === "string" && honeypot.length > 0) {
      return { status: "error", message: GENERIC_ERROR };
    }

    // 3. Verifikasi Cloudflare Turnstile
    const turnstileSecret = resolveTurnstileSecretKey();
    const token = formData.get("cf-turnstile-response");
    if (
      typeof token !== "string" ||
      !(await verifyTurnstile(token, turnstileSecret, ip))
    ) {
      return {
        status: "error",
        message:
          "Verifikasi keamanan anti-bot gagal atau kedaluwarsa. Silakan centang ulang lalu kirim kembali.",
      };
    }

    // 4. Validasi Skema Input Zod (.strict())
    const raw: Record<string, FormDataEntryValue> = {};
    for (const name of FIELD_NAMES) {
      const v = formData.get(name);
      if (v !== null) raw[name] = v;
    }

    const parsed = bookingInputSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = FIELD_MESSAGES[key] ?? issue.message;
        }
      }
      return {
        status: "error",
        message: "Mohon periksa kembali isian formulir penawaran rombongan.",
        fieldErrors,
      };
    }

    // 5. Eksekusi Transaksi Pembuatan Penawaran Rombongan (dengan SELECT ... FOR UPDATE di DB)
    const now = new Date();
    const result = db
      ? await createGroupBooking(db, parsed.data, now)
      : createFixtureGroupBooking(parsed.data, now);

    if (!result.ok) {
      return {
        status: "error",
        message: RULE_MESSAGES[result.error] ?? GENERIC_ERROR,
      };
    }

    const whatsappPhone = getContactWhatsapp();
    const whatsappUrl = buildWhatsappUrl(
      whatsappPhone,
      buildWhatsappMessage(result.summary),
    );

    return {
      status: "success",
      summary: result.summary,
      deadlines: result.deadlines,
      recommendedBusCount: result.recommendedBusCount,
      whatsappUrl,
    };
  } catch (e) {
    // Log error teknis tanpa pernah menyertakan data pribadi PIC/rombongan
    logDbError("permintaan-penawaran", e);
    return { status: "error", message: GENERIC_ERROR };
  }
}
