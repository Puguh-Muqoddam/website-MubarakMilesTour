import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { BookingForm } from "@/components/booking/BookingForm";
import type { PublicDepartureSlot, PublicPackage } from "@/server/db/types";

export function BookingSection({
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
  return (
    <section
      id="pemesanan"
      aria-labelledby="booking-title"
      className="bg-cream py-20 lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="booking-title"
            eyebrow="Permintaan Penawaran & Booking Rombongan"
            align="center"
            title={
              <>
                Ajukan Penawaran Kontrak &amp;{" "}
                <span className="font-serif font-semibold text-gold-dark italic">
                  Kunci Kuota Bus Anda
                </span>
              </>
            }
          >
            Lengkapi data rombongan di bawah ini untuk mendapatkan{" "}
            <strong>Kode Penawaran Resmi (`MMT-…`)</strong>, rincian estimasi
            kontrak All-In &amp; DP 50% (H-30), serta terhubung langsung ke
            WhatsApp PIC Mubarak Miles Tour untuk penjadwalan MOU.
          </SectionHeading>
        </AnimateIn>

        <AnimateIn delay={120}>
          <div className="mt-12">
            <BookingForm
              packages={packages}
              slots={slots}
              dateBounds={dateBounds}
              siteKey={siteKey}
            />
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
