import Link from "next/link";
import { FileText, Users, ShieldCheck, Calendar, Bus } from "lucide-react";
import type {
  BookingStatus,
  OrganizationType,
  OriginRegion,
} from "@/generated/prisma/enums";
import { formatRupiah } from "@/lib/site";
import { requireAdminPage } from "@/server/auth/admin";
import {
  formatBookingCodeDisplay,
  normalizeBookingCode,
} from "@/server/booking/code";
import {
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPES,
  ORIGIN_REGION_LABELS,
  ORIGIN_REGIONS,
  PAYMENT_TYPE_LABELS,
} from "@/server/booking/config";
import { computeContractDeadlines, formatDateOnly } from "@/server/booking/dates";
import {
  ALL_STATUSES,
  canPrintDocument,
  STATUS_LABELS,
} from "@/server/booking/status";
import {
  type BookingFilter,
  getAdminSummaryStats,
  listGroupBookings,
} from "@/server/db/admin";
import { getDb, isDbConfigured } from "@/server/db/client";
import { logDbError } from "@/server/db/log";
import { PaymentForm } from "./PaymentForm";
import { StatusForm } from "./StatusForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pickStr(v: string | string[] | undefined, max = 40): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length > 0 && s.length <= max ? s : undefined;
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  MENUNGGU_PENAWARAN: "bg-gold/35 text-ink border-gold-dark/40",
  MOU_DITANDATANGANI: "bg-sand text-emerald-deep border-emerald-mid/40",
  DP_DITERIMA: "bg-emerald-mid/15 text-emerald-deep border-emerald-mid/40",
  LUNAS: "bg-emerald-deep text-cream border-emerald-deep",
  SELESAI: "bg-sage-card/25 text-ink border-sage-card/40",
  BATAL: "bg-promo-red/15 text-promo-red border-promo-red/30",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage(); // Lapis ke-1 eksplisit di level page

  const sp = await searchParams;
  const statusParam = pickStr(sp.status);
  const status = ALL_STATUSES.includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;

  const orgParam = pickStr(sp.organizationType);
  const organizationType = ORGANIZATION_TYPES.includes(
    orgParam as OrganizationType,
  )
    ? (orgParam as OrganizationType)
    : undefined;

  const regionParam = pickStr(sp.originRegion);
  const originRegion = ORIGIN_REGIONS.includes(regionParam as OriginRegion)
    ? (regionParam as OriginRegion)
    : undefined;

  const rawCode = pickStr(sp.code, 32);
  const filter: BookingFilter = {
    status,
    organizationType,
    originRegion,
    dateFrom: pickStr(sp.dateFrom, 10),
    dateTo: pickStr(sp.dateTo, 10),
    code: rawCode ? normalizeBookingCode(rawCode) : undefined,
    page: Number.parseInt(pickStr(sp.page, 6) ?? "1", 10) || 1,
  };

  let data: Awaited<ReturnType<typeof listGroupBookings>> | null = null;
  let stats: Awaited<ReturnType<typeof getAdminSummaryStats>> | null = null;
  let dbError = false;

  if (await isDbConfigured()) {
    try {
      const db = await getDb();
      [data, stats] = await Promise.all([
        listGroupBookings(db, filter),
        getAdminSummaryStats(db),
      ]);
    } catch (e) {
      logDbError("admin-list-rombongan", e);
      dbError = true;
    }
  } else {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-widest text-gold-dark uppercase">
            Portal Operasional B2B Rombongan
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-ink sm:text-4xl">
            Daftar Kontrak Rombongan, MOU, &amp; Pembayaran Termin
          </h1>
          <p className="mt-1 text-sm text-muted">
            Alur resmi PPBI §6.2: Permintaan Penawaran → Tanda Tangan MOU → DP 50% (maks. H-30) → Pelunasan 50% (maks. H-14) → Keberangkatan.
          </p>
        </div>
        {data && (
          <p className="rounded-full border border-line bg-sand px-4 py-1.5 text-sm font-bold text-ink">
            Menampilkan {data.items.length} dari {data.total} rombongan
          </p>
        )}
      </div>

      {/* Ringkasan KPI Tahapan Rombongan */}
      {stats && (
        <section aria-label="Ringkasan Status Rombongan" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-line bg-sand p-4">
              <p className="text-xs font-bold text-muted uppercase">Total Pengajuan</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">{stats.totalAll}</p>
            </div>
            <div className="rounded-2xl border border-gold-dark/30 bg-gold/20 p-4">
              <p className="text-xs font-bold text-ink uppercase">Menunggu MOU</p>
              <p className="mt-1 text-2xl font-extrabold text-ink">
                {stats.menungguPenawaran}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-cream p-4">
              <p className="text-xs font-bold text-emerald-deep uppercase">
                MOU Ditandatangani
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-deep">
                {stats.mouDitandatangani}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-mid/30 bg-emerald-mid/10 p-4">
              <p className="text-xs font-bold text-emerald-deep uppercase">
                Sudah DP 50%
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-deep">
                {stats.dpDiterima}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-deep bg-emerald-deep p-4 text-cream">
              <p className="text-xs font-bold text-gold uppercase">
                Lunas (Siap Berangkat)
              </p>
              <p className="mt-1 text-2xl font-extrabold text-cream">
                {stats.lunas}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-sand p-4">
              <p className="text-xs font-bold text-muted uppercase">
                Perjalanan Selesai
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink">
                {stats.selesai}
              </p>
            </div>
          </div>

          {/* Ketersediaan Kuota Rombongan per Slot Jadwal */}
          {stats.slots.length > 0 && (
            <div className="rounded-2xl border border-line bg-sand/70 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-emerald-deep uppercase">
                <Bus className="h-4 w-4 text-gold-dark" />
                <span>Status Kuota Bus per Slot Keberangkatan Terjadwal</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.slots.map((slot) => {
                  const remaining = Math.max(
                    0,
                    slot.maxRombonganQuota - slot.bookedRombonganCount,
                  );
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-cream px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-ink">{slot.label}</p>
                        <p className="text-muted">
                          Berangkat: {formatDateOnly(slot.departDate)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 font-extrabold ${
                          slot.isClosed || remaining === 0
                            ? "bg-promo-red/15 text-promo-red"
                            : "bg-emerald-deep text-gold"
                        }`}
                      >
                        {slot.bookedRombonganCount}/{slot.maxRombonganQuota} Bus
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Form Filter Pencarian */}
      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-line bg-sand p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div>
          <label htmlFor="f-status" className="block text-xs font-bold text-ink">
            Tahapan Status
          </label>
          <select
            id="f-status"
            name="status"
            defaultValue={filter.status ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink"
          >
            <option value="">Semua Status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-org" className="block text-xs font-bold text-ink">
            Jenis Instansi / Majelis
          </label>
          <select
            id="f-org"
            name="organizationType"
            defaultValue={filter.organizationType ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink"
          >
            <option value="">Semua Instansi</option>
            {ORGANIZATION_TYPES.map((o) => (
              <option key={o} value={o}>
                {ORGANIZATION_TYPE_LABELS[o]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-region" className="block text-xs font-bold text-ink">
            Wilayah Asal
          </label>
          <select
            id="f-region"
            name="originRegion"
            defaultValue={filter.originRegion ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink"
          >
            <option value="">Semua Wilayah</option>
            {ORIGIN_REGIONS.map((r) => (
              <option key={r} value={r}>
                {ORIGIN_REGION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="f-from" className="block text-xs font-bold text-ink">
            Berangkat Dari Tanggal
          </label>
          <input
            id="f-from"
            type="date"
            name="dateFrom"
            defaultValue={filter.dateFrom ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink"
          />
        </div>

        <div>
          <label htmlFor="f-to" className="block text-xs font-bold text-ink">
            Sampai Tanggal
          </label>
          <input
            id="f-to"
            type="date"
            name="dateTo"
            defaultValue={filter.dateTo ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink"
          />
        </div>

        <div>
          <label htmlFor="f-code" className="block text-xs font-bold text-ink">
            Kode Pengajuan
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="f-code"
              type="text"
              name="code"
              defaultValue={filter.code ?? ""}
              placeholder="MMT-20260710-..."
              className="w-full rounded-xl border border-line bg-cream px-3 py-2 font-mono text-xs text-ink"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-deep px-4 py-2 text-xs font-extrabold text-gold transition-colors hover:bg-emerald-mid"
            >
              Filter
            </button>
          </div>
        </div>
      </form>

      {dbError && (
        <div
          role="alert"
          className="rounded-2xl border border-promo-red/40 bg-promo-red/10 p-5 text-sm font-semibold text-promo-red"
        >
          Database belum terhubung atau sedang mengalami gangguan. Pastikan{" "}
          <code className="font-mono">DATABASE_URL</code> sudah dikonfigurasi dengan benar.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl border border-line bg-sand p-10 text-center text-sm text-muted">
          Belum ada data permintaan penawaran atau booking rombongan yang sesuai dengan filter.
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-cream shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-emerald-deep text-xs font-extrabold tracking-wider text-cream uppercase">
                <th className="p-3.5">Kode &amp; Jadwal</th>
                <th className="p-3.5">Rombongan &amp; Kontak PIC</th>
                <th className="p-3.5">Paket, Jamaah, &amp; Lansia</th>
                <th className="p-3.5">Kontrak All-In &amp; Termin DP 50%</th>
                <th className="p-3.5">Tahapan MOU &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {data.items.map((b) => {
                const departStr = formatDateOnly(b.requestedDepartDate);
                const createdStr = formatDateOnly(b.createdAt);
                const deadlines = computeContractDeadlines(
                  departStr,
                  createdStr,
                );

                const totalPaid = b.paymentLogs.reduce((acc, log) => {
                  if (log.paymentType === "REFUND") return acc - log.amount;
                  return acc + log.amount;
                }, 0);
                const remainingBalance = Math.max(
                  0,
                  b.estimatedTotalPrice - totalPaid,
                );

                return (
                  <tr key={b.id} className="hover:bg-sand/40">
                    {/* Kolom 1: Kode, Tanggal Keberangkatan, & Tenggat Termin */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-mono text-xs font-extrabold text-emerald-deep">
                        {formatBookingCodeDisplay(b.code)}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink">
                        <Calendar className="h-3.5 w-3.5 text-gold-dark" />
                        <span>Berangkat: {departStr}</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5 rounded-lg border border-line bg-sand/70 p-2 text-[11px] text-muted">
                        <div>
                          Batas DP 50% (H-30):{" "}
                          <strong className="text-ink">
                            {deadlines.dpDeadline}
                          </strong>
                        </div>
                        <div>
                          Batas Pelunasan (H-14):{" "}
                          <strong className="text-ink">
                            {deadlines.fullPaymentDeadline}
                          </strong>
                        </div>
                        <div>Diajukan: {createdStr}</div>
                      </div>
                    </td>

                    {/* Kolom 2: Rombongan, Wilayah, & PIC */}
                    <td className="p-3.5">
                      <div className="font-bold text-ink">
                        {b.organizationName}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-gold-dark">
                        {ORGANIZATION_TYPE_LABELS[b.organizationType]} •{" "}
                        {ORIGIN_REGION_LABELS[b.originRegion]}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Titik Jemput:{" "}
                        <span className="font-medium text-ink">
                          {b.originCity}
                        </span>
                      </div>
                      <div className="mt-2 rounded-lg border border-line bg-sand/50 p-2 text-xs">
                        <div className="font-bold text-ink">
                          PIC: {b.picName}
                        </div>
                        <div className="text-muted">WA: {b.whatsapp}</div>
                        {b.email && <div className="text-muted">{b.email}</div>}
                      </div>
                    </td>

                    {/* Kolom 3: Paket, Jamaah, & Kebutuhan Ramah Lansia */}
                    <td className="p-3.5">
                      <div className="font-bold text-ink">{b.package.name}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {b.departureSlot
                          ? `Slot: ${b.departureSlot.label}`
                          : "Jadwal Custom Rombongan"}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-deep/10 px-2.5 py-0.5 font-bold text-emerald-deep">
                          <Users className="h-3 w-3" />
                          {b.participantCount} Jamaah
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/30 px-2.5 py-0.5 font-bold text-ink">
                          <ShieldCheck className="h-3 w-3 text-gold-dark" />
                          Lansia: {b.elderlyCount}
                        </span>
                        {b.wheelchairCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-mid text-cream px-2.5 py-0.5 font-bold">
                            Kursi Roda: {b.wheelchairCount}
                          </span>
                        )}
                      </div>
                      {b.notes && (
                        <p className="mt-2 max-w-xs rounded-lg border border-line bg-sand/60 p-2 text-xs text-muted">
                          <strong className="text-ink">Catatan PIC:</strong>{" "}
                          {b.notes}
                        </p>
                      )}
                    </td>

                    {/* Kolom 4: Nilai Kontrak All-In, DP 50%, & Log Pembayaran */}
                    <td className="p-3.5">
                      <div className="text-xs text-muted">
                        Harga/jamaah: {formatRupiah(b.unitPrice)}
                      </div>
                      <div className="text-sm font-extrabold text-ink">
                        Total Kontrak: {formatRupiah(b.estimatedTotalPrice)}
                      </div>
                      <div className="text-xs font-bold text-gold-dark">
                        Wajib DP 50%: {formatRupiah(b.estimatedDpAmount)}
                      </div>

                      <div className="mt-2 rounded-lg border border-line bg-sand/50 p-2 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>Sudah Masuk:</span>
                          <span className="text-emerald-deep">
                            {formatRupiah(totalPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Sisa Pelunasan:</span>
                          <span
                            className={
                              remainingBalance === 0
                                ? "text-emerald-mid"
                                : "text-promo-red"
                            }
                          >
                            {formatRupiah(remainingBalance)}
                          </span>
                        </div>

                        {b.paymentLogs.length > 0 && (
                          <ul className="mt-2 space-y-1 border-t border-line pt-1.5 text-[11px] text-muted">
                            {b.paymentLogs.map((pl) => (
                              <li key={pl.id}>
                                •{" "}
                                <strong className="text-ink">
                                  {PAYMENT_TYPE_LABELS[pl.paymentType]}
                                </strong>
                                : {formatRupiah(pl.amount)}{" "}
                                {pl.note ? `(${pl.note})` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {b.status !== "BATAL" && b.status !== "SELESAI" && (
                        <PaymentForm
                          bookingId={b.id}
                          suggestedDpAmount={
                            totalPaid === 0 ? b.estimatedDpAmount : 0
                          }
                          suggestedRemainingAmount={remainingBalance}
                        />
                      )}
                    </td>

                    {/* Kolom 5: Status, Form Transisi, & Tombol Cetak Lampiran MOU */}
                    <td className="p-3.5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-extrabold ${STATUS_BADGE[b.status]}`}
                        >
                          {STATUS_LABELS[b.status]}
                        </span>

                        {canPrintDocument(b.status) && (
                          <Link
                            href={`/admin/pesanan/${b.id}/cetak`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-deep bg-cream px-3 py-1 text-xs font-extrabold text-emerald-deep transition-colors hover:bg-emerald-deep hover:text-gold"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Cetak MOU / Invoice</span>
                          </Link>
                        )}
                      </div>

                      <StatusForm bookingId={b.id} current={b.status} />

                      {b.statusLogs.length > 0 && (
                        <details className="text-xs text-muted">
                          <summary className="cursor-pointer font-semibold select-none hover:text-ink">
                            Riwayat Audit Status ({b.statusLogs.length})
                          </summary>
                          <ul className="mt-1.5 space-y-1 rounded-lg border border-line bg-sand/50 p-2 text-[11px]">
                            {b.statusLogs.map((l) => (
                              <li key={l.id}>
                                <span className="font-semibold text-ink">
                                  {l.fromStatus ? `${l.fromStatus} → ` : ""}
                                  {l.toStatus}
                                </span>{" "}
                                oleh {l.changedByEmail}
                                {l.note ? ` — "${l.note}"` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
