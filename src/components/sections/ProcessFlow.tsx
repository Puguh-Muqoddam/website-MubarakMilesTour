import {
  Bus,
  CalendarRange,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  MessageSquareMore,
  WalletCards,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";

const STEPS = [
  {
    step: "01",
    title: "Pilih Paket & Slot Jadwal",
    timing: "Tahap Awal",
    description:
      "PIC Majelis Taklim/Instansi memilih jadwal keberangkatan yang tersedia (misal 1–3 Feb 2027) atau mengajukan tanggal custom komunitas melalui form di bawah.",
    icon: CalendarRange,
  },
  {
    step: "02",
    title: "Tanda Tangan MOU Bermaterai",
    timing: "Penguncian Kuota",
    description:
      "Penyusunan dan penandatanganan Memorandum of Understanding (MOU) resmi di atas materai yang merinci fasilitas All-In, hotel, dan komitmen layanan.",
    icon: FileSignature,
  },
  {
    step: "03",
    title: "Pembayaran DP 50%",
    timing: "Maksimal H-30",
    description:
      "Pembayaran Down Payment (DP) sebesar 50% dari nilai kontrak rombongan paling lambat H-30 untuk mengunci unit bus pariwisata dan kamar hotel bintang 3.",
    icon: WalletCards,
  },
  {
    step: "04",
    title: "Pelunasan Sisa 50%",
    timing: "Maksimal H-14",
    description:
      "Pelunasan sisa kontrak 50% beserta penyerahan daftar nama jamaah final (untuk pendaftaran polis asuransi perjalanan syariah dan pembagian kamar).",
    icon: CreditCard,
  },
  {
    step: "05",
    title: "Grup WhatsApp Koordinasi",
    timing: "H-14 s.d. H-7",
    description:
      "Pembentukan grup koordinasi antara PIC komunitas, Tour Leader, dan Muthawwif untuk menyepakati titik kumpul penjemputan serta kebutuhan jamaah lansia.",
    icon: MessageSquareMore,
  },
  {
    step: "06",
    title: "Briefing & Ramp Check Bus",
    timing: "H-7 s.d. H-1",
    description:
      "Distribusi Ziarah Handbook, pengecekan kursi roda lipat & tabung Oxycan, serta inspeksi fisik kelaikan armada bus (SOP Ramp Check H-1).",
    icon: ClipboardCheck,
  },
  {
    step: "07",
    title: "Keberangkatan Rombongan",
    timing: "Hari-H",
    description:
      "Penjemputan tepat waktu di titik kumpul komunitas, doa keberangkatan bersama Muthawwif, dan perjalanan ziarah 3 Hari 2 Malam yang khusyuk & aman.",
    icon: Bus,
  },
] as const;

export function ProcessFlow() {
  return (
    <section
      id="alur"
      aria-labelledby="process-title"
      className="bg-emerald-mid py-20 text-cream lg:py-28"
    >
      <Container>
        <AnimateIn>
          <SectionHeading
            id="process-title"
            eyebrow="SOP Pelayanan B2B (Deal s.d. Berangkat)"
            tone="dark"
            align="center"
            title={
              <>
                7 Tahap Resmi Kerja Sama{" "}
                <span className="font-serif font-semibold text-gold italic">
                  Transparan &amp; Terlindungi MOU
                </span>
              </>
            }
          >
            Alur kerja sama yang jelas dan terstruktur agar pengurus majelis
            memiliki kepastian jadwal, anggaran, dan jaminan fasilitas sejak
            awal.
          </SectionHeading>
        </AnimateIn>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <AnimateIn
                key={item.step}
                delay={idx * 60}
                className={isLast ? "sm:col-span-2 lg:col-span-2" : ""}
              >
                <li className="flex h-full flex-col justify-between rounded-2xl border border-cream/20 bg-emerald-deep/85 p-6 shadow-md">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold font-sans text-sm font-extrabold text-ink">
                        {item.step}
                      </span>
                      <span className="rounded-full border border-gold/40 bg-emerald-mid px-3 py-1 text-xs font-bold text-gold">
                        {item.timing}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2.5">
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-gold"
                      />
                      <h3 className="font-sans text-lg font-extrabold text-cream">
                        {item.title}
                      </h3>
                    </div>

                    <p className="mt-2.5 text-sm leading-relaxed text-cream/90">
                      {item.description}
                    </p>
                  </div>
                </li>
              </AnimateIn>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
