import "server-only";
import { SITE } from "./site";

const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA"; // test key resmi Cloudflare

export function getTurnstileSiteKey(): string {
  const v = process.env.TURNSTILE_SITE_KEY;
  if (v) return v;
  if (process.env.NODE_ENV === "production") throw new Error("TURNSTILE_SITE_KEY belum diisi");
  return TURNSTILE_TEST_SITE_KEY;
}

/** Nomor WA PIC (62…) dari env; di dev fallback ke nomor resmi brosur agar mudah diuji. */
export function getContactWhatsapp(): string {
  const v = process.env.BOOKING_WHATSAPP_NUMBER;
  if (v && /^62\d{8,13}$/.test(v)) return v;
  if (process.env.NODE_ENV === "production") throw new Error("BOOKING_WHATSAPP_NUMBER belum diisi");
  return SITE.contact.whatsappDefault62;
}

export function formatPhoneId(phone62: string): string {
  const rest = phone62.replace(/^62/, "0");
  if (rest.length <= 4) return rest;
  return `${rest.slice(0, 4)}-${rest.slice(4, 8)}-${rest.slice(8)}`;
}
