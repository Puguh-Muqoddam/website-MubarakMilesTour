"use client";

import { useActionState, useId } from "react";
import { type LoginState, login } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const uid = useId();
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form
      action={action}
      className="mt-6 space-y-5 rounded-3xl border border-line bg-cream p-6 shadow-md sm:p-8"
    >
      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor={`${uid}-email`}
          className="block text-sm font-extrabold text-ink"
        >
          Email Pengelola Resmi
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="admin@mubarakmilestour.com"
          className="mt-1.5 block w-full rounded-xl border border-line bg-sand/50 px-3.5 py-3 text-base text-ink focus:border-emerald-deep focus:outline-none focus:ring-2 focus:ring-emerald-deep/25"
        />
      </div>

      <div>
        <label
          htmlFor={`${uid}-password`}
          className="block text-sm font-extrabold text-ink"
        >
          Kata Sandi
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          required
          maxLength={200}
          autoComplete="current-password"
          className="mt-1.5 block w-full rounded-xl border border-line bg-sand/50 px-3.5 py-3 text-base text-ink focus:border-emerald-deep focus:outline-none focus:ring-2 focus:ring-emerald-deep/25"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Memverifikasi Akses…" : "Masuk ke Portal Pengelola"}
      </Button>
    </form>
  );
}
