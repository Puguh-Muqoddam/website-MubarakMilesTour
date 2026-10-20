import "server-only";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Runtime: binding Cloudflare Hyperdrive -> Supabase Session Pooler (port 5432).
// Satu klien per request (React cache) dengan maxUses: 1 agar koneksi I/O tidak bocor lintas request di Workers.
export function createPrismaClient(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, maxUses: 1 }) });
}

async function resolveConnectionString(): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cfEnv = env as { HYPERDRIVE?: { connectionString?: string } };
    if (cfEnv.HYPERDRIVE?.connectionString) {
      return cfEnv.HYPERDRIVE.connectionString;
    }
  } catch {
    // Di luar konteks Cloudflare (misal `next dev` lokal tanpa simulasi binding)
  }
  if (process.env.NODE_ENV !== "production" && process.env.DIRECT_URL) {
    return process.env.DIRECT_URL;
  }
  return null;
}

export const getDb = cache(async (): Promise<PrismaClient> => {
  const cs = await resolveConnectionString();
  if (!cs) throw new Error("Koneksi database (HYPERDRIVE / DIRECT_URL) tidak tersedia");
  return createPrismaClient(cs);
});

/** Apakah koneksi DB tersedia (dipakai untuk menentukan apakah harus fallback ke fixture di non-produksi). */
export async function isDbConfigured(): Promise<boolean> {
  return (await resolveConnectionString()) !== null;
}
