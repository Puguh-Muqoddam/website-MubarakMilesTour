import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { SITE } from "@/lib/site";
import { getAdmin } from "@/server/auth/admin";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-deep text-gold"
        >
          <Compass className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-ink">
            Portal Pengelola
          </h1>
          <p className="text-xs font-semibold text-muted">
            {SITE.name} — Khusus Tim Manajemen B2B
          </p>
        </div>
      </div>

      <LoginForm />

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs font-bold text-emerald-deep underline-offset-4 hover:underline"
        >
          ← Kembali ke Halaman Publik
        </Link>
      </div>
    </main>
  );
}
