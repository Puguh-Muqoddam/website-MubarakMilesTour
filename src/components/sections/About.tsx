import {
  BookOpen,
  Building2,
  GraduationCap,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";

const COMMUNITY_SEGMENTS = [
  {
    title: "Majelis Taklim",
    description:
      "Program ziarah tahunan atau triwulanan jamaah pengajian dengan jadwal istirahat terukur, hotel bintang 3, dan pendampingan ramah lansia.",
    icon: Users,
    badge: "Prioritas Utama",
  },
  {
    title: "Komunitas Pengajian & Takmir Masjid",
    description:
      "Perjalanan religi jamaah masjid, paguyuban, atau komunitas warga dengan sistem kontrak satu pintu tanpa beban koordinasi teknis terpisah.",
    icon: Building2,
    badge: "1 Bus Rombongan",
  },
  {
    title: "Pondok Pesantren & Majelis Dzikir",
    description:
      "Rihlah ilmiah dan ziarah masyayikh Wali Songo bersama Muthawwif bersanad Aswaja yang menguasai sejarah dakwah Nusantara dan adab ziarah.",
    icon: BookOpen,
    badge: "Sanad Aswaja",
  },
  {
    title: "Yayasan & Sekolah Islam (MI / MTs / MA)",
    description:
      "Study tour religi terpadu yang menggabungkan edukasi sejarah Islam Jawa, wisata ikonik, asuransi perjalanan, dan dokumentasi kegiatan lengkap.",
    icon: GraduationCap,
    badge: "Edukasi & Religi",
  },
] as const;

export function About() {
  return (
    <section
      id="tentang"
      aria-labelledby="about-title"
      className="bg-cream py-20 lg:py-28"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <AnimateIn>
            <SectionHeading
              id="about-title"
              eyebrow="Tentang Mubarak Miles Tour"
              title={
                <>
                  Solusi Ziarah Rombongan Tanpa Beban Kepanitiaan{" "}
                  <span className="font-serif font-semibold text-gold-dark italic">
                    (Zero-Hassle B2B)
                  </span>
                </>
              }
            >
              <p>
                Banyak pengurus Majelis Taklim dan koordinator rombongan
                menghadapi tantangan dalam merencanakan ziarah Wali Songo secara
                mandiri: kepastian transparansi anggaran perjalanan, verifikasi
                kelayakan armada transportasi, hingga kenyamanan jamaah sepuh
                yang memerlukan akomodasi hotel dan waktu istirahat yang memadai.
              </p>
              <p className="mt-4">
                <strong>Mubarak Miles Tour (Surabaya)</strong> hadir khusus
                sebagai mitra perjalanan resmi <strong>B2B Rombongan</strong>.
                Melalui satu kesepakatan kontrak (MOU) terpadu untuk rombongan
                bus Anda—seluruh fasilitas armada resmi berizin Kemenhub,
                akomodasi 2 malam di hotel bintang 3, konsumsi prasmanan 3x
                sehari, bimbingan Muthawwif bersanad, hingga fasilitas ramah
                lansia telah dikelola secara profesional.
              </p>
            </SectionHeading>
          </AnimateIn>

          <AnimateIn delay={150}>
            <div className="grid gap-4 sm:grid-cols-2">
              {COMMUNITY_SEGMENTS.map((seg) => {
                const Icon = seg.icon;
                return (
                  <article
                    key={seg.title}
                    className="flex flex-col justify-between rounded-2xl border border-line bg-sand/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-dark/50 hover:bg-sand hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          aria-hidden="true"
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-deep text-gold"
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="rounded-full bg-emerald-deep/10 px-3 py-1 text-xs font-bold text-emerald-deep">
                          {seg.badge}
                        </span>
                      </div>
                      <h3 className="mt-4 font-sans text-lg font-extrabold text-ink">
                        {seg.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {seg.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </AnimateIn>
        </div>
      </Container>
    </section>
  );
}
