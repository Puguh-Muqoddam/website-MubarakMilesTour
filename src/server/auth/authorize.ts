// Logika otorisasi admin yang murni (tanpa I/O) agar mudah diuji unit test.

export type AuthUser = { id: string; email?: string | null } | null | undefined;

export type AdminIdentity = { id: string; email: string };

/** Lolos hanya jika sesi pengguna valid DAN email terdaftar di allowlist ADMIN_EMAILS (case-insensitive). */
export function authorizeAdmin(
  user: AuthUser,
  allowlist: readonly string[],
): AdminIdentity | null {
  if (!user?.email) return null;
  const email = user.email.trim().toLowerCase();
  const normalizedList = allowlist.map((e) => e.trim().toLowerCase());
  return normalizedList.includes(email) ? { id: user.id, email } : null;
}
