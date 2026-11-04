"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Building2,
  Camera,
  Compass,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import type { PublicDestination } from "@/server/db/types";

const CATEGORIES = [
  { id: "ALL", label: "Semua Titik (12 Destinasi + Hotel)" },
  { id: "MAKAM", label: "Makam Wali Songo" },
  { id: "MASJID", label: "Masjid Agung Bersejarah" },
  { id: "WISATA", label: "Tour Wisata Ikonik" },
  { id: "HOTEL", label: "Hotel Bintang 3" },
] as const;

const CATEGORY_BADGE: Record<string, string> = {
  MAKAM: "Ziarah Wali",
  MASJID: "Masjid Bersejarah",
  WISATA: "Tour Wisata",
  HOTEL: "Hotel Bintang 3",
};

export const OFFICIAL_HOTELS: PublicDestination[] = [
  {
    id: "hotel_tuban",
    slug: "hotel-de-la-charis-tuban",
    name: "Hotel De La Charis Tuban",
    city: "Tuban",
    category: "HOTEL",
    description:
      "Akomodasi Bintang 3 malam ke-1 di Kota Tuban. Kamar ber-AC, air hangat, lift ramah lansia, restoran halal, dan lingkungan tenang untuk pemulihan fisik jamaah setelah ziarah Surabaya, Gresik, dan Lamongan.",
    lat: -6.8988,
    lng: 112.0465,
    imageUrl: "/images/hotel/delacharis-tuban.jpeg",
  },
  {
    id: "hotel_tegal",
    slug: "hotel-lasnur-syariah-tegal",
    name: "Hotel Lasnur Syariah Tegal",
    city: "Tegal",
    category: "HOTEL",
    description:
      "Akomodasi Bintang 3 berkonsep syariah untuk malam ke-2 di Tegal. Fasilitas musholla bersih, tempat tidur nyaman, AC dingin, sarapan prasmanan halal, serta parkir bus yang luas dan aman.",
    lat: -6.8694,
    lng: 109.1352,
    imageUrl: "/images/hotel/lasnur-tegal.jpeg",
  },
];

