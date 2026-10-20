import "server-only";
import { SITE } from "./site";
import type { PublicPackage } from "@/server/db/types";

/** URL kanonis situs dari env runtime SITE_URL (tanpa garis miring akhir). */
export function siteUrl(): string {
  const v = process.env.SITE_URL;
  if (v && /^https?:\/\//.test(v)) return v.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") throw new Error("SITE_URL belum diisi");
  return "http://localhost:3000";
}

/**
 * Membangun JSON-LD terstruktur (`TravelAgency` + daftar `TouristTrip`) untuk SEO,
 * sekaligus meng-escape karakter `<` menjadi `\u003c` agar aman di dalam tag `<script>`.
 */
export function buildTravelAgencyJsonLd(
  baseUrl: string,
  packages: readonly PublicPackage[],
): string {
  const payload = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    description: SITE.tagline,
    url: baseUrl,
    telephone: `+${SITE.contact.whatsappDefault62}`,
    email: SITE.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surabaya",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    areaServed: "Jawa Timur, Indonesia",
    sameAs: [SITE.contact.instagramUrl],
    makesOffer: packages.map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      priceCurrency: "IDR",
      price:
        pkg.pricePromoPerPax > 0
          ? pkg.pricePromoPerPax
          : pkg.priceNormalPerPax,
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: pkg.minParticipants,
        maxValue: pkg.maxParticipants,
        unitText: "jamaah per rombongan bus",
      },
      itemOffered: {
        "@type": "TouristTrip",
        name: pkg.name,
        description: pkg.description ?? SITE.tagline,
        touristType:
          "Rombongan Majelis Taklim, Komunitas, Pondok Pesantren, Yayasan, & Sekolah",
      },
    })),
  };

  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
