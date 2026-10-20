import "server-only";

/**
 * Catat error database dengan aman ke log server (Cloudflare Observability).
 * Hanya jenis, kode, dan pesan dari driver/Prisma (terpotong) — tidak pernah data baris/pengguna.
 */
export function logDbError(context: string, e: unknown): void {
  const err = e as {
    name?: string;
    code?: string;
    message?: string;
    meta?: {
      driverAdapterError?: {
        cause?: { kind?: string; code?: string; originalCode?: string; originalMessage?: string };
      };
    };
    cause?: { code?: string; message?: string };
  };
  const adapter = err?.meta?.driverAdapterError?.cause;
  const detail = {
    context,
    name: err?.name ?? typeof e,
    code: err?.code ?? err?.cause?.code,
    kind: adapter?.kind,
    pgCode: adapter?.originalCode ?? adapter?.code,
    message: (adapter?.originalMessage ?? err?.message ?? err?.cause?.message ?? String(e)).slice(
      0,
      500,
    ),
  };
  console.error(`DB error [${context}]: ${JSON.stringify(detail)}`);
}
