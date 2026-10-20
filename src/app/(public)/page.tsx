import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WhyUs } from "@/components/sections/WhyUs";
import { Packages } from "@/components/sections/Packages";
import { MapAndHotels } from "@/components/sections/MapAndHotels";
import { ProcessFlow } from "@/components/sections/ProcessFlow";
import { BookingSection } from "@/components/sections/BookingSection";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { getContactWhatsapp, getTurnstileSiteKey } from "@/lib/public-config";
import { buildTravelAgencyJsonLd, siteUrl } from "@/lib/seo";
import { bookingWindow } from "@/server/booking/rules";
import {
  getDepartureSlots,
  getDestinations,
  getFaqs,
  getPackages,
} from "@/server/db/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [packages, slots, destinations, faqs] = await Promise.all([
    getPackages(),
    getDepartureSlots(),
    getDestinations(),
    getFaqs(),
  ]);
  const whatsapp = getContactWhatsapp();
  const siteKey = getTurnstileSiteKey();
  const dateBounds = bookingWindow(new Date());
  const jsonLd = buildTravelAgencyJsonLd(siteUrl(), packages);

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Navbar />
      <main id="konten" className="flex-1">
        <Hero />
        <About />
        <WhyUs />
        <Packages packages={packages} slots={slots} />
        <MapAndHotels destinations={destinations} />
        <ProcessFlow />
        <BookingSection
          packages={packages}
          slots={slots}
          dateBounds={dateBounds}
          siteKey={siteKey}
        />
        <Faq items={faqs} whatsapp={whatsapp} />
      </main>
      <Footer whatsapp={whatsapp} />
    </div>
  );
}
