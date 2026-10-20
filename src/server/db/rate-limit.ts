import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

export type RateLimitRule = { limit: number; windowMs: number };

/** Mulai jendela waktu tetap (fixed window) yang memuat `now`. */
export function windowStartFor(now: Date, windowMs: number): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

/** Hash SHA-256 menggunakan Web Crypto API agar IP mentah tidak pernah disimpan di database. */
export async function hashKey(raw: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

/**
 * Rate limit di Postgres: satu UPSERT atomik per permintaan, konsisten di seluruh instance Worker.
 * Mengembalikan `true` jika permintaan masih dalam batas (`count <= rule.limit`).
 */
export async function hitRateLimit(
  db: PrismaClient,
  scope: string,
  identifier: string,
  rule: RateLimitRule,
  now = new Date(),
): Promise<boolean> {
  const key = `${scope}:${await hashKey(identifier)}`;
  const windowStart = windowStartFor(now, rule.windowMs);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "windowStart", "count")
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key", "windowStart") DO UPDATE SET "count" = "RateLimit"."count" + 1
    RETURNING "count"`;
  return (rows[0]?.count ?? Infinity) <= rule.limit;
}

/** Hapus jendela waktu lama untuk menjaga tabel tetap ringkas. */
export async function purgeRateLimits(
  db: PrismaClient,
  olderThan: Date,
): Promise<number> {
  const r = await db.rateLimit.deleteMany({
    where: { windowStart: { lt: olderThan } },
  });
  return r.count;
}
