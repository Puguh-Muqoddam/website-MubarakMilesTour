import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRupiah, SITE } from "@/lib/site";
import { requireAdminPage } from "@/server/auth/admin";
import { formatBookingCodeDisplay } from "@/server/booking/code";
import {
  IDEAL_BUS_CAPACITY,
  ORGANIZATION_TYPE_LABELS,
  ORIGIN_REGION_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/server/booking/config";
import { computeContractDeadlines, formatDateOnly } from "@/server/booking/dates";
import { canPrintDocument, STATUS_LABELS } from "@/server/booking/status";
import { getGroupBookingForPrint } from "@/server/db/admin";
import { getDb, isDbConfigured } from "@/server/db/client";
import { PrintButton } from "./PrintButton";

export default async function PrintContractInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage(); // Lapis pertama eksplisit di level page

  if (!(await isDbConfigured())) notFound();
  const { id } = await params;
  const db = await getDb();
  const booking = await getGroupBookingForPrint(db, id);

  if (!booking || !canPrintDocument(booking.status)) {
    notFound();
  }

  const departStr = formatDateOnly(booking.requestedDepartDate);
  const createdStr = formatDateOnly(booking.createdAt);
  const deadlines = computeContractDeadlines(departStr, createdStr);
  const recommendedBuses = Math.max(
    1,
    Math.ceil(booking.participantCount / IDEAL_BUS_CAPACITY),
  );

  const totalPaid = booking.paymentLogs.reduce((acc, log) => {
    if (log.paymentType === "REFUND") return acc - log.amount;
    return acc + log.amount;
  }, 0);
  const remainingBalance = Math.max(
    0,
    booking.estimatedTotalPrice - totalPaid,
  );

  return (
    <div className="space-y-6">
      {/* Navigasi layar (disembunyikan saat cetak) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/admin"
          className="text-sm font-bold text-emerald-deep underline-offset-4 hover:underline"
        >
          ← Kembali ke Daftar Kontrak Rombongan
        </Link>
        <PrintButton />
      </div>

      {/* Lembar Cetak Ringkasan Kontrak / Lampiran MOU / Invoice B2B */}
      <article
        aria-label="Lampiran MOU dan Invoice Kontrak Rombongan"
        className="mx-auto max-w-4xl rounded-2xl border-2 border-emerald-deep bg-white p-8 text-ink shadow-md print:max-w-none print:rounded-none print:border print:p-6 print:shadow-none"
      >
        {/* Kop Surat Resmi Mubarak Miles Tour */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-emerald-deep pb-5">
          <div className="flex items-start gap-4">
            <Image
              src="/images/logo.png"
              alt={`Logo ${SITE.name}`}
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
            <div>
              <p className="text-xs font-extrabold tracking-widest text-gold-dark uppercase">
                Dokumen Resmi Penawaran, Lampiran MOU, &amp; Tagihan Termin B2B
              </p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-emerald-deep">
                {SITE.name}
              </h1>
              <p className="text-xs font-medium text-muted">{SITE.tagline}</p>
              <p className="mt-1 text-xs text-muted">
                {SITE.city} • WhatsApp Konsultan ({SITE.contact.picName}):{" "}
                {SITE.contact.whatsappDisplay} • Email: {SITE.contact.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-full border border-emerald-deep bg-emerald-deep px-3.5 py-1 text-xs font-extrabold tracking-wider text-gold uppercase">
              {STATUS_LABELS[booking.status]}
            </span>
            <p className="mt-2 font-mono text-base font-extrabold text-ink">
              {formatBookingCodeDisplay(booking.code)}
            </p>
            <p className="text-xs text-muted">
              Tanggal Pengajuan: {createdStr}
            </p>
          </div>
        </header>

        {/* Bagian 1: Identitas Instansi / Majelis & PIC */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-cream/40 p-4">
            <h2 className="text-xs font-extrabold tracking-wider text-emerald-deep uppercase">
              1. Identitas Rombongan &amp; Penanggung Jawab (PIC)
            </h2>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Nama Majelis / Instansi:</dt>
                <dd className="text-right font-bold text-ink">
                  {booking.organizationName}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Kategori Rombongan:</dt>
                <dd className="text-right font-semibold text-ink">
                  {ORGANIZATION_TYPE_LABELS[booking.organizationType]}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Wilayah Asal:</dt>
                <dd className="text-right font-semibold text-ink">
                  {ORIGIN_REGION_LABELS[booking.originRegion]}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Lokasi Titik Penjemputan:</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.originCity}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-t border-line pt-1.5">
                <dt className="text-muted">Nama Ketua / PIC:</dt>
                <dd className="text-right font-bold text-ink">
                  {booking.picName}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Nomor WhatsApp PIC:</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.whatsapp}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Email PIC:</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.email ?? "-"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Bagian 2: Spesifikasi Paket, Armada, & Kebutuhan Ramah Lansia */}
          <div className="rounded-xl border border-line bg-cream/40 p-4">
            <h2 className="text-xs font-extrabold tracking-wider text-emerald-deep uppercase">
              2. Paket Perjalanan &amp; Kuota Ramah Lansia
            </h2>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Paket Dipilih:</dt>
                <dd className="text-right font-bold text-ink">
                  {booking.package.name} ({booking.package.durationDays}H
                  {booking.package.durationNights}M)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Slot Jadwal:</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.departureSlot
                    ? booking.departureSlot.label
                    : "Jadwal Custom Rombongan"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Tanggal Keberangkatan:</dt>
                <dd className="text-right font-extrabold text-emerald-deep">
                  {departStr}
                </dd>
              </div>
              <div className="flex justify-between gap-2 border-t border-line pt-1.5">
                <dt className="text-muted">Total Peserta Rombongan:</dt>
                <dd className="text-right font-bold text-ink">
                  {booking.participantCount} Jamaah (Estimasi {recommendedBuses}{" "}
                  Bus Pariwisata)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Jamaah Lansia (≥ 60 Tahun):</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.elderlyCount} Jamaah
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Permintaan Kursi Roda Lipat:</dt>
                <dd className="text-right font-semibold text-ink">
                  {booking.wheelchairCount} Unit (+ 2 Tabung Oxycan Portabel/Bus)
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Bagian 3: Rincian Nilai Kontrak All-In & Jadwal Termin Pembayaran */}
        <section className="mt-6 rounded-xl border border-emerald-deep/30 bg-sand/35 p-5">
          <h2 className="text-xs font-extrabold tracking-wider text-emerald-deep uppercase">
            3. Rincian Nilai Kontrak Paket All-In (Zero-Cash Hassle) &amp; Termin Pembayaran
          </h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-white p-3">
              <p className="text-xs text-muted">
                Total Kontrak ({booking.participantCount} ×{" "}
                {formatRupiah(booking.unitPrice)})
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink">
                {formatRupiah(booking.estimatedTotalPrice)}
              </p>
              <p className="text-[11px] text-muted">
                All-In (Bus SPIONAM, Hotel Bintang 3, Makan 3x/hari, Muthawwif, Tiket &amp; Asuransi)
              </p>
            </div>

            <div className="rounded-lg border border-gold-dark/40 bg-gold/15 p-3">
              <p className="text-xs font-bold text-ink">
                Termin 1 — Down Payment (DP 50%)
              </p>
              <p className="mt-1 text-lg font-extrabold text-emerald-deep">
                {formatRupiah(booking.estimatedDpAmount)}
              </p>
              <p className="text-[11px] font-semibold text-ink">
                Batas Waktu (H-30): {deadlines.dpDeadline}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-3">
              <p className="text-xs font-bold text-ink">
                Termin 2 — Pelunasan (50%)
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink">
                {formatRupiah(
                  booking.estimatedTotalPrice - booking.estimatedDpAmount,
                )}
              </p>
              <p className="text-[11px] font-semibold text-ink">
                Batas Waktu (H-14): {deadlines.fullPaymentDeadline}
              </p>
            </div>
          </div>

          {/* Tabel Riwayat Pembayaran Masuk */}
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-ink">
                Total Pembayaran Diterima:{" "}
                <strong className="text-emerald-deep">
                  {formatRupiah(totalPaid)}
                </strong>
              </span>
              <span className="font-bold text-ink">
                Sisa Tagihan Kontrak:{" "}
                <strong
                  className={
                    remainingBalance === 0
                      ? "text-emerald-mid"
                      : "text-promo-red"
                  }
                >
                  {formatRupiah(remainingBalance)}
                </strong>
              </span>
            </div>

            {booking.paymentLogs.length > 0 ? (
              <table className="mt-2 w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-1.5">Tanggal</th>
                    <th className="py-1.5">Jenis Termin</th>
                    <th className="py-1.5">Nominal</th>
                    <th className="py-1.5">Keterangan / Referensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {booking.paymentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-1.5">{formatDateOnly(log.paidAt)}</td>
                      <td className="py-1.5 font-semibold">
                        {PAYMENT_TYPE_LABELS[log.paymentType]}
                      </td>
                      <td className="py-1.5 font-bold">
                        {formatRupiah(log.amount)}
                      </td>
                      <td className="py-1.5 text-muted">{log.note ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2 text-xs italic text-muted">
                Belum ada pembayaran termin yang tercatat pada sistem.
              </p>
            )}
          </div>
        </section>

        {/* Catatan Khusus Rombongan */}
        {booking.notes && (
          <section className="mt-4 rounded-xl border border-line bg-cream/40 p-4 text-xs">
            <h2 className="font-extrabold tracking-wider text-emerald-deep uppercase">
              Catatan Khusus Permintaan PIC Rombongan
            </h2>
            <p className="mt-1 text-ink">{booking.notes}</p>
          </section>
        )}

        {/* Kolom Tanda Tangan Persetujuan MOU Kedua Belah Pihak */}
        <footer className="mt-8 border-t border-line pt-6 text-xs">
          <p className="text-muted">
            Dokumen ini merupakan lampiran resmi Perjanjian Kerja Sama (MOU) penyelenggaraan perjalanan Ziarah Wali Songo + Tour Wisata antara <strong>{SITE.name}</strong> dan perwakilan sah rombongan <strong>{booking.organizationName}</strong>. Seluruh fasilitas mengacu pada standar <em>All-In Zero-Cash Hassle</em>, <em>SOP Ramp Check Armada H-1</em>, dan kuota ramah lansia.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="font-bold text-ink">Pihak Pertama (Penyelenggara)</p>
              <p className="text-muted">{SITE.name}</p>
              <div className="h-20" />
              <p className="mx-auto w-48 border-t border-ink pt-1 font-bold text-ink">
                Manajemen Operasional
              </p>
            </div>
            <div>
              <p className="font-bold text-ink">Pihak Kedua (Perwakilan Rombongan)</p>
              <p className="text-muted">{booking.organizationName}</p>
              <div className="h-20" />
              <p className="mx-auto w-48 border-t border-ink pt-1 font-bold text-ink">
                {booking.picName}
              </p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
