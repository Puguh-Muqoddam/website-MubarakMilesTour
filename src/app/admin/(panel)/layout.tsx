import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/admin";
import { SITE } from "@/lib/site";
import { requireAdminPage } from "@/server/auth/admin";

// Lapis pertama: cek sesi Supabase + allowlist ADMIN_EMAILS untuk seluruh halaman panel admin.
// Lapis kedua diterapkan di setiap Server Action admin (requireAdminAction).
export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdminPage();

  return (
    <>
      <header className="border-b border-cream/15 bg-emerald-deep text-cream print:hidden">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt={`Logo ${SITE.name}`}
              width={40}
              height={40}
              className="h-10 w-10 object-contain drop-shadow-sm"
              priority
            />
            <div>
              <Link
                href="/admin"
                className="font-sans text-lg font-extrabold tracking-tight text-cream hover:text-gold"
              >
                Admin {SITE.name}
              </Link>
              <p className="text-xs text-cream/75">
                Manajemen Kontrak Rombongan, MOU, &amp; Termin DP 50%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <Link
              href="/"
              className="font-semibold text-cream/85 underline-offset-4 hover:text-gold hover:underline"
            >
              Lihat Website
            </Link>
            <span className="rounded-full bg-emerald-mid px-3 py-1 font-medium text-gold">
              {admin.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-cream/25 px-3.5 py-1 font-bold text-cream transition-colors hover:bg-gold hover:text-ink"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-site px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:p-0">
        {children}
      </main>
    </>
  );
}
