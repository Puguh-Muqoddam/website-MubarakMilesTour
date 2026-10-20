"use client";

import { useMemo, useState } from "react";
import { Building2, Compass, ExternalLink, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import type { PublicDestination } from "@/server/db/types";

const CATEGORIES = [
  { id: "ALL", label: "Semua Titik" },
  { id: "MAKAM", label: "Makam Wali Songo" },
  { id: "MASJID", label: "Masjid Agung" },
  { id: "WISATA", label: "Wisata Ikonik" },
  { id: "HOTEL", label: "Hotel Bintang 3" },
] as const;

const CATEGORY_BADGE: Record<string, string> = {
  MAKAM: "Ziarah Wali",
  MASJID: "Masjid Bersejarah",
  WISATA: "Tour Wisata",
  HOTEL: "Hotel Bintang 3",
};

function buildOsmEmbedUrl(lat: number, lng: number, delta = 0.04): string {
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function MapAndHotels({
  destinations,
}: {
  destinations: PublicDestination[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    destinations[0]?.slug ?? "",
  );

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return destinations;
    return destinations.filter((d) => d.category === activeCategory);
  }, [destinations, activeCategory]);

  const selected = useMemo(() => {
    return (
      destinations.find((d) => d.slug === selectedSlug) ??
      filtered[0] ??
      destinations[0]
    );
  }, [destinations, filtered, selectedSlug]);

  const hotelDestinations = useMemo(
    () => destinations.filter((d) => d.category === "HOTEL"),
    [destinations],
  );

  return (
    <section
      id="rute"
      aria-labelledby="rute-title"
      className="bg-sand py-20 lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="rute-title"
            eyebrow="Peta Rute 12 Destinasi & Akomodasi Hotel"
            title={
              <>
                Jalur Ziarah Terpadu{" "}
                <span className="font-serif font-semibold text-gold-dark italic">
                  Jawa Timur – Jawa Tengah
                </span>
              </>
            }
          >
            Rute disusun searah (Surabaya → Lamongan → Tuban → Kudus → Demak →
            Semarang → Pekalongan → Tegal) agar waktu tempuh efisien dan jamaah
            lansia mendapatkan waktu istirahat optimal di hotel.
          </SectionHeading>
        </AnimateIn>

        {/* Filter Kategori Destinasi */}
        <AnimateIn delay={100}>
          <div
            role="tablist"
            aria-label="Filter kategori destinasi"
            className="mt-8 flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const firstMatch =
                      cat.id === "ALL"
                        ? destinations[0]
                        : destinations.find((d) => d.category === cat.id);
                    if (firstMatch) setSelectedSlug(firstMatch.slug);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                    isSelected
                      ? "bg-emerald-deep text-gold shadow-xs"
                      : "border border-line bg-cream text-ink hover:border-emerald-deep/40"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </AnimateIn>

        {/* Grid Daftar Destinasi & Peta Interaktif OpenStreetMap */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimateIn delay={140}>
            <div className="grid max-h-[540px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {filtered.map((dest, idx) => {
                const isSelected = selected?.slug === dest.slug;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedSlug(dest.slug)}
                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-emerald-deep bg-emerald-deep text-cream shadow-md"
                        : "border-line bg-cream text-ink hover:border-emerald-deep/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isSelected
                              ? "bg-gold text-ink"
                              : "bg-emerald-deep/10 text-emerald-deep"
                          }`}
                        >
                          #{idx + 1} ·{" "}
                          {CATEGORY_BADGE[dest.category] ?? dest.category}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-gold" : "text-muted"
                          }`}
                        >
                          {dest.city}
                        </span>
                      </div>
                      <h3
                        className={`mt-2.5 font-sans text-base font-extrabold ${
                          isSelected ? "text-cream" : "text-ink"
                        }`}
                      >
                        {dest.name}
                      </h3>
                      <p
                        className={`mt-1.5 line-clamp-3 text-xs leading-relaxed ${
                          isSelected ? "text-cream/90" : "text-muted"
                        }`}
                      >
                        {dest.description}
                      </p>
                    </div>
                    <div
                      className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${
                        isSelected ? "text-gold" : "text-emerald-deep"
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Lihat Titik di Peta</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </AnimateIn>

          {/* Panel Peta & Detail Destinasi Terpilih */}
          <AnimateIn delay={180}>
            {selected && (
              <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-md">
                <div className="relative aspect-[16/10] w-full bg-sand">
                  <iframe
                    key={selected.slug}
                    title={`Peta lokasi ${selected.name} (${selected.city})`}
                    src={buildOsmEmbedUrl(selected.lat, selected.lng)}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-3 py-1 text-xs font-bold text-gold">
                      <Compass className="h-3.5 w-3.5" />
                      {CATEGORY_BADGE[selected.category] ?? selected.category} ·{" "}
                      {selected.city}
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=15/${selected.lat}/${selected.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-deep underline decoration-gold-dark underline-offset-4 hover:text-gold-dark"
                    >
                      <span>Buka Peta Penuh</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <h3 className="mt-3 font-sans text-xl font-extrabold text-ink sm:text-2xl">
                    {selected.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {selected.description}
                  </p>
                </div>
              </div>
            )}
          </AnimateIn>
        </div>

        {/* Showcase 2 Hotel Bintang 3 dari Brosur */}
        {hotelDestinations.length > 0 && (
          <AnimateIn delay={220}>
            <div className="mt-14 rounded-3xl border border-emerald-deep/20 bg-cream p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-extrabold tracking-wider text-gold-dark uppercase">
                    ✦ Standar Akomodasi Brosur Mubarak Miles Tour
                  </span>
                  <h3 className="mt-1 font-sans text-2xl font-extrabold text-ink">
                    2 Malam Menginap di Hotel Bintang 3 (Bukan Tidur di Bus)
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-deep px-4 py-1.5 text-xs font-bold text-gold sm:self-auto">
                  <Building2 className="h-4 w-4" />
                  Istirahat Berkualitas untuk Jamaah Lansia
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {hotelDestinations.map((hotel, idx) => (
                  <article
                    key={hotel.id}
                    className="flex flex-col justify-between rounded-2xl border border-line bg-sand/60 p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-emerald-deep/10 px-3 py-1 text-xs font-bold text-emerald-deep">
                          Malam ke-{idx + 1} · {hotel.city}
                        </span>
                        <span className="text-xs font-bold text-gold-dark">
                          ★★★ Hotel Bintang 3
                        </span>
                      </div>
                      <h4 className="mt-3 font-sans text-lg font-extrabold text-ink">
                        {hotel.name}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {hotel.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSlug(hotel.slug)}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-deep hover:text-gold-dark"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Tampilkan Lokasi {hotel.name} di Peta Atas</span>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </AnimateIn>
        )}
      </Container>
    </section>
  );
}
