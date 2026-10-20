import {
  Accessibility,
  BookOpenCheck,
  BusFront,
  Camera,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";

const BROCHURE_FEATURES = [
  {
    title: "Professional Muthawwif",
    subtitle: "Pembimbing Bersanad Aswaja",
    description:
      "Mendampingi pembacaan tahlil, tawassul, manaqib, serta mengisahkan sejarah dakwah tiap makam Wali Songo dengan khidmat.",
    icon: Sparkles,
  },
  {
    title: "Travel Insurance Syariah",
    subtitle: "Proteksi Mikro Tabarru'",
    description:
      "Seluruh anggota rombongan terdaftar dalam perlindungan asuransi perjalanan syariah sejak keberangkatan hingga kembali ke kota asal.",
    icon: ShieldCheck,
  },
  {
    title: "Akomodasi & Transport Resmi",
    subtitle: "Bus SPIONAM/BLUE & Hotel ★3",
    description:
      "Bus pariwisata AC eksekutif lulus uji berkala Kemenhub (SOP Ramp Check H-1) serta 2 malam menginap di hotel bintang 3.",
    icon: BusFront,
  },
  {
    title: "Travel Documentation",
    subtitle: "Foto & Video Kebersamaan",
    description:
      "Tim lapangan mengabadikan momen doa bersama dan kunjungan wisata di 12 destinasi sebagai kenang-kenangan majelis Anda.",
    icon: Camera,
  },
  {
    title: "Ziarah Handbook",
    subtitle: "Panduan Doa & Adab Ziarah",
    description:
      "Buku saku panduan bacaan dzikir, tahlil, dan profil singkat Wali Songo untuk memudahkan jamaah mengikuti rangkaian ibadah.",
    icon: BookOpenCheck,
  },
  {
    title: "Konsumsi 3x Sehari",
    subtitle: "Halal, Higienis, & Terjadwal",
    description:
      "Sajian makan pagi, siang, dan malam sebanyak 3 kali sehari dengan menu bergizi yang cocok untuk jamaah dewasa maupun lansia.",
    icon: Utensils,
  },
] as const;

export function WhyUs() {
  return (
    <section
      id="keunggulan"
      aria-labelledby="whyus-title"
      className="bg-emerald-deep py-20 text-cream lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="whyus-title"
            eyebrow="Kenapa Harus Kami?"
            tone="dark"
            align="center"
            title={
              <>
                6 Fasilitas Utama Brosur &amp;{" "}
                <span className="font-serif font-semibold text-gold italic">
                  Standar Ramah Lansia
                </span>
              </>
            }
          >
            Dirancang khusus untuk menjawab kekhawatiran ketua rombongan akan
            keselamatan armada, kesehatan jamaah sepuh, dan transparansi biaya.
          </SectionHeading>
        </AnimateIn>

        {/* 6 Kartu Sage-Card Sesuai Identitas Visual Brosur */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BROCHURE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <AnimateIn key={feat.title} delay={idx * 60}>
                <article className="flex h-full flex-col justify-between rounded-2xl border border-cream/20 bg-sage-card p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-deep text-gold shadow-xs"
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="rounded-full border border-cream/25 bg-emerald-deep/60 px-3 py-1 text-xs font-bold text-gold">
                        All-In Termasuk
                      </span>
                    </div>
                    <h3 className="mt-5 font-sans text-xl font-extrabold text-cream">
                      {feat.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-bold tracking-wide text-gold uppercase">
                      {feat.subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-cream/95">
                      {feat.description}
                    </p>
                  </div>
                </article>
              </AnimateIn>
            );
          })}
        </div>

        {/* Highlight Pilar Ramah Lansia & Zero-Cash Hassle */}
        <AnimateIn delay={200}>
          <div className="mt-12 grid gap-6 rounded-3xl border border-gold/35 bg-emerald-mid p-6 sm:p-8 lg:grid-cols-2">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-ink"
              >
                <Accessibility className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-sans text-lg font-extrabold text-gold sm:text-xl">
                  Pilar Ramah Lansia: Kursi Roda Lipat &amp; Oksigen Oxycan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/90">
                  Mayoritas jamaah Majelis Taklim berusia di atas 50 tahun.
                  Setiap bus kami lengkapi dengan{" "}
                  <strong className="font-semibold text-cream">
                    1 unit kursi roda lipat
                  </strong>{" "}
                  (sesuai kebutuhan rombongan),{" "}
                  <strong className="font-semibold text-cream">
                    2 tabung oksigen portabel (Oxycan)
                  </strong>
                  , kotak P3K lengkap, serta pemilihan titik transit dengan
                  toilet bersih dan ramah lansia.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-cream/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-ink"
              >
                <HeartPulse className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-sans text-lg font-extrabold text-gold sm:text-xl">
                  Prinsip Syariah: Zero-Cash Hassle (Tanpa Uang Printilan)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/90">
                  Tidak ada lagi tarikan uang dadakan di atas bus untuk tiket
                  masuk kawasan makam, parkir, tol, atau restribusi lokal yang
                  sering membuat pengurus rombongan sungkan. Seluruh komponen
                  operasional telah terangkum transparan di dalam{" "}
                  <strong className="font-semibold text-cream">
                    satu kontrak MOU di awal
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
