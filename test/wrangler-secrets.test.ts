import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// wrangler.jsonc ikut di-commit ke repo: tidak boleh berisi rahasia.
const raw = readFileSync(path.resolve(__dirname, "../wrangler.jsonc"), "utf8");

const FORBIDDEN_VARS = [
  "TURNSTILE_SECRET_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
];

describe("wrangler.jsonc tanpa rahasia", () => {
  it.each(FORBIDDEN_VARS)("tidak mendefinisikan %s sebagai var", (name) => {
    expect(raw).not.toMatch(new RegExp(`"${name}"\\s*:`));
  });

  it("tidak berisi connection string, JWT, atau kunci rahasia", () => {
    expect(raw).not.toMatch(/postgres(ql)?:\/\/[^"\s]*:[^"\s]*@/);
    expect(raw).not.toMatch(/eyJhbGciOi[A-Za-z0-9_-]{10,}/);
    expect(raw).not.toMatch(/sb_secret_|sk_live_/);
  });
});
