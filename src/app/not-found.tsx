import { connection } from "next/server";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getContactWhatsapp } from "@/lib/public-config";

export default async function NotFound() {
  await connection();
  const whatsapp = getContactWhatsapp();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="konten" className="flex flex-1 items-center bg-sand py-24 lg:py-32">
        <Container className="max-w-2xl text-center">
          <Eyebrow>404 — Halaman Tidak Ditemukan</Eyebrow>
          <h1 className="mt-3 font-serif text-4xl font-bold text-ink sm:text-5xl">
            Maaf, halaman yang Anda tuju tidak tersedia
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Tautan mungkin sudah berubah atau halaman telah dipindahkan. Silakan kembali ke beranda untuk melihat paket Ziarah Wali Songo 3 Hari 2 Malam &amp; jadwal keberangkatan rombongan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" size="lg">
              Kembali ke Beranda
            </ButtonLink>
            <ButtonLink href="/#booking" variant="outline" size="lg">
              Ajukan Penawaran Rombongan
            </ButtonLink>
          </div>
        </Container>
      </main>
      <Footer whatsapp={whatsapp} />
    </div>
  );
}
