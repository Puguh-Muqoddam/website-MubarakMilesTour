"use client";

import { useSyncExternalStore } from "react";
import {
  CheckCircle2,
  FileSignature,
  MessageCircle,
  WalletCards,
} from "lucide-react";
import type { BookingActionState } from "@/app/actions/booking";
import { BOOKING_STORAGE_KEY } from "@/components/booking/BookingForm";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SITE, formatRupiah } from "@/lib/site";
import { formatBookingCodeDisplay } from "@/server/booking/code";
import { formatDateId } from "@/server/booking/whatsapp";

type SuccessState = Extract<BookingActionState, { status: "success" }>;

function readStored(): string | null {
  try {
    return sessionStorage.getItem(BOOKING_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseStored(
  raw: string | null,
  code: string | null,
): SuccessState | null {
  if (!raw || !code) return null;
  try {
    const v = JSON.parse(raw) as SuccessState;
    return v.status === "success" &&
      v.summary.code === code &&
      v.whatsappUrl.startsWith("https://wa.me/")
      ? v
      : null;
  } catch {
    return null;
  }
}

export function SuccessDetails({
  code,
  fallbackWhatsapp,
}: {
  code: string | null;
  fallbackWhatsapp: string;
}) {
  const raw = useSyncExternalStore(
    () => () => {},
    readStored,
    () => null,
  );
  const data = parseStored(raw, code);
  const displayCode = code ? formatBookingCodeDisplay(code) : null;

  const fallbackWaUrl = `https://wa.me/${fallbackWhatsapp}?text=${encodeURIComponent(
    displayCode
      ? `Assalamu'alaikum Tim Mubarak Miles Tour, saya ingin menindaklanjuti Permintaan Penawaran Rombongan dengan Kode Penawaran ${displayCode}.`
      : "Assalamu'alaikum Tim Mubarak Miles Tour, saya ingin menindaklanjuti Permintaan Penawaran Rombongan kami.",
  )}`;

  const remainingAmount = data
    ? data.summary.estimatedTotalPrice - data.summary.estimatedDpAmount
    : 0;

  return (
    <div className="rounded-3xl border border-line bg-cream p-6 shadow-lg sm:p-10">
      <div className="flex items-center gap-2.5 text-success">
        <CheckCircle2 className="h-6 w-6 shrink-0" />
        <Eyebrow>Permintaan Penawaran Rombongan Tercatat</Eyebrow>
      </div>

      <h1 className="mt-3 font-sans text-3xl font-extrabold text-ink sm:text-4xl">
        Alhamdulillah, Data Rombongan Anda Telah Kami Terima
      </h1>

      {displayCode ? (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-emerald-deep p-5 text-cream sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-cream/80 uppercase">
              Kode Penawaran Resmi Rombongan Anda
            </p>
            <p className="mt-1 font-mono text-2xl font-extrabold tracking-[0.15em] text-gold sm:text-3xl">
              {displayCode}
            </p>
          </div>
          <span className="mt-3 inline-block rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold text-gold sm:mt-0">
            Status: Menunggu Penawaran &amp; MOU
          </span>
        </div>
      ) : (
        <p className="mt-4 text-base text-muted">
          Permintaan penawaran rombongan Anda telah tercatat di sistem kami.
        </p>
      )}

      {data && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-line bg-sand/70 p-6">
            <h2 className="font-sans text-lg font-extrabold text-ink">
              Ringkasan Permintaan Kontrak Rombongan
            </h2>

            <dl className="mt-4 divide-y divide-line text-sm">
              {[
                [
                  "Majelis / Instansi",
                  `${data.summary.organizationName} (${data.summary.organizationTypeLabel})`,
                ],
                ["Nama PIC", data.summary.picName],
                [
                  "Asal & Titik Jemput",
                  `${data.summary.originCity} (${data.summary.originRegionLabel})`,
                ],
                ["Paket Perjalanan", data.summary.packageName],
                [
                  "Jadwal Keberangkatan",
                  data.summary.scheduleLabel
                    ? `${data.summary.scheduleLabel} (${formatDateId(data.summary.requestedDepartDate)})`
                    : `Jadwal Custom — ${formatDateId(data.summary.requestedDepartDate)}`,
                ],
                [
                  "Jumlah Jamaah & Lansia",
                  `${data.summary.participantCount} orang (Lansia: ${data.summary.elderlyCount} org · Kursi Roda: ${data.summary.wheelchairCount} unit)`,
                ],
                [
                  "Rekomendasi Armada",
                  `${data.recommendedBusCount} Unit Bus Pariwisata Resmi (SPIONAM & BLUE)`,
                ],
                [
                  "Harga Satuan All-In",
                  `${formatRupiah(data.summary.unitPrice)} / jamaah`,
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col justify-between gap-1 py-2.5 sm:flex-row sm:gap-4"
                >
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-bold text-ink sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Rincian Kontrak & Termin Pembayaran */}
            <div className="mt-5 grid gap-3 rounded-2xl border border-emerald-deep/20 bg-cream p-4 sm:grid-cols-3">
              <div>
                <span className="block text-xs font-semibold text-muted">
                  Estimasi Total Kontrak All-In
                </span>
                <strong className="mt-0.5 block font-sans text-xl font-extrabold text-emerald-deep">
                  {formatRupiah(data.summary.estimatedTotalPrice)}
                </strong>
              </div>

              <div className="border-t border-line pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-xs font-semibold text-muted">
                  Estimasi DP 50% (Tenggat{" "}
                  {formatDateId(data.deadlines.dpDeadline)})
                </span>
                <strong className="mt-0.5 block font-sans text-lg font-extrabold text-gold-dark">
                  {formatRupiah(data.summary.estimatedDpAmount)}
                </strong>
              </div>

              <div className="border-t border-line pt-2 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                <span className="block text-xs font-semibold text-muted">
                  Pelunasan 50% (Tenggat{" "}
                  {formatDateId(data.deadlines.fullPaymentDeadline)})
                </span>
                <strong className="mt-0.5 block font-sans text-lg font-extrabold text-ink">
                  {formatRupiah(remainingAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Langkah Berikutnya (MOU & DP 50%) */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-gold-dark/35 bg-sand p-5 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <FileSignature className="mt-0.5 h-5 w-5 shrink-0 text-emerald-deep" />
          <div className="text-xs leading-relaxed text-ink/90 sm:text-sm">
            <p className="font-extrabold text-ink">
              1. Konfirmasi &amp; Penyusunan MOU
            </p>
            <p className="mt-1 text-muted">
              Klik tombol WhatsApp di bawah untuk mengirim rincian kode
              penawaran ke <strong>{SITE.contact.picName}</strong> dan
              menjadwalkan tanda tangan MOU bermaterai.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <WalletCards className="mt-0.5 h-5 w-5 shrink-0 text-emerald-deep" />
          <div className="text-xs leading-relaxed text-ink/90 sm:text-sm">
            <p className="font-extrabold text-ink">
              2. Penguncian Bus &amp; Hotel (DP 50% H-30)
            </p>
            <p className="mt-1 text-muted">
              Pembayaran DP 50% dilakukan setelah MOU disepakati (maksimal H-30
              sebelum keberangkatan) untuk mengunci armada bus &amp; kamar hotel
              bintang 3.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink
          href={data ? data.whatsappUrl : fallbackWaUrl}
          variant="primary"
          size="lg"
          external
          className="flex-1"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Kirim Permintaan Penawaran via WhatsApp</span>
        </ButtonLink>
        <ButtonLink href="/" variant="outline" size="lg">
          Kembali ke Beranda
        </ButtonLink>
      </div>
    </div>
  );
}
