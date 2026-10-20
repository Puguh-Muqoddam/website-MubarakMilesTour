import { describe, expect, it } from "vitest";
import { buildTravelAgencyJsonLd } from "./seo";
import { FIXTURE_PACKAGES } from "@/server/db/fixtures";

describe("buildTravelAgencyJsonLd (SEO & XSS safety)", () => {
  it("menghasilkan JSON-LD TravelAgency & TouristTrip yang valid dengan harga promo aktif", () => {
    const raw = buildTravelAgencyJsonLd(
      "https://mubarakmilestour.com",
      FIXTURE_PACKAGES,
    );
    const parsed = JSON.parse(raw);

    expect(parsed["@type"]).toBe("TravelAgency");
    expect(parsed.name).toBe("Mubarak Miles Tour");
    expect(parsed.url).toBe("https://mubarakmilestour.com");
    expect(parsed.makesOffer).toHaveLength(FIXTURE_PACKAGES.length);
    expect(parsed.makesOffer[0]).toMatchObject({
      "@type": "Offer",
      priceCurrency: "IDR",
      price: 1399000,
    });
  });

  it("meng-escape karakter < menjadi \\u003c agar aman dari injeksi </script>", () => {
    const maliciousPkg = [
      {
        ...FIXTURE_PACKAGES[0],
        description: "</script><script>alert(1)</script>",
      },
    ];
    const raw = buildTravelAgencyJsonLd(
      "https://mubarakmilestour.com",
      maliciousPkg,
    );

    expect(raw).not.toContain("</script>");
    expect(raw).toContain("\\u003c/script>");
  });
});
