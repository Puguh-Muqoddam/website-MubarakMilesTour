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

const KEYWORDS = [
  "ziarah wali songo",
  "paket ziarah wali songo",
  "ziarah wali songo surabaya",
  "tour ziarah wali songo jawa timur",
  "ziarah wali songo rombongan",
  "ziarah wali songo majelis taklim",
  "mubarak miles tour",
  "sewa bus ziarah wali songo",
  "paket ziarah wali songo 3 hari 2 malam",
  "ziarah wali songo ramah lansia",
  "biro perjalanan ziarah surabaya",
  "travel ziarah wali songo",
  "wisata religi wali songo",
  "makam sunan ampel",
  "menara kudus",
  "masjid agung demak",
  "masjid agung jawa tengah",
];

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const base = siteUrl();
  return {
    metadataBase: new URL(base),
    title: {
      default: TITLE,
      template: `%s | ${SITE.name}`,
    },
    description: DESCRIPTION,
    keywords: KEYWORDS,
    authors: [{ name: SITE.name, url: base }],
    creator: SITE.name,
    publisher: SITE.name,
    category: "travel",
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/images/logo.png", sizes: "705x705", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "/",
      siteName: SITE.name,
      title: TITLE,
      description: DESCRIPTION,
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Brosur Resmi ${SITE.name}`,
        },
        {
          url: "/images/logo.png",
          width: 705,
          height: 705,
          alt: `Logo ${SITE.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: ["/images/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
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
