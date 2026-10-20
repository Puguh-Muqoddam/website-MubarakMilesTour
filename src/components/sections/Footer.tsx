import Link from "next/link";
import { Compass, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { formatPhoneId } from "@/lib/public-config";

export function Footer({ whatsapp }: { whatsapp: string }) {
  const quickWaUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    "Assalamu'alaikum Tim Mubarak Miles Tour, saya ingin menanyakan penawaran Ziarah Wali Songo untuk rombongan kami.",
  )}`;

  return (
    <footer id="kontak" className="border-t border-cream/15 bg-emerald-deep text-cream">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_0.8fr_1fr]">
        {/* Kolom 1: Identitas & Kontak */}
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-emerald-mid text-gold"
            >
              <Compass className="h-6 w-6" />
            </span>
            <div>
              <p className="font-sans text-2xl font-extrabold tracking-tight text-cream">
                {SITE.name}
              </p>
              <p className="font-serif text-sm text-gold italic">
                {SITE.tagline}
              </p>
            </div>
          </div>

          <address className="mt-6 space-y-2.5 text-sm leading-relaxed text-cream/85 not-italic">
            <div className="flex items-start gap-2.5">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
              />
              <div>
                {SITE.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-gold" />
              <a
                href={quickWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold underline-offset-4 hover:underline"
              >
                WhatsApp: {formatPhoneId(whatsapp)} ({SITE.contact.picName})
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <a
                href={SITE.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/90 underline-offset-4 hover:text-gold hover:underline"
              >
                {SITE.contact.instagram}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-gold" />
              <a
                href={`mailto:${SITE.contact.email}`}
                className="text-cream/90 underline-offset-4 hover:text-gold hover:underline"
              >
                {SITE.contact.email}
              </a>
            </div>
          </address>
        </div>

        {/* Kolom 2: Navigasi */}
        <nav aria-label="Navigasi footer">
          <Eyebrow tone="dark">Navigasi</Eyebrow>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-cream/90 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#pemesanan"
                className="font-bold text-gold transition-colors hover:text-cream"
              >
                Ajukan Penawaran Rombongan
              </Link>
            </li>
          </ul>
        </nav>

        {/* Kolom 3: Ketentuan Kontrak Rombongan */}
        <div>
          <Eyebrow tone="dark">Ketentuan Rombongan B2B</Eyebrow>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/85">
            <li>• Kapasitas ideal 40 jamaah/bus (rentang 20–45 kursi)</li>
            <li>• Ikatan kerja sama resmi dengan MOU bermaterai</li>
            <li>• Down Payment (DP) 50% maksimal H-30 keberangkatan</li>
            <li>• Pelunasan 50% maksimal H-14 keberangkatan</li>
            <li>• Armada resmi SPIONAM Kemenhub &amp; Lulus Uji BLUE</li>
            <li>• Tersedia kursi roda lipat &amp; tabung oksigen Oxycan</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-cream/15 bg-emerald-deep">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/75 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name} — Surabaya, Jawa Timur. Hak
            cipta dilindungi.
          </p>
          <p>Wisata Religi Ziarah Wali Songo &amp; Tour Wisata B2B</p>
        </Container>
      </div>

      {/* Tombol WhatsApp Mengambang di Kanan Bawah (Adaptasi Royal Holiday) */}
      <a
        href={quickWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Konsultasi via WhatsApp bersama ${SITE.contact.picName}`}
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-gold/50 bg-emerald-mid px-4 py-3 text-xs font-extrabold text-cream shadow-xl transition-transform duration-200 hover:scale-105 hover:bg-emerald-deep sm:px-5 sm:text-sm"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink"
        >
          <MessageCircle className="h-4 w-4" />
        </span>
        <span className="max-sm:sr-only">
          Chat WA ({SITE.contact.picName})
        </span>
      </a>
    </footer>
  );
}
