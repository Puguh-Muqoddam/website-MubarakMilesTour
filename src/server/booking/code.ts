// Kode penawaran rombongan 8 karakter dari CSPRNG.
// Alfabet tanpa karakter yang rawan tertukar saat dibaca/diketik (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 karakter
export const BOOKING_CODE_PREFIX = "MMT";

export function generateBookingCode(length = 8): string {
  const out: string[] = [];
  // Rejection sampling agar distribusi seragam tanpa modulo bias.
  const limit = 256 - (256 % ALPHABET.length);
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of bytes) {
      if (b < limit && out.length < length) {
        out.push(ALPHABET[b % ALPHABET.length]);
      }
    }
  }
  return out.join("");
}

/** Format tampilan ramah manusia (contoh: `7K4P9X2A` -> `MMT-7K4P9X2A`). */
export function formatBookingCodeDisplay(code: string): string {
  const normalized = normalizeBookingCode(code);
  return `${BOOKING_CODE_PREFIX}-${normalized}`;
}

/** Bersihkan prefiks `MMT-` bila ada dan ubah ke huruf kapital (mengembalikan kode 8 karakter). */
export function normalizeBookingCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/^MMT[-_\s]?/, "");
}
