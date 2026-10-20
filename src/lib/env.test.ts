import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  const validSource = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "anon-key-placeholder",
    ADMIN_EMAILS: "Admin1@Example.com, admin2@example.com ",
    BOOKING_WHATSAPP_NUMBER: "6285847879784",
    SITE_URL: "https://mubarakmilestour.com",
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  };

  it("menerima env valid dan menormalisasi ADMIN_EMAILS ke huruf kecil", () => {
    const parsed = parseServerEnv(validSource);
    expect(parsed.ADMIN_EMAILS).toEqual(["admin1@example.com", "admin2@example.com"]);
    expect(parsed.BOOKING_WHATSAPP_NUMBER).toBe("6285847879784");
  });

  it("menolak nomor WA yang tidak diawali 62 tanpa membocorkan nilai di pesan error", () => {
    expect(() =>
      parseServerEnv({
        ...validSource,
        BOOKING_WHATSAPP_NUMBER: "085847879784",
      }),
    ).toThrow(/BOOKING_WHATSAPP_NUMBER/);
  });

  it("menyebut nama variabel yang hilang jika env kosong", () => {
    expect(() => parseServerEnv({})).toThrow(/SUPABASE_URL/);
  });
});
