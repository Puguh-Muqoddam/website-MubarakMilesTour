import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  return [
    {
      url: `${siteUrl()}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
