import { MessageCircle, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SITE } from "@/lib/site";
import { formatPhoneId } from "@/lib/public-config";
import type { PublicFaq } from "@/server/db/types";

// Menggunakan elemen native <details>/<summary> agar sepenuhnya aksesibel via keyboard tanpa JS.
export function Faq({
  items,
  whatsapp,
}: {
  items: PublicFaq[];
  whatsapp: string;
}) {
  const consultText = encodeURIComponent(
    "Assalamu'alaikum Tim Mubarak Miles Tour (Tiya), saya ingin berkonsultasi mengenai rencana perjalanan Ziarah Wali Songo untuk rombongan/majelis kami.",
  );
  const waHref = `https://wa.me/${whatsapp}?text=${consultText}`;

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-cream py-20 lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="faq-title"
            eyebrow="Pertanyaan Umum Pengurus Rombongan (FAQ)"
            align="center"
            title={
              <>
                Hal yang Sering Ditanyakan{" "}
                <span className="font-serif font-semibold text-gold-dark italic">
                  PIC Majelis &amp; Komunitas
                </span>
              </>
            }
          >
            Penjelasan transparan seputar kontrak All-In, mekanisme MOU &amp; DP
            50%, fasilitas ramah lansia, serta keamanan armada bus.
          </SectionHeading>
        </AnimateIn>

        <AnimateIn delay={120}>
          <div className="mx-auto mt-12 max-w-4xl divide-y divide-line rounded-3xl border border-line bg-sand/60 px-6 sm:px-8">
            {items.map((f, i) => (
              <details key={f.id} className="group py-6" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-sans text-lg font-extrabold text-ink [&::-webkit-details-marker]:hidden sm:text-xl">
                  <span>{f.question}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-deep text-sm font-bold text-gold transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </AnimateIn>

        {/* Kartu Konsultasi Rombongan (Adaptasi Dreamtour) */}
        <AnimateIn delay={180}>
          <div className="mt-16 rounded-3xl border border-gold/35 bg-gradient-to-r from-emerald-deep via-emerald-mid to-emerald-deep p-8 text-cream shadow-xl sm:p-10">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1 text-xs font-bold tracking-wider text-gold uppercase">
                  <PhoneCall className="h-3.5 w-3.5" />
                  Layanan Konsultasi Panitia &amp; Pengurus Majelis
                </span>
                <h3 className="mt-3 font-sans text-2xl font-extrabold text-cream sm:text-3xl">
                  Ingin Presentasi di Hadapan Pengurus atau Butuh Draf MOU?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/90 sm:text-base">
                  Tim Mubarak Miles Tour siap membantu menyiapkan rincian
                  anggaran, menyusun jadwal khusus komunitas Anda, atau
                  berdiskusi langsung bersama pengurus di Surabaya Raya.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <ButtonLink href="/#pemesanan" variant="gold" size="lg">
                  Isi Form Penawaran Rombongan
                </ButtonLink>
                <ButtonLink
                  href={waHref}
                  external
                  variant="outline-light"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    Hubungi {SITE.contact.picName} ({formatPhoneId(whatsapp)})
                  </span>
                </ButtonLink>
              </div>
            </div>
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
