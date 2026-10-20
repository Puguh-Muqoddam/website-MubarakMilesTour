"use client";

import { useActionState } from "react";
import type { BookingStatus } from "@/generated/prisma/enums";
import {
  type ChangeStatusState,
  updateBookingStatus,
} from "@/app/actions/admin";
import { STATUS_LABELS, STATUS_TRANSITIONS } from "@/server/booking/status";

const initial: ChangeStatusState = {};

export function StatusForm({
  bookingId,
  current,
}: {
  bookingId: string;
  current: BookingStatus;
}) {
  const [state, action, pending] = useActionState(updateBookingStatus, initial);
  const nextOptions = STATUS_TRANSITIONS[current];

  if (nextOptions.length === 0) {
    return (
      <span className="text-xs italic text-muted">
        Tahapan akhir ({STATUS_LABELS[current]})
      </span>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="from" value={current} />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`to-${bookingId}`} className="sr-only">
          Ubah status ke tahapan berikutnya
        </label>
        <select
          id={`to-${bookingId}`}
          name="to"
          defaultValue={nextOptions[0]}
          className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-emerald-mid focus:outline-none"
        >
          {nextOptions.map((s) => (
            <option key={s} value={s}>
              → {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="note"
          maxLength={300}
          placeholder="Catatan MOU / pembatalan (opsional)"
          aria-label="Catatan perubahan status"
          className="w-48 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs text-ink focus:border-emerald-mid focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-emerald-deep px-3.5 py-1.5 text-xs font-bold text-cream transition-colors hover:bg-emerald-mid disabled:opacity-60"
        >
          {pending ? "..." : "Simpan Status"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-xs font-semibold text-promo-red">
          {state.error}
        </p>
      )}
    </form>
  );
}
