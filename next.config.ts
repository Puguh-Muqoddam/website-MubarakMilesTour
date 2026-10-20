import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const isDev = process.env.NODE_ENV === "development";

// CSP: hanya domain yang dipakai. Font di-self-host oleh next/font (tanpa Google Fonts runtime).
// - Turnstile: script + iframe challenges.cloudflare.com
// - Peta: iframe www.openstreetmap.org & tile.openstreetmap.org
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
  "font-src 'self'",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws:" : ""}`,
  "frame-src https://challenges.cloudflare.com https://www.openstreetmap.org https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  // Wajib untuk Prisma di workerd (docs OpenNext /howtos/db).
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  // pg memuat pg-cloudflare lewat kondisi export "workerd" yang tidak terlacak otomatis.
  outputFileTracingIncludes: { "/*": ["./node_modules/pg-cloudflare/**/*"] },
  images: {
    // Gambar statis di /public sudah dioptimasi saat ditambahkan (WebP, ukuran sesuai pemakaian).
    unoptimized: true,
  },
};

export default nextConfig;

if (
  process.env.NODE_ENV === "development" &&
  process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE
) {
  initOpenNextCloudflareForDev();
}
