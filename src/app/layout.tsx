import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { connection } from "next/server";
import { siteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const TITLE = `${SITE.name} — ${SITE.tagline}`;
const DESCRIPTION =
  "Layanan perjalanan wisata religi Ziarah Wali Songo 3 Hari 2 Malam (12 Destinasi) khusus rombongan Majelis Taklim, Komunitas, Pesantren, dan Yayasan di Jawa Timur. Paket All-In, armada resmi SPIONAM/BLUE, ramah lansia.";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "/",
      siteName: SITE.name,
      title: TITLE,
      description: DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${cormorant.variable} ${jakarta.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
