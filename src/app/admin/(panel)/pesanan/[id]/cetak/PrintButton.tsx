"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-extrabold text-gold transition-colors hover:bg-emerald-mid"
    >
      <Printer className="h-4 w-4" />
      <span>Cetak / Simpan PDF (A4)</span>
    </button>
  );
}
