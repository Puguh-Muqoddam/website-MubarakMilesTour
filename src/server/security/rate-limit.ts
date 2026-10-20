import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { hitRateLimit, type RateLimitRule } from "@/server/db/rate-limit";

export const BOOKING_RATE_LIMIT: RateLimitRule = {
  limit: 5,
  windowMs: 10 * 60 * 1000, // Maksimal 5 permintaan per 10 menit per hash IP
};

// Cadangan in-memory HANYA untuk lokal (NODE_ENV !== "production") bila DB belum dikonfigurasi.
const memory = new Map<string, number[]>();

export function memoryLimit(
  key: string,
  rule: RateLimitRule = BOOKING_RATE_LIMIT,
  now = Date.now(),
): boolean {
  const hits = (memory.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (hits.length >= rule.limit) {
    memory.set(key, hits);
    return false;
  }
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.clear();
  return true;
}

/**
 * Produksi: wajib lewat Postgres (`RateLimit`); bila DB gagal maka lempar error (gagal tertutup / fail-closed).
 * Lokal/Preview non-produksi: fallback ke in-memory bila DB belum dikonfigurasi.
 */
export async function checkRateLimit(
  db: PrismaClient | null,
  scope: string,
  identifier: string,
  rule: RateLimitRule = BOOKING_RATE_LIMIT,
  isProduction = process.env.NODE_ENV === "production",
): Promise<boolean> {
  if (!db) {
    if (isProduction) throw new Error("Database rate limit tidak tersedia");
    return memoryLimit(`${scope}:${identifier}`, rule);
  }
  try {
    return await hitRateLimit(db, scope, identifier, rule);
  } catch (e) {
    if (isProduction) {
      throw new Error("Rate limit tidak tersedia", { cause: e });
    }
    return memoryLimit(`${scope}:${identifier}`, rule);
  }
}
