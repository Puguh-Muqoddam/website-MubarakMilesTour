import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/pesanan/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/pesanan/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/images/"],
        disallow: ["/admin", "/pesanan/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
