import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { getContactWhatsapp } from "@/lib/public-config";
import { normalizeBookingCode } from "@/server/booking/code";
import { SuccessDetails } from "./SuccessDetails";

export const metadata: Metadata = {
  title: "Permintaan Penawaran Terkirim — Mubarak Miles Tour",
  robots: { index: false, follow: false },
};

// Tidak membaca PII dari database berdasarkan URL/kode agar tidak dapat di-enumerasi pihak lain.
// Detail ringkasan dibaca dari sessionStorage browser pemesan sendiri.
export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string }>;
}) {
  const params = await searchParams;
  const rawKode = typeof params.kode === "string" ? params.kode : "";
  const cleaned = normalizeBookingCode(rawKode);
  const code = /^[A-HJKMNP-Z2-9]{8}$/.test(cleaned) ? cleaned : null;
  const whatsapp = getContactWhatsapp();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="konten" className="flex-1 bg-sand py-16 sm:py-20 lg:py-24">
        <Container className="max-w-3xl">
          <SuccessDetails code={code} fallbackWhatsapp={whatsapp} />
        </Container>
      </main>
      <Footer whatsapp={whatsapp} />
    </div>
  );
}
