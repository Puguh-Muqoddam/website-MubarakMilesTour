"use client";

import { useActionState } from "react";
import { addPaymentLog, type PaymentActionState } from "@/app/actions/admin";
import { PAYMENT_TYPE_LABELS } from "@/server/booking/config";

const initial: PaymentActionState = {};

export function PaymentForm({
  bookingId,
  suggestedDpAmount,
  suggestedRemainingAmount,
}: {
  bookingId: string;
  suggestedDpAmount: number;
  suggestedRemainingAmount: number;
}) {
  const [state, action, pending] = useActionState(addPaymentLog, initial);

  return (
    <details className="mt-2 rounded-xl border border-line bg-sand/70 p-2.5 text-xs">
      <summary className="cursor-pointer font-bold text-emerald-deep select-none hover:text-emerald-mid">
        + Catat Pembayaran Termin (DP 50% / Pelunasan)
      </summary>
      <form action={action} className="mt-2.5 space-y-2">
        <input type="hidden" name="bookingId" value={bookingId} />
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`pay-type-${bookingId}`} className="sr-only">
            Jenis Pembayaran
          </label>
          <select
            id={`pay-type-${bookingId}`}
            name="paymentType"
            defaultValue="DP_50"
            className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-emerald-mid focus:outline-none"
          >
            <option value="DP_50">{PAYMENT_TYPE_LABELS.DP_50}</option>
            <option value="PELUNASAN">{PAYMENT_TYPE_LABELS.PELUNASAN}</option>
            <option value="REFUND">{PAYMENT_TYPE_LABELS.REFUND}</option>
          </select>

          <label htmlFor={`pay-amount-${bookingId}`} className="sr-only">
            Nominal Rupiah
          </label>
          <input
            id={`pay-amount-${bookingId}`}
            type="number"
            name="amount"
            required
            min={1000}
            max={2000000000}
            step={1000}
            defaultValue={
              suggestedDpAmount > 0
                ? suggestedDpAmount
                : suggestedRemainingAmount
            }
            placeholder="Nominal (Rp)"
            className="w-36 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-emerald-mid focus:outline-none"
          />

          <input
            type="text"
            name="note"
            maxLength={300}
            placeholder="No. referensi transfer / bank (opsional)"
            aria-label="Catatan transfer"
            className="w-48 rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs text-ink focus:border-emerald-mid focus:outline-none"
          />

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-extrabold text-ink transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {pending ? "..." : "Catat Pembayaran"}
          </button>
        </div>
        {state.error && (
          <p role="alert" className="text-xs font-semibold text-promo-red">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="text-xs font-semibold text-emerald-mid">
            Pembayaran berhasil dicatat ke riwayat termin.
          </p>
        )}
      </form>
    </details>
  );
}
