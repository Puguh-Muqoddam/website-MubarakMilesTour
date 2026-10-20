import "server-only";
import { redirect } from "next/navigation";
import { getServerEnv } from "@/lib/env";
import { type AdminIdentity, authorizeAdmin } from "./authorize";
import { createSupabaseServerClient } from "./supabase";

/** Identitas admin dari sesi saat ini, atau null. `getUser()` memverifikasi token langsung ke server Supabase. */
export async function getAdmin(): Promise<AdminIdentity | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return authorizeAdmin(data.user, getServerEnv().ADMIN_EMAILS);
  } catch {
    return null;
  }
}

/** Lapis 1 (Layout & Halaman Admin): arahkan ke `/admin/login` bila belum terautentikasi sebagai admin. */
export async function requireAdminPage(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Tidak diizinkan");
  }
}

/** Lapis 2 (Setiap Server Action Admin): lempar error bila bukan admin (tanpa mengandalkan layout/middleware). */
export async function requireAdminAction(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}
