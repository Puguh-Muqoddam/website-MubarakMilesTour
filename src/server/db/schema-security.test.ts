import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIXTURE_DEPARTURE_SLOTS,
  FIXTURE_DESTINATIONS,
  FIXTURE_FAQS,
  FIXTURE_PACKAGES,
} from "./fixtures";

const sqlSetup = readFileSync(
  path.resolve(__dirname, "../../../prisma/manual/00-setup-database-baru.sql"),
  "utf8",
);

const ALL_TABLES = [
  "_prisma_migrations",
  "Package",
  "DepartureSlot",
  "GroupBooking",
  "BookingStatusLog",
  "PaymentLog",
  "Destination",
  "Faq",
  "ClosedDate",
  "RateLimit",
];

describe("Hardening SQL & Integritas Fixtures (Tahap 2)", () => {
  it.each(ALL_TABLES)("mengaktifkan Row Level Security (RLS) pada tabel %s", (tableName) => {
    expect(sqlSetup).toContain(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`);
  });

  it("mencabut seluruh hak akses anon dan authenticated di schema public", () => {
    expect(sqlSetup).toContain("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;");
    expect(sqlSetup).toContain(
      "REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;",
    );
    expect(sqlSetup).toContain(
      "REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;",
    );
  });

  it("memasang CHECK constraints pada harga, kuota, dan jumlah peserta", () => {
    expect(sqlSetup).toContain('CONSTRAINT "Package_price_check"');
    expect(sqlSetup).toContain('CONSTRAINT "Package_participants_check"');
    expect(sqlSetup).toContain('CONSTRAINT "DepartureSlot_quota_check"');
    expect(sqlSetup).toContain('CONSTRAINT "GroupBooking_participants_check"');
    expect(sqlSetup).toContain('CONSTRAINT "GroupBooking_price_check"');
    expect(sqlSetup).toContain('CONSTRAINT "PaymentLog_amount_check"');
  });

  it("memastikan data fixtures memenuhi aturan integritas bisnis", () => {
    expect(FIXTURE_PACKAGES.length).toBeGreaterThanOrEqual(2);
    for (const pkg of FIXTURE_PACKAGES) {
      expect(pkg.pricePromoPerPax).toBeGreaterThan(0);
      expect(pkg.pricePromoPerPax).toBeLessThanOrEqual(pkg.priceNormalPerPax);
      expect(pkg.minParticipants).toBeGreaterThanOrEqual(1);
      expect(pkg.maxParticipants).toBeGreaterThanOrEqual(pkg.minParticipants);
    }

    expect(FIXTURE_DEPARTURE_SLOTS.length).toBeGreaterThanOrEqual(1);
    expect(FIXTURE_DESTINATIONS).toHaveLength(12);
    expect(FIXTURE_FAQS.length).toBeGreaterThanOrEqual(5);
  });
});
