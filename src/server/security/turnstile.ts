import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA"; // test secret key resmi Cloudflare

/** Ambil Turnstile secret key dari env; di non-produksi fallback ke test secret key resmi Cloudflare. */
export function resolveTurnstileSecretKey(): string {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret && secret.length >= 10) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("TURNSTILE_SECRET_KEY belum dikonfigurasi");
  }
  return TURNSTILE_TEST_SECRET_KEY;
}

/** Verifikasi token Turnstile di server. Gagal tertutup (fail-closed): error jaringan = tidak lolos. */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp?: string,
): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp && remoteIp !== "unknown") {
    body.append("remoteip", remoteIp);
  }
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
