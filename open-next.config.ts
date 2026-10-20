import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Tanpa incremental cache (R2/KV): halaman publik dirender dinamis.
export default defineCloudflareConfig({});
