"use client";

import { useRouter } from "next/navigation";
import {
  useActionState,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import {
  Accessibility,
  Bus,
  Calculator,
  CalendarCheck,
  FileSignature,
  ShieldCheck,
} from "lucide-react";
import {
  type BookingActionState,
  submitGroupBooking,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/site";
import {
  IDEAL_BUS_CAPACITY,
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPES,
  ORIGIN_REGION_LABELS,
  ORIGIN_REGIONS,
} from "@/server/booking/config";
import { computeGroupContractPricing } from "@/server/booking/rules";
import { formatDateId } from "@/server/booking/whatsapp";
import type { PublicDepartureSlot, PublicPackage } from "@/server/db/types";
import { Turnstile } from "./Turnstile";

export const BOOKING_STORAGE_KEY = "mmt:last-group-booking";

const fieldCls =
  "mt-1.5 block w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-sm sm:text-base text-ink placeholder:text-muted/75 focus:border-emerald-deep focus:outline-none focus:ring-2 focus:ring-emerald-deep/25 aria-[invalid=true]:border-danger";
const labelCls = "block text-sm font-extrabold tracking-wide text-ink";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-semibold text-danger sm:text-sm">
      {message}
    </p>
  );
}

export function BookingForm({
  packages,
  slots,
  dateBounds,
  siteKey,
}: {
  packages: PublicPackage[];
  slots: PublicDepartureSlot[];
  dateBounds: { from: string; to: string };
  siteKey: string;
}) {
  const router = useRouter();
  const uid = useId();
  const [resetKey, setResetKey] = useState(0);

  const [state, formAction, pending] = useActionState<
    BookingActionState,
    FormData
  >(
    async (prev, formData) => {
      const result = await submitGroupBooking(prev, formData);
      if (result.status === "success") {
        try {
          sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(result));
        } catch {
          // Jika sessionStorage diblokir browser, halaman sukses tetap membaca kode dari URL.
        }
        router.push(
          `/pesanan/terkirim?kode=${encodeURIComponent(result.summary.code)}`,
        );
      } else {
        setResetKey((k) => k + 1);
      }
      return result;
    },
    { status: "idle" },
  );

  const initialPkg = packages[0];
  const [packageId, setPackageId] = useState<string>(initialPkg?.id ?? "");
  const pkg = useMemo(
    () => packages.find((p) => p.id === packageId) ?? packages[0],
    [packages, packageId],
  );

  const pkgSlots = useMemo(
    () => slots.filter((s) => s.packageId === pkg?.id),
    [slots, pkg],
  );

  const firstAvailableSlot = useMemo(
    () =>
      pkgSlots.find((s) => !s.isClosed && s.remainingRombonganQuota > 0) ??
      pkgSlots[0],
    [pkgSlots],
  );

  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    firstAvailableSlot?.id ?? "",
  );
  const [customDepartDate, setCustomDepartDate] = useState<string>(
    firstAvailableSlot?.departDate ?? dateBounds.from,
  );

  const [participantCount, setParticipantCount] = useState<number>(
    IDEAL_BUS_CAPACITY,
  );
  const [elderlyCount, setElderlyCount] = useState<number>(10);
  const [wheelchairCount, setWheelchairCount] = useState<number>(1);
  const [organizationType, setOrganizationType] =
    useState<string>("MAJELIS_TAKLIM");
  const [originRegion, setOriginRegion] = useState<string>("SURABAYA_RAYA");
  const [token, setToken] = useState<string | null>(null);

  const onToken = useCallback((t: string | null) => setToken(t), []);

  const selectedSlot = useMemo(
    () => pkgSlots.find((s) => s.id === selectedSlotId) ?? null,
    [pkgSlots, selectedSlotId],
  );

  const effectiveDepartDate = pkg?.isCustomAllowed
    ? customDepartDate
    : (selectedSlot?.departDate ?? "");

  const countValid = Boolean(
    pkg &&
      Number.isInteger(participantCount) &&
      participantCount >= pkg.minParticipants &&
      participantCount <= pkg.maxParticipants,
  );

  const specialNeedsValid =
    Number.isInteger(elderlyCount) &&
    elderlyCount >= 0 &&
    elderlyCount <= (Number.isNaN(participantCount) ? 0 : participantCount) &&
    Number.isInteger(wheelchairCount) &&
    wheelchairCount >= 0 &&
    wheelchairCount <= (Number.isNaN(participantCount) ? 0 : participantCount);

  const pricing = useMemo(() => {
    if (!pkg || !countValid) return null;
    return computeGroupContractPricing(pkg, participantCount);
  }, [pkg, countValid, participantCount]);

  const scheduleReady = pkg?.isCustomAllowed
    ? Boolean(customDepartDate)
    : Boolean(
        selectedSlot &&
          !selectedSlot.isClosed &&
          selectedSlot.remainingRombonganQuota > 0,
      );

  const fieldErrors =
    state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const err = (name: string) => fieldErrors[name];

  const ids = useMemo(
    () =>
      Object.fromEntries(
        [
          "pkg",
          "slot",
          "date",
          "pax",
          "elderly",
          "wheelchair",
          "orgName",
          "orgType",
          "picName",
          "wa",
          "email",
          "region",
          "city",
          "notes",
        ].map((k) => [k, `${uid}-${k}`]),
      ),
    [uid],
  );

  function handlePackageChange(nextPkgId: string) {
    setPackageId(nextPkgId);
    const nextPkg = packages.find((p) => p.id === nextPkgId);
    if (!nextPkg) return;

    setParticipantCount((prev) => {
      const safe = Number.isNaN(prev) ? IDEAL_BUS_CAPACITY : prev;
      const clamped = Math.min(
        Math.max(safe, nextPkg.minParticipants),
        nextPkg.maxParticipants,
      );
      setElderlyCount((e) => Math.min(e, clamped));
      setWheelchairCount((w) => Math.min(w, clamped));
      return clamped;
    });

    const nextSlots = slots.filter((s) => s.packageId === nextPkg.id);
    const avail =
      nextSlots.find((s) => !s.isClosed && s.remainingRombonganQuota > 0) ??
      nextSlots[0];
    setSelectedSlotId(avail?.id ?? "");
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-12">
      {/* Panel Ringkasan Kontrak Rombongan (Sticky di Desktop) */}
      <aside
        aria-labelledby={`${uid}-summary-heading`}
        className="rounded-3xl border border-gold/40 bg-emerald-deep p-6 text-cream shadow-xl sm:p-8 lg:sticky lg:top-24"
      >
        <div className="flex items-center gap-2.5 text-xs font-extrabold tracking-wider text-gold uppercase">
          <Calculator className="h-4 w-4" />
          <span>Simulasi Kontrak Rombongan B2B</span>
        </div>

        <h3
          id={`${uid}-summary-heading`}
          className="mt-2 font-sans text-2xl font-extrabold text-cream"
        >
          Ringkasan Penawaran
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-cream/80">
          Kalkulasi otomatis berdasarkan paket dan jumlah jamaah. Nilai resmi
          dihitung ulang oleh server dari database saat pengajuan.
        </p>

        <dl className="mt-6 space-y-3 border-t border-cream/15 pt-5 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-cream/75">Paket Dipilih</dt>
            <dd className="text-right font-bold text-cream">
              {pkg?.name ?? "-"}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4">
            <dt className="text-cream/75">Jadwal Berangkat</dt>
            <dd className="text-right font-bold text-gold">
              {effectiveDepartDate ? formatDateId(effectiveDepartDate) : "-"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-cream/75">Harga All-In / Jamaah</dt>
            <dd className="font-bold text-cream">
              {pricing ? formatRupiah(pricing.unitPrice) : "-"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-cream/75">Total Jamaah</dt>
            <dd className="font-bold text-cream">
              {countValid ? `${participantCount} orang` : "-"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-cream/75">Lansia &amp; Kursi Roda</dt>
            <dd className="text-right text-xs font-semibold text-cream/90">
              {specialNeedsValid
                ? `${elderlyCount} lansia · ${wheelchairCount} kursi roda`
                : "-"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-cream/75">Estimasi Armada Bus</dt>
            <dd className="inline-flex items-center gap-1.5 font-bold text-gold">
              <Bus className="h-4 w-4" />
              <span>
                {pricing
                  ? `${pricing.recommendedBusCount} Unit Bus Pariwisata`
                  : "-"}
              </span>
            </dd>
          </div>

          <div className="mt-4 rounded-2xl border border-gold/35 bg-emerald-mid p-4">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-xs font-bold tracking-wider text-cream/85 uppercase">
                Estimasi Total Kontrak
              </dt>
              <dd
                className="font-sans text-2xl font-extrabold text-gold sm:text-3xl"
                aria-live="polite"
              >
                {pricing ? formatRupiah(pricing.estimatedTotalPrice) : "-"}
              </dd>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-cream/15 pt-3 text-xs">
              <div>
                <span className="block text-cream/75">
                  DP 50% (Maks. H-30):
                </span>
                <strong className="text-sm font-extrabold text-cream">
                  {pricing ? formatRupiah(pricing.estimatedDpAmount) : "-"}
                </strong>
              </div>
              <div className="text-right">
                <span className="block text-cream/75">
                  Pelunasan (Maks. H-14):
                </span>
                <strong className="text-sm font-extrabold text-cream">
                  {pricing
                    ? formatRupiah(pricing.estimatedRemainingAmount)
                    : "-"}
                </strong>
              </div>
            </div>
          </div>
        </dl>

        <ul className="mt-6 space-y-2 text-xs text-cream/85">
          <li className="flex items-center gap-2">
            <FileSignature className="h-4 w-4 shrink-0 text-gold" />
            <span>Dilindungi MOU bermaterai sebelum pembayaran DP</span>
          </li>
          <li className="flex items-center gap-2">
            <Accessibility className="h-4 w-4 shrink-0 text-gold" />
            <span>Termasuk kursi roda lipat &amp; 2 tabung oksigen Oxycan</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
            <span>All-In Zero-Cash Hassle tanpa pungutan di atas bus</span>
          </li>
        </ul>
      </aside>

      {/* Form Pengajuan Penawaran Rombongan */}
      <form
        action={formAction}
        noValidate
        aria-describedby={
          state.status === "error" ? `${uid}-form-error` : undefined
        }
        className="space-y-6 rounded-3xl border border-line bg-sand p-6 shadow-md sm:p-8"
      >
        {state.status === "error" && (
          <div
            id={`${uid}-form-error`}
            role="alert"
            className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3.5 text-sm font-semibold text-danger"
          >
            {state.message}
          </div>
        )}

        {/* Honeypot Anti-Bot (disembunyikan dari pengguna & pembaca layar) */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
        >
          <label htmlFor={`${uid}-website`}>Website</label>
          <input
            id={`${uid}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {/* 1. Pilih Paket Perjalanan */}
        <div>
          <label htmlFor={ids.pkg} className={labelCls}>
            1. Pilih Paket Rombongan
          </label>
          <select
            id={ids.pkg}
            name="packageId"
            required
            value={packageId}
            onChange={(e) => handlePackageChange(e.target.value)}
            className={fieldCls}
            aria-invalid={Boolean(err("packageId"))}
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatRupiah(p.pricePromoPerPax)} / jamaah (
                {p.minParticipants}–{p.maxParticipants} orang)
              </option>
            ))}
          </select>
          <FieldError id={`${ids.pkg}-e`} message={err("packageId")} />
        </div>

        {/* 2. Pilih Slot Jadwal Keberangkatan atau Tanggal Custom */}
        {!pkg?.isCustomAllowed ? (
          <fieldset aria-describedby={`${ids.slot}-h`}>
            <legend className={labelCls}>
              2. Pilih Slot Jadwal Keberangkatan Rombongan
            </legend>
            <p id={`${ids.slot}-h`} className="mt-1 text-xs text-muted">
              Setiap slot memiliki kuota maksimal rombongan bus agar pelayanan
              Muthawwif dan akomodasi hotel tetap eksklusif.
            </p>
            <input
              type="hidden"
              name="requestedDepartDate"
              value={effectiveDepartDate}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pkgSlots.map((slot) => {
                const unavailable =
                  slot.isClosed || slot.remainingRombonganQuota <= 0;
                const isChecked = selectedSlotId === slot.id;
                return (
                  <label
                    key={slot.id}
                    className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all ${
                      unavailable
                        ? "cursor-not-allowed border-line bg-cream/50 opacity-60"
                        : isChecked
                          ? "border-emerald-deep bg-emerald-deep text-cream shadow-sm"
                          : "border-line bg-cream text-ink hover:border-emerald-deep/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="departureSlotId"
                      value={slot.id}
                      className="sr-only"
                      checked={isChecked}
                      disabled={unavailable}
                      onChange={() => setSelectedSlotId(slot.id)}
                    />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold">
                          <CalendarCheck className="h-3.5 w-3.5" />
                          <span>{slot.label}</span>
                        </span>
                      </div>
                      <p
                        className={`mt-1.5 text-xs ${
                          isChecked ? "text-cream/85" : "text-muted"
                        }`}
                      >
                        Berangkat: {formatDateId(slot.departDate)}
                      </p>
                    </div>
                    <span
                      className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        unavailable
                          ? "bg-danger/15 text-danger"
                          : isChecked
                            ? "bg-gold text-ink"
                            : "bg-success/15 text-success"
                      }`}
                    >
                      {unavailable
                        ? slot.closedReason || "Kuota Bus Penuh"
                        : `Tersedia ${slot.remainingRombonganQuota} dari ${slot.maxRombonganQuota} Kuota Bus`}
                    </span>
                  </label>
                );
              })}
            </div>
            <FieldError
              id={`${ids.slot}-e`}
              message={err("departureSlotId") ?? err("requestedDepartDate")}
            />
          </fieldset>
        ) : (
          <div>
            <label htmlFor={ids.date} className={labelCls}>
              2. Rencana Tanggal Keberangkatan Custom (Minimal H-14)
            </label>
            <input
              id={ids.date}
              name="requestedDepartDate"
              type="date"
              required
              min={dateBounds.from}
              max={dateBounds.to}
              value={customDepartDate}
              onChange={(e) => setCustomDepartDate(e.target.value)}
              className={fieldCls}
              aria-describedby={`${ids.date}-h`}
              aria-invalid={Boolean(err("requestedDepartDate"))}
            />
            <p id={`${ids.date}-h`} className="mt-1.5 text-xs text-muted">
              Pilih tanggal rencana keberangkatan komunitas Anda (antara{" "}
              {formatDateId(dateBounds.from)} s.d. {formatDateId(dateBounds.to)}
              ).
            </p>
            <FieldError
              id={`${ids.date}-e`}
              message={err("requestedDepartDate")}
            />
          </div>
        )}

        {/* 3. Jumlah Jamaah, Lansia, & Kebutuhan Kursi Roda */}
        <div className="rounded-2xl border border-line bg-cream/70 p-4 sm:p-5">
          <h4 className="text-sm font-extrabold text-ink">
            3. Estimasi Jumlah Jamaah &amp; Fasilitas Ramah Lansia
          </h4>
          <p className="mt-0.5 text-xs text-muted">
            Kapasitas ideal 1 bus pariwisata adalah 40 kursi. Mohon informasikan
            estimasi jamaah lansia agar tim kami menyiapkan pendampingan, kursi
            roda lipat, dan tabung oksigen Oxycan.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor={ids.pax} className="block text-xs font-bold text-ink">
                Total Jamaah (Orang) *
              </label>
              <input
                id={ids.pax}
                name="participantCount"
                type="number"
                inputMode="numeric"
                required
                min={pkg?.minParticipants ?? 20}
                max={pkg?.maxParticipants ?? 180}
                value={Number.isNaN(participantCount) ? "" : participantCount}
                onChange={(e) => {
                  const v = e.target.valueAsNumber;
                  setParticipantCount(v);
                  if (!Number.isNaN(v) && v >= 0) {
                    setElderlyCount((prev) => Math.min(prev, v));
                    setWheelchairCount((prev) => Math.min(prev, v));
                  }
                }}
                className={fieldCls}
                aria-invalid={Boolean(err("participantCount")) || !countValid}
              />
              <span className="mt-1 block text-[11px] text-muted">
                Rentang paket: {pkg?.minParticipants}–{pkg?.maxParticipants} org
              </span>
              <FieldError
                id={`${ids.pax}-e`}
                message={err("participantCount")}
              />
            </div>

            <div>
              <label
                htmlFor={ids.elderly}
                className="block text-xs font-bold text-ink"
              >
                Estimasi Lansia (&gt;60 thn)
              </label>
              <input
                id={ids.elderly}
                name="elderlyCount"
                type="number"
                inputMode="numeric"
                min={0}
                max={Number.isNaN(participantCount) ? 180 : participantCount}
                value={Number.isNaN(elderlyCount) ? "" : elderlyCount}
                onChange={(e) => setElderlyCount(e.target.valueAsNumber)}
                className={fieldCls}
                aria-invalid={Boolean(err("elderlyCount"))}
              />
              <span className="mt-1 block text-[11px] text-muted">
                Disiapkan 2 Oxycan / bus
              </span>
              <FieldError
                id={`${ids.elderly}-e`}
                message={err("elderlyCount")}
              />
            </div>

            <div>
              <label
                htmlFor={ids.wheelchair}
                className="block text-xs font-bold text-ink"
              >
                Kursi Roda Lipat (Unit)
              </label>
              <input
                id={ids.wheelchair}
                name="wheelchairCount"
                type="number"
                inputMode="numeric"
                min={0}
                max={Number.isNaN(participantCount) ? 10 : participantCount}
                value={Number.isNaN(wheelchairCount) ? "" : wheelchairCount}
                onChange={(e) => setWheelchairCount(e.target.valueAsNumber)}
                className={fieldCls}
                aria-invalid={Boolean(err("wheelchairCount"))}
              />
              <span className="mt-1 block text-[11px] text-muted">
                Gratis dipinjamkan selama tur
              </span>
              <FieldError
                id={`${ids.wheelchair}-e`}
                message={err("wheelchairCount")}
              />
            </div>
          </div>
        </div>

        {/* 4. Identitas Majelis / Komunitas / Instansi */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.orgName} className={labelCls}>
              4. Nama Majelis Taklim / Komunitas / Instansi *
            </label>
            <input
              id={ids.orgName}
              name="organizationName"
              type="text"
              required
              maxLength={150}
              placeholder="Contoh: Muslimat NU Ranting Wonokromo"
              className={fieldCls}
              aria-invalid={Boolean(err("organizationName"))}
            />
            <FieldError
              id={`${ids.orgName}-e`}
              message={err("organizationName")}
            />
          </div>

          <div>
            <label htmlFor={ids.orgType} className={labelCls}>
              Jenis Komunitas / Lembaga *
            </label>
            <select
              id={ids.orgType}
              name="organizationType"
              required
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              className={fieldCls}
              aria-invalid={Boolean(err("organizationType"))}
            >
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ORGANIZATION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <FieldError
              id={`${ids.orgType}-e`}
              message={err("organizationType")}
            />
          </div>
        </div>

        {/* 5. Data PIC (Ketua Rombongan / Panitia) */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor={ids.picName} className={labelCls}>
              5. Nama Lengkap PIC *
            </label>
            <input
              id={ids.picName}
              name="picName"
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Contoh: Hj. Siti Aminah"
              className={fieldCls}
              aria-invalid={Boolean(err("picName"))}
            />
            <FieldError id={`${ids.picName}-e`} message={err("picName")} />
          </div>

          <div>
            <label htmlFor={ids.wa} className={labelCls}>
              Nomor WhatsApp PIC *
            </label>
            <input
              id={ids.wa}
              name="whatsapp"
              type="tel"
              inputMode="tel"
              required
              maxLength={20}
              autoComplete="tel"
              placeholder="0858xxxxxxxx"
              className={fieldCls}
              aria-invalid={Boolean(err("whatsapp"))}
            />
            <FieldError id={`${ids.wa}-e`} message={err("whatsapp")} />
          </div>

          <div>
            <label htmlFor={ids.email} className={labelCls}>
              Email PIC{" "}
              <span className="font-normal text-muted">(opsional)</span>
            </label>
            <input
              id={ids.email}
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              placeholder="pengurus@majelis.id"
              className={fieldCls}
              aria-invalid={Boolean(err("email"))}
            />
            <FieldError id={`${ids.email}-e`} message={err("email")} />
          </div>
        </div>

        {/* 6. Wilayah & Kota/Kabupaten Titik Jemput */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.region} className={labelCls}>
              6. Wilayah Asal Rombongan *
            </label>
            <select
              id={ids.region}
              name="originRegion"
              required
              value={originRegion}
              onChange={(e) => setOriginRegion(e.target.value)}
              className={fieldCls}
              aria-invalid={Boolean(err("originRegion"))}
            >
              {ORIGIN_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {ORIGIN_REGION_LABELS[reg]}
                </option>
              ))}
            </select>
            <FieldError id={`${ids.region}-e`} message={err("originRegion")} />
          </div>

          <div>
            <label htmlFor={ids.city} className={labelCls}>
              Kota / Kabupaten &amp; Titik Jemput *
            </label>
            <input
              id={ids.city}
              name="originCity"
              type="text"
              required
              maxLength={100}
              placeholder="Contoh: Surabaya (Masjid Al-Akbar)"
              className={fieldCls}
              aria-invalid={Boolean(err("originCity"))}
            />
            <FieldError id={`${ids.city}-e`} message={err("originCity")} />
          </div>
        </div>

        {/* 7. Catatan Tambahan */}
        <div>
          <label htmlFor={ids.notes} className={labelCls}>
            7. Catatan Khusus Rombongan{" "}
            <span className="font-normal text-muted">(opsional)</span>
          </label>
          <textarea
            id={ids.notes}
            name="notes"
            rows={3}
            maxLength={600}
            placeholder="Contoh: Permintaan presentasi di hadapan pengurus majelis hari Minggu, atau preferensi kamar lantai dasar untuk jamaah lansia."
            className={fieldCls}
            aria-invalid={Boolean(err("notes"))}
          />
          <FieldError id={`${ids.notes}-e`} message={err("notes")} />
        </div>

        <Turnstile siteKey={siteKey} onToken={onToken} resetKey={resetKey} />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={
            pending ||
            !token ||
            !scheduleReady ||
            !countValid ||
            !specialNeedsValid
          }
          aria-disabled={
            pending ||
            !token ||
            !scheduleReady ||
            !countValid ||
            !specialNeedsValid
          }
        >
          {pending
            ? "Memproses Penawaran Rombongan…"
            : "Buat Kode Penawaran & Lanjut Koordinasi MOU via WhatsApp"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted">
          Data PIC dan nama majelis/instansi dijaga kerahasiaannya dan hanya
          digunakan oleh tim resmi Mubarak Miles Tour untuk penyusunan penawaran
          &amp; draf MOU rombongan Anda.
        </p>
      </form>
    </div>
  );
}