const DESTINATION_GALLERY: Record<string, string[]> = {
  "makam-sunan-ampel": [
    "/images/destinasi/dest-ampel.jpeg",
    "/images/destinasi/dest-ampel-2.jpeg",
    "/images/destinasi/dest-ampel-sign.jpeg",
  ],
  "makam-sunan-gresik": [
    "/images/destinasi/dest-malik-ibrahim.jpeg",
    "/images/destinasi/dest-malik-ibrahim-2.jpeg",
  ],
  "makam-sunan-giri": [
    "/images/destinasi/dest-giri.jpeg",
    "/images/destinasi/dest-giri-2.jpeg",
    "/images/destinasi/dest-giri-3.jpeg",
    "/images/destinasi/dest-giri-4.jpeg",
  ],
  "makam-sunan-drajat": ["/images/destinasi/dest-drajat.jpeg"],
  "makam-sunan-bonang": [
    "/images/destinasi/dest-bonang.jpeg",
    "/images/destinasi/dest-bonang-2.jpeg",
    "/images/destinasi/dest-bonang-3.jpeg",
  ],
  "makam-sunan-kudus": [
    "/images/destinasi/dest-menara-kudus.jpeg",
    "/images/destinasi/dest-kudus-2.jpeg",
  ],
  "makam-sunan-muria": ["/images/destinasi/dest-muria.jpeg"],
  "makam-sunan-kalijaga": [
    "/images/destinasi/dest-kalijaga.jpeg",
    "/images/destinasi/dest-kalijaga-2.jpeg",
    "/images/destinasi/dest-kalijaga-3.jpeg",
  ],
  "masjid-agung-demak": [
    "/images/destinasi/dest-masjid-demak.jpeg",
    "/images/destinasi/dest-demak-museum.jpeg",
    "/images/destinasi/dest-demak-museum-2.jpeg",
  ],
  "masjid-agung-jawa-tengah": [
    "/images/destinasi/dest-majt.jpeg",
    "/images/destinasi/dest-majt-2.jpeg",
  ],
  "kota-lama-semarang": [
    "/images/destinasi/dest-kota-lama.jpeg",
    "/images/destinasi/dest-kota-lama-2.jpeg",
    "/images/destinasi/dest-kota-lama-museum.jpeg",
  ],
  "makam-sunan-gunung-jati": [
    "/images/destinasi/dest-gunung-jati.jpeg",
    "/images/destinasi/dest-gunung-jati-2.jpeg",
  ],
  "hotel-de-la-charis-tuban": ["/images/hotel/delacharis-tuban.jpeg"],
  "hotel-lasnur-syariah-tegal": ["/images/hotel/lasnur-tegal.jpeg"],
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
  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"photo" | "map">("photo");

  // Gabungkan destinasi dan hotel resmi agar pencarian & visualisasi terpadu
  const combinedPoints = useMemo(() => {
    return [...destinations, ...OFFICIAL_HOTELS];
  }, [destinations]);

  const filtered = useMemo(() => {
    if (activeCategory === "ALL") return destinations;
    if (activeCategory === "HOTEL") return OFFICIAL_HOTELS;
    return destinations.filter((d) => d.category === activeCategory);
  }, [destinations, activeCategory]);

  const selected = useMemo(() => {
    return (
      combinedPoints.find((d) => d.slug === selectedSlug) ??
      filtered[0] ??
      destinations[0]
    );
  }, [combinedPoints, filtered, selectedSlug, destinations]);

  const currentGallery = useMemo(() => {
    if (!selected) return [];
    const extra = DESTINATION_GALLERY[selected.slug];
    if (extra && extra.length > 0) return extra;
    return selected.imageUrl ? [selected.imageUrl] : [];
  }, [selected]);

  const activePhoto =
    currentGallery[galleryIndex] ?? selected?.imageUrl ?? "/images/brosur/1.webp";

  const handleSelectDestination = (slug: string) => {
    setSelectedSlug(slug);
    setGalleryIndex(0);
  };

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
            Rute disusun terpadu dan searah (Surabaya → Gresik → Lamongan →
            Tuban → Kudus → Demak → Semarang → Tegal → Cirebon) agar waktu
            tempuh optimal dan fisik jamaah lansia terlindungi dengan 2 malam
            istirahat di Hotel Bintang 3.
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
                    if (cat.id === "HOTEL") {
                      handleSelectDestination(OFFICIAL_HOTELS[0].slug);
                    } else if (cat.id === "ALL") {
                      handleSelectDestination(destinations[0]?.slug ?? "");
                    } else {
                      const match = destinations.find(
                        (d) => d.category === cat.id,
                      );
                      if (match) handleSelectDestination(match.slug);
                    }
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

        {/* Grid Daftar Destinasi & Peta/Foto Interaktif */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Kolom Kiri: Daftar Kartu Destinasi dengan Foto Asli */}
          <AnimateIn delay={140}>
            <div className="grid max-h-[640px] gap-3.5 overflow-y-auto pr-1.5 sm:grid-cols-2">
              {filtered.map((dest, idx) => {
                const isSelected = selected?.slug === dest.slug;
                const thumbImg =
                  DESTINATION_GALLERY[dest.slug]?.[0] ?? dest.imageUrl;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleSelectDestination(dest.slug)}
                    className={`group flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-deep bg-emerald-deep text-cream shadow-lg ring-2 ring-gold/40"
                        : "border-line bg-cream text-ink hover:border-emerald-deep/50 hover:shadow-xs"
                    }`}
                  >
                    {/* Thumbnail Foto Lokasi */}
                    {thumbImg && (
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                        <Image
                          src={thumbImg}
                          alt={dest.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        />
                        <div className="absolute top-2.5 left-2.5 rounded-full bg-emerald-deep/85 px-2.5 py-0.5 text-[10px] font-bold text-gold backdrop-blur-xs">
                          #{idx + 1} ·{" "}
                          {CATEGORY_BADGE[dest.category] ?? dest.category}
                        </div>
                        <div className="absolute top-2.5 right-2.5 rounded-full bg-cream/90 px-2 py-0.5 text-[10px] font-extrabold text-ink shadow-xs">
                          {dest.city}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        {!thumbImg && (
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
                        )}
                        <h3
                          className={`mt-1 font-sans text-base font-extrabold line-clamp-1 ${
                            isSelected ? "text-cream" : "text-ink"
                          }`}
                        >
                          {dest.name}
                        </h3>
                        <p
                          className={`mt-1.5 line-clamp-2 text-xs leading-relaxed ${
                            isSelected ? "text-cream/90" : "text-muted"
                          }`}
                        >
                          {dest.description}
                        </p>
                      </div>

                      <div
                        className={`mt-3 flex items-center justify-between border-t pt-2.5 text-xs font-bold ${
                          isSelected
                            ? "border-cream/15 text-gold"
                            : "border-line text-emerald-deep"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" />
                          <span>
                            {DESTINATION_GALLERY[dest.slug]?.length ?? 1} Foto
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 underline underline-offset-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Peta &amp; Detail</span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </AnimateIn>

          {/* Kolom Kanan: Panel Detail & Foto Asli / Peta Interaktif */}
          <AnimateIn delay={180}>
            {selected && (
              <div
                id="panel-detail-destinasi"
                className="overflow-hidden rounded-3xl border border-line bg-cream shadow-lg"
              >
                {/* Header Toggle Foto Asli vs Peta Interaktif */}
                <div className="flex items-center justify-between border-b border-line bg-sand/70 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("photo")}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                        viewMode === "photo"
                          ? "bg-emerald-deep text-gold shadow-xs"
                          : "text-ink hover:text-emerald-deep"
                      }`}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Dokumentasi Foto ({currentGallery.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("map")}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                        viewMode === "map"
                          ? "bg-emerald-deep text-gold shadow-xs"
                          : "text-ink hover:text-emerald-deep"
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Peta Interaktif</span>
                    </button>
                  </div>
                  <span className="text-[11px] font-semibold text-muted">
                    {selected.city}
                  </span>
                </div>

                {/* Display Media: Foto Asli atau Peta OSM */}
                {viewMode === "photo" ? (
                  <div className="relative aspect-[16/10] w-full bg-emerald-deep">
                    <Image
                      src={activePhoto}
                      alt={selected.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 500px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/75 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-cream">
                      <span className="rounded-full bg-emerald-deep/90 px-3 py-1 text-[11px] font-bold text-gold backdrop-blur-xs">
                        ✦ Dokumentasi Asli Mubarak Miles Tour
                      </span>
                      {currentGallery.length > 1 && (
                        <span className="text-[11px] text-cream/90 font-medium">
                          Foto {galleryIndex + 1} dari {currentGallery.length}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}

                {/* Multi-Photo Gallery Selector (jika memiliki lebih dari 1 foto) */}
                {viewMode === "photo" && currentGallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto border-b border-line bg-sand/40 p-3">
                    {currentGallery.map((imgSrc, gIdx) => (
                      <button
                        key={imgSrc}
                        type="button"
                        onClick={() => setGalleryIndex(gIdx)}
                        aria-label={`Lihat foto ${gIdx + 1} dari ${selected.name}`}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          gIdx === galleryIndex
                            ? "border-emerald-deep ring-2 ring-gold"
                            : "border-line opacity-75 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={imgSrc}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Info Text Destinasi Terpilih */}
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-3 py-1 text-xs font-bold text-gold">
                      <Compass className="h-3.5 w-3.5" />
                      {CATEGORY_BADGE[selected.category] ??
                        selected.category} · {selected.city}
                    </span>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=15/${selected.lat}/${selected.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-deep underline decoration-gold-dark underline-offset-4 hover:text-gold-dark"
                    >
                      <span>Buka di OpenStreetMap</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <h3 className="mt-3 font-sans text-xl font-extrabold text-ink sm:text-2xl">
                    {selected.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {selected.description}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-xs font-semibold text-ink">
                    <span className="text-muted">Koordinat Titik:</span>
                    <code className="rounded-md bg-sand px-2 py-1 font-mono text-[11px] text-emerald-deep">
                      {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                    </code>
                    {selected.category === "HOTEL" && (
                      <span className="rounded-full bg-gold/30 px-2.5 py-0.5 text-xs font-bold text-ink">
                        ★ Hotel Bintang 3 Resmi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </AnimateIn>
        </div>

        {/* Showcase 2 Hotel Bintang 3 dari Brosur Resmi */}
        <AnimateIn delay={220}>
          <div className="mt-14 rounded-3xl border border-emerald-deep/20 bg-cream p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-gold-dark uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Standar Akomodasi Brosur Mubarak Miles Tour
                </span>
                <h3 className="mt-1 font-sans text-2xl font-extrabold text-ink">
                  Akomodasi Hotel Bintang 3 Selama 2 Malam
                </h3>
              </div>
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-deep px-4 py-1.5 text-xs font-bold text-gold sm:self-auto">
                <Building2 className="h-4 w-4" />
                Istirahat Berkualitas Jamaah Lansia
              </span>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {OFFICIAL_HOTELS.map((hotel, idx) => (
                <article
                  key={hotel.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-sand/50 transition-all hover:border-emerald-deep/40 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-sand">
                    {hotel.imageUrl && (
                      <Image
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    )}
                    <div className="absolute top-3 left-3 rounded-full bg-emerald-deep/90 px-3 py-1 text-xs font-bold text-gold backdrop-blur-xs">
                      Malam ke-{idx + 1} · {hotel.city}
                    </div>
                    <div className="absolute top-3 right-3 rounded-full bg-cream/95 px-2.5 py-1 text-xs font-extrabold text-ink shadow-xs">
                      ★★★ Bintang 3
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h4 className="font-sans text-lg font-extrabold text-ink">
                        {hotel.name}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {hotel.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectDestination(hotel.slug);
                        setViewMode("photo");
                        document
                          .getElementById("panel-detail-destinasi")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                      }}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-deep hover:text-gold-dark"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Lihat Foto &amp; Lokasi di Panel Detail ↑</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
