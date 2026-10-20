import {
  Building,
  CalendarCheck2,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { formatRupiah } from "@/lib/site";
import { computeGroupContractPricing } from "@/server/booking/rules";
import { formatDateId } from "@/server/booking/whatsapp";
import type { PublicDepartureSlot, PublicPackage } from "@/server/db/types";

export function Packages({
  packages,
  slots,
}: {
  packages: PublicPackage[];
  slots: PublicDepartureSlot[];
}) {
  return (
    <section
      id="paket"
      aria-labelledby="packages-title"
      className="bg-cream py-20 lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="packages-title"
            eyebrow="Paket Kontrak Rombongan & Jadwal"
            align="center"
            title={
              <>
                Pilih Paket Rombongan{" "}
                <span className="font-serif font-semibold text-gold-dark italic">
                  Satu Harga All-In
                </span>
              </>
            }
          >
            Harga per jamaah di bawah ini berlaku untuk kontrak kolektif
            rombongan bus (ideal 40 kursi/bus). Seluruh fasilitas sudah
            termasuk, dengan sistem pembayaran bertahap{" "}
            <strong>DP 50% (H-30)</strong> dan{" "}
            <strong>Pelunasan 50% (H-14)</strong> setelah tanda tangan MOU.
          </SectionHeading>
        </AnimateIn>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {packages.map((pkg, idx) => {
            const pkgSlots = slots.filter((s) => s.packageId === pkg.id);
            const hasDiscount = pkg.pricePromoPerPax < pkg.priceNormalPerPax;
            const idealBusPricing = computeGroupContractPricing(pkg, 40);
            const isPrimary = !pkg.isCustomAllowed;

            return (
              <AnimateIn key={pkg.id} delay={idx * 100}>
                <article
                  className={`flex h-full flex-col justify-between rounded-3xl border p-6 shadow-md transition-all sm:p-8 ${
                    isPrimary
                      ? "border-emerald-deep/30 bg-sand ring-2 ring-gold-dark/30"
                      : "border-line bg-sand/60"
                  }`}
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold tracking-wide uppercase ${
                          isPrimary
                            ? "bg-emerald-deep text-gold"
                            : "bg-sage-card text-cream"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {isPrimary
                          ? "Paket Utama Brosur"
                          : "Fleksibel Sesuai MOU Majelis"}
                      </span>
                      <span className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-bold text-ink">
                        {pkg.durationDays} Hari {pkg.durationNights} Malam ·{" "}
                        {pkg.totalDestinations} Destinasi
                      </span>
                    </div>

                    <h3 className="mt-4 font-sans text-2xl font-extrabold text-ink sm:text-3xl">
                      {pkg.name}
                    </h3>

                    {pkg.description && (
                      <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
                        {pkg.description}
                      </p>
                    )}

                    {/* Blok Harga per Jamaah & Simulasi Kontrak 1 Bus (40 Jamaah) */}
                    <div className="mt-6 rounded-2xl border border-line bg-cream p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <div>
                          <span className="block text-xs font-bold tracking-wider text-muted uppercase">
                            {pkg.isCustomAllowed
                              ? "Patokan Harga Mulai"
                              : "Harga Promo All-In Rombongan"}
                          </span>
                          <div className="mt-1 flex items-baseline gap-2.5">
                            {hasDiscount && (
                              <span className="text-base font-bold text-promo-red line-through">
                                {formatRupiah(pkg.priceNormalPerPax)}
                              </span>
                            )}
                            <span className="font-sans text-3xl font-extrabold text-emerald-deep sm:text-4xl">
                              {formatRupiah(pkg.pricePromoPerPax)}
                            </span>
                            <span className="text-xs font-semibold text-muted">
                              / jamaah
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-deep/10 px-3 py-1.5 text-xs font-bold text-emerald-deep">
                          <Users className="h-4 w-4" />
                          <span>
                            {pkg.minParticipants}–{pkg.maxParticipants} Jamaah
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 border-t border-line pt-3 text-xs sm:grid-cols-2">
                        <div className="rounded-lg bg-sand/70 px-3 py-2">
                          <span className="block text-muted">
                            Simulasi 1 Bus Ideal (40 Jamaah):
                          </span>
                          <strong className="text-sm font-extrabold text-ink">
                            {formatRupiah(idealBusPricing.estimatedTotalPrice)}
                          </strong>
                        </div>
                        <div className="rounded-lg bg-sand/70 px-3 py-2">
                          <span className="block text-muted">
                            Estimasi DP 50% (Maks. H-30):
                          </span>
                          <strong className="text-sm font-extrabold text-gold-dark">
                            {formatRupiah(idealBusPricing.estimatedDpAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Daftar Fasilitas Termasuk */}
                    <div className="mt-6">
                      <h4 className="text-xs font-extrabold tracking-wider text-ink uppercase">
                        Fasilitas All-In yang Didapatkan Rombongan:
                      </h4>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {pkg.facilities.map((fac) => (
                          <li
                            key={fac}
                            className="flex items-start gap-2 text-sm text-ink/90"
                          >
                            <CheckCircle2
                              aria-hidden="true"
                              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-mid"
                            />
                            <span>{fac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hotel Mitra */}
                    {pkg.hotels.length > 0 && (
                      <div className="mt-5 rounded-xl border border-line bg-cream/70 p-3.5">
                        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-emerald-deep uppercase">
                          <Building className="h-4 w-4" />
                          <span>Akomodasi Hotel Bintang 3:</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {pkg.hotels.join(" • ")}
                        </p>
                      </div>
                    )}

                    {/* Slot Jadwal Keberangkatan dari Database */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                        <CalendarCheck2 className="h-4 w-4 text-emerald-deep" />
                        <span>
                          {pkgSlots.length > 0
                            ? "Slot Jadwal Keberangkatan Terdekat:"
                            : "Jadwal Keberangkatan:"}
                        </span>
                      </div>

                      {pkgSlots.length > 0 ? (
                        <ul className="mt-2.5 space-y-2">
                          {pkgSlots.map((slot) => {
                            const isAvailable =
                              !slot.isClosed && slot.remainingRombonganQuota > 0;
                            return (
                              <li
                                key={slot.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-cream px-4 py-2.5 text-sm"
                              >
                                <div>
                                  <p className="font-bold text-ink">
                                    {slot.label}
                                  </p>
                                  <p className="text-xs text-muted">
                                    Berangkat: {formatDateId(slot.departDate)} ·
                                    Ideal {slot.seatCapacityPerBus} kursi/bus
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    isAvailable
                                      ? "bg-success/15 text-success"
                                      : "bg-danger/15 text-danger"
                                  }`}
                                >
                                  {isAvailable
                                    ? `Tersedia ${slot.remainingRombonganQuota} dari ${slot.maxRombonganQuota} Kuota Bus`
                                    : slot.closedReason || "Kuota Penuh"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="mt-2 rounded-xl border border-line bg-cream px-4 py-3 text-sm text-muted">
                          Tanggal keberangkatan, titik penjemputan, dan jumlah
                          armada bus ditentukan sepenuhnya oleh kesepakatan MOU
                          pengurus majelis/instansi Anda (minimal H-14).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA ke Form Penawaran Rombongan */}
                  <div className="mt-8 border-t border-line pt-5">
                    <ButtonLink
                      href="/#pemesanan"
                      variant={isPrimary ? "primary" : "outline"}
                      size="lg"
                      className="w-full"
                    >
                      {isPrimary
                        ? "Ajukan Penawaran & Kunci Jadwal Ini"
                        : "Konsultasikan Jadwal Custom Rombongan"}
                    </ButtonLink>
                  </div>
                </article>
              </AnimateIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
