"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PaymentType } from "@/generated/prisma/enums";
import { getServerEnv } from "@/lib/env";
import { requireAdminAction, UnauthorizedError } from "@/server/auth/admin";
import { authorizeAdmin } from "@/server/auth/authorize";
import { createSupabaseServerClient } from "@/server/auth/supabase";
import { ALL_STATUSES } from "@/server/booking/status";
import {
  changeGroupBookingStatus,
  recordGroupPayment,
} from "@/server/db/admin";
import { getDb, isDbConfigured } from "@/server/db/client";
import { logDbError } from "@/server/db/log";
import { checkRateLimit } from "@/server/security/rate-limit";

export type LoginState = { error?: string };

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    password: z.string().min(1).max(200),
  })
  .strict();

const GENERIC_LOGIN_ERROR =
  "Email atau kata sandi salah, atau akun tidak terdaftar sebagai pengelola.";

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR };

  try {
    const h = await headers();
    const ip = h.get("cf-connecting-ip") ?? "unknown";
    const db = (await isDbConfigured()) ? await getDb() : null;

    if (
      !(await checkRateLimit(db, "admin-login", ip, {
        limit: 10,
        windowMs: 10 * 60 * 1000,
      }))
    ) {
      return {
        error: "Terlalu banyak percobaan login. Silakan tunggu beberapa menit.",
      };
    }

    // Allowlist dicek sebelum dan sesudah autentikasi Supabase
    const allowlist = getServerEnv().ADMIN_EMAILS;
    if (!allowlist.includes(parsed.data.email)) {
      return { error: GENERIC_LOGIN_ERROR };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !authorizeAdmin(data.user, allowlist)) {
      await supabase.auth.signOut();
      return { error: GENERIC_LOGIN_ERROR };
    }
  } catch (e) {
    logDbError("admin-login", e);
    return { error: "Login belum dapat diproses. Silakan coba lagi." };
  }

  redirect("/admin");
}

export async function logout(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Tetap arahkan ke halaman login
  }
  redirect("/admin/login");
}

const statusEnum = z.enum(ALL_STATUSES as unknown as [string, ...string[]]);
const changeStatusSchema = z
  .object({
    bookingId: z.string().trim().min(1).max(40),
    from: statusEnum,
    to: statusEnum,
    note: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .strict();

export type ChangeStatusState = { ok?: boolean; error?: string };

export async function updateBookingStatus(
  _prev: ChangeStatusState,
  formData: FormData,
): Promise<ChangeStatusState> {
  let actor;
  try {
    actor = await requireAdminAction(); // Lapis kedua: proteksi di setiap Server Action
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return { error: "Sesi berakhir. Silakan login kembali." };
    }
    throw e;
  }

  const parsed = changeStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    from: formData.get("from"),
    to: formData.get("to"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) return { error: "Permintaan perubahan status tidak valid." };

  try {
    const db = await getDb();
    const r = await changeGroupBookingStatus(db, {
      bookingId: parsed.data.bookingId,
      expectedFrom: parsed.data.from as (typeof ALL_STATUSES)[number],
      to: parsed.data.to as (typeof ALL_STATUSES)[number],
      note: parsed.data.note,
      actorEmail: actor.email,
    });
    if (!r.ok) {
      const msg = {
        NOT_FOUND: "Data rombongan tidak ditemukan.",
        INVALID_TRANSITION: "Perubahan tahapan status tersebut tidak diizinkan.",
        STALE: "Status sudah diubah oleh admin lain. Silakan muat ulang halaman.",
      }[r.error];
      return { error: msg };
    }
  } catch (e) {
    logDbError("admin-ubah-status", e);
    return { error: "Gagal menyimpan perubahan status. Silakan coba lagi." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

const PAYMENT_TYPES = ["DP_50", "PELUNASAN", "REFUND"] as const satisfies readonly PaymentType[];
const paymentSchema = z
  .object({
    bookingId: z.string().trim().min(1).max(40),
    paymentType: z.enum(PAYMENT_TYPES),
    amount: z.coerce.number().int().min(1_000).max(2_000_000_000),
    note: z
      .string()
      .trim()
      .max(300)
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .strict();

export type PaymentActionState = { ok?: boolean; error?: string };

export async function addPaymentLog(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  let actor;
  try {
    actor = await requireAdminAction(); // Lapis kedua: proteksi di setiap Server Action
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return { error: "Sesi berakhir. Silakan login kembali." };
    }
    throw e;
  }

  const parsed = paymentSchema.safeParse({
    bookingId: formData.get("bookingId"),
    paymentType: formData.get("paymentType"),
    amount: formData.get("amount"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Data nominal atau jenis pembayaran tidak valid." };
  }

  try {
    const db = await getDb();
    const r = await recordGroupPayment(db, {
      bookingId: parsed.data.bookingId,
      paymentType: parsed.data.paymentType,
      amount: parsed.data.amount,
      note: parsed.data.note,
      actorEmail: actor.email,
    });
    if (!r.ok) {
      return { error: "Gagal mencatat pembayaran untuk rombongan ini." };
    }
  } catch (e) {
    logDbError("admin-catat-pembayaran", e);
    return { error: "Gagal menyimpan riwayat pembayaran. Silakan coba lagi." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
