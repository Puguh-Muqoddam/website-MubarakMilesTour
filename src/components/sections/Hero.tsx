"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bus,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AnimateIn } from "@/components/ui/AnimateIn";

const HERO_SLIDES = [
  {
    src: "/images/brosur/1.png",
    alt: "Brosur Resmi Ziarah Wali Songo + Tour Wisata Mubarak Miles Tour",
    caption: "Masjid Agung Demak · Menara Kudus · Masjid Agung Jawa Tengah",
  },
  {
    src: "/images/brosur/2.png",
    alt: "Fasilitas Lengkap Rombongan Ziarah Wali Songo Mubarak Miles Tour",
    caption: "Hotel Bintang 3 · Armada Bus Resmi SPIONAM · Ramah Jamaah Lansia",
  },
] as const;

const TRANSITION_DURATION_MS = 2200;
const SLIDE_INTERVAL_MS = 5500;

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    resetTimer();
  };

  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-emerald-deep text-cream"
    >
      {/* 1. Cross-Fade Carousel Background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.src}
              aria-hidden={!isActive}
              style={{ transitionDuration: `${TRANSITION_DURATION_MS}ms` }}
              className={`absolute inset-0 transition-opacity ease-in-out will-change-[opacity] ${
                isActive
                  ? "z-10 opacity-30"
                  : "pointer-events-none z-0 opacity-0"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                loading={idx === 0 ? undefined : "eager"}
                className="object-cover object-center scale-105 blur-[1px]"
                sizes="100vw"
              />
            </div>
          );
        })}
      </div>

      {/* 2. Emerald & Gold Radial/Linear Gradient Overlay untuk Kontras Teks WCAG AAA */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-deep/95 via-emerald-deep/90 to-emerald-mid/85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />

      {/* 3. Tombol Geser Slide Manual */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Geser ke latar gambar berikutnya"
        className="group absolute top-1/2 right-3 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-emerald-deep/50 text-cream opacity-60 backdrop-blur-xs transition-all duration-200 hover:scale-105 hover:bg-emerald-mid hover:opacity-100 focus-visible:opacity-100 sm:right-6 md:flex"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 stroke-current transition-transform group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <AnimateIn>
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-gold/40 bg-emerald-mid/80 px-4 py-1.5 text-xs font-bold tracking-wider text-gold uppercase shadow-xs">
              <span>✦ Ziarah Wali Songo + Tour Wisata</span>
              <span aria-hidden="true" className="text-cream/40">
                •
              </span>
              <span className="text-cream/95">
                Khusus Rombongan &amp; Majelis Taklim
              </span>
            </div>

            <h1
              id="hero-title"
              className="mt-6 font-sans text-4xl leading-[1.12] font-extrabold tracking-tight text-cream sm:text-5xl lg:text-6xl"
            >
              Perjalanan Ziarah Wali Songo yang{" "}
              <span className="font-serif font-semibold text-gold italic">
                Aman, Nyaman, &amp; Ramah Lansia.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/90 sm:text-lg">
              Mitra perjalanan resmi untuk{" "}
              <strong className="font-semibold text-gold">
                Majelis Taklim (Muslimat/Fatayat NU), Komunitas Pengajian, Pondok
                Pesantren, dan Yayasan
              </strong>{" "}
              di Surabaya Raya &amp; Jawa Timur. Kontrak satu harga{" "}
              <em>All-In Zero-Cash Hassle</em> dengan bimbingan Muthawwif
              bersanad, armada bus resmi SPIONAM/BLUE, serta fasilitas kursi
              roda &amp; oksigen portabel.
            </p>

            {/* Ringkasan Penawaran Utama */}
            <div className="mt-7 inline-flex flex-wrap items-baseline gap-x-4 gap-y-2 rounded-2xl border border-gold/35 bg-emerald-mid/75 px-5 py-3.5">
              <div>
                <span className="block text-xs font-semibold tracking-wider text-cream/75 uppercase">
                  Paket Kontrak Rombongan (±40 Jamaah/Bus)
                </span>
                <div className="mt-0.5 flex items-baseline gap-2.5">
                  <span className="text-sm font-bold text-cream/65 line-through decoration-promo-red decoration-2">
                    Rp1.499.000
                  </span>
                  <span className="font-sans text-2xl font-extrabold text-gold sm:text-3xl">
                    Rp1.399.000
                  </span>
                  <span className="text-xs font-medium text-cream/85">
                    / jamaah (All-In)
                  </span>
                </div>
              </div>
              <div className="border-l border-cream/20 pl-4">
                <span className="block text-xs font-semibold text-gold">
                  Batch Perdana Terjadwal
                </span>
                <span className="text-sm font-bold text-cream">
                  1 – 3 Februari 2027
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <ButtonLink href="/#pemesanan" variant="gold" size="lg">
                Ajukan Penawaran Rombongan
              </ButtonLink>
              <ButtonLink href="/#paket" variant="outline-light" size="lg">
                Lihat Paket &amp; Jadwal
              </ButtonLink>
            </div>

            {/* Indikator Slide */}
            <div className="mt-6 flex items-center gap-3 text-xs text-cream/75">
              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      resetTimer();
                    }}
                    aria-label={`Tampilkan latar ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-7 bg-gold"
                        : "w-2 bg-cream/35 hover:bg-cream/65"
                    }`}
                  />
                ))}
              </div>
              <span>{HERO_SLIDES[currentIndex].caption}</span>
            </div>
          </AnimateIn>

          {/* Kartu Pratinjau Brosur Resmi */}
          <AnimateIn delay={150}>
            <div className="relative mx-auto max-w-md rounded-3xl border border-gold/30 bg-emerald-mid/60 p-4 shadow-2xl backdrop-blur-xs">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-cream/15 bg-emerald-deep">
                <Image
                  src={HERO_SLIDES[currentIndex].src}
                  alt={HERO_SLIDES[currentIndex].alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 420px"
                  priority
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 px-1 text-xs text-cream/85">
                <span className="font-semibold text-gold">
                  ✦ Brosur Resmi Mubarak Miles Tour
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="font-bold text-cream underline decoration-gold/60 underline-offset-4 hover:text-gold"
                >
                  Lihat Halaman {currentIndex === 0 ? "2" : "1"} →
                </button>
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* 4. Strip Fakta Utama (Adaptasi Royal Holiday & Brosur) */}
        <AnimateIn delay={220}>
          <dl className="mt-14 grid gap-4 rounded-2xl border border-cream/15 bg-emerald-mid/80 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"
              >
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-cream/75 uppercase">
                  Durasi Perjalanan
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-cream">
                  3 Hari 2 Malam
                </dd>
                <p className="text-xs text-cream/75">
                  2 Malam menginap di Hotel Bintang 3
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"
              >
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-cream/75 uppercase">
                  Rute Terpadu
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-cream">
                  Total 12 Destinasi
                </dd>
                <p className="text-xs text-cream/75">
                  Makam Wali Songo, Masjid Agung, &amp; Wisata
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"
              >
                <Bus className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-cream/75 uppercase">
                  Armada &amp; Lansia
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-cream">
                  40 Kursi / Bus Resmi
                </dd>
                <p className="text-xs text-cream/75">
                  SPIONAM &amp; BLUE + Kursi Roda &amp; Oxycan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"
              >
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <dt className="text-xs font-semibold tracking-wider text-cream/75 uppercase">
                  Kontrak Syariah B2B
                </dt>
                <dd className="mt-0.5 text-lg font-extrabold text-gold">
                  All-In Tanpa Pungli
                </dd>
                <p className="text-xs text-cream/75">
                  MOU Bermaterai · DP 50% (H-30)
                </p>
              </div>
            </div>
          </dl>
        </AnimateIn>
      </Container>
    </section>
  );
}
