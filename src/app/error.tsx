"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Pesan ramah pengguna; detail teknis internal tidak pernah ditampilkan ke publik.
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="konten" className="flex min-h-screen items-center bg-sand py-24 lg:py-32">
      <Container className="max-w-2xl text-center">
        <Eyebrow>Terjadi Kendala Sementara</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-bold text-ink sm:text-5xl">
          Maaf, halaman belum berhasil dimuat
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Permintaan Anda belum dapat diproses saat ini. Silakan muat ulang halaman atau kembali ke beranda.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={reset}>
            Coba Muat Ulang
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Kembali ke Beranda
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
