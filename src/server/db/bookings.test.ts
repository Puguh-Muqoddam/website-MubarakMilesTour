import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import type { BookingInput } from "@/server/booking/input";
import { memoryLimit } from "@/server/security/rate-limit";
import {
  createFixtureGroupBooking,
  createGroupBooking,
} from "./bookings";
import { hashKey, windowStartFor } from "./rate-limit";

const NOW = new Date("2026-10-20T03:00:00Z");

const baseInput: BookingInput = {
  packageId: "pkg_walisongo_3h2m",
  departureSlotId: "slot_feb_2027_01",
  requestedDepartDate: "2027-02-01",
  participantCount: 40,
  elderlyCount: 12,
  wheelchairCount: 1,
  picName: "Hj. Siti Aminah",
  whatsapp: "6285847879784",
  email: "siti@majelis.id",
  organizationName: "Majelis Taklim Al-Ikhlas",
  organizationType: "MAJELIS_TAKLIM",
  originRegion: "SURABAYA_RAYA",
  originCity: "Surabaya",
  notes: "Mohon siapkan kursi roda lipat",
};

describe("Simulasi konkurensi SELECT ... FOR UPDATE pada createGroupBooking", () => {
  it("mencegah overbooking saat 2 rombongan memesan sisa 1 kuota bus secara bersamaan", async () => {
    // State slot di database tiruan: maxRombonganQuota = 2, sudah terisi 1 (sisa 1 kuota bus)
    const slotState = {
      id: "slot_feb_2027_01",
      packageId: "pkg_walisongo_3h2m",
      departDate: new Date("2027-02-01T00:00:00.000Z"),
      label: "Batch Perdana — 1–3 Februari 2027",
      maxRombonganQuota: 2,
      bookedRombonganCount: 1,
      isClosed: false,
      isActive: true,
    };

    const createdBookings: unknown[] = [];
    // Antrean kunci baris (mensimulasikan row-level lock PostgreSQL FOR UPDATE)
    let lockChain = Promise.resolve();

    const fakeDb = {
      package: {
        findUnique: async () => ({
          id: "pkg_walisongo_3h2m",
          name: "Ziarah Wali Songo + Tour Wisata (3H2M)",
          priceNormalPerPax: 1_499_000,
          pricePromoPerPax: 1_399_000,
          minParticipants: 20,
          maxParticipants: 45,
          isCustomAllowed: false,
          isActive: true,
        }),
      },
      closedDate: {
        findUnique: async () => null,
      },
      $transaction: async <T>(fn: (tx: unknown) => Promise<T>): Promise<T> => {
        let release!: () => void;
        const prev = lockChain;
        lockChain = new Promise<void>((r) => {
          release = r;
        });
        await prev;
        try {
          const tx = {
            $queryRaw: async () => [{ ...slotState }],
            departureSlot: {
              update: async () => {
                slotState.bookedRombonganCount += 1;
                return slotState;
              },
            },
            groupBooking: {
              create: async ({ data }: { data: unknown }) => {
                createdBookings.push(data);
                return data;
              },
            },
          };
          return await fn(tx);
        } finally {
          release();
        }
      },
    } as unknown as PrismaClient;

    // Dua permintaan masuk bersamaan untuk slot terakhir
    const [res1, res2] = await Promise.all([
      createGroupBooking(fakeDb, baseInput, NOW),
      createGroupBooking(
        fakeDb,
        {
          ...baseInput,
          picName: "H. Ahmad Fauzi",
          organizationName: "Komunitas Pengajian Al-Falah",
        },
        NOW,
      ),
    ]);

    const successes = [res1, res2].filter((r) => r.ok);
    const failures = [res1, res2].filter((r) => !r.ok);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toEqual({
      ok: false,
      error: "SLOT_QUOTA_EXCEEDED",
    });
    expect(slotState.bookedRombonganCount).toBe(2);
    expect(createdBookings).toHaveLength(1);
  });

  it("menolak paket reguler jika tidak menyertakan departureSlotId (SLOT_REQUIRED)", () => {
    const res = createFixtureGroupBooking(
      { ...baseInput, departureSlotId: undefined },
      NOW,
    );
    expect(res).toEqual({ ok: false, error: "SLOT_REQUIRED" });
  });

  it("mengizinkan paket custom rombongan memilih tanggal keberangkatan tanpa slot terjadwal", () => {
    const res = createFixtureGroupBooking(
      {
        ...baseInput,
        packageId: "pkg_custom_rombongan",
        departureSlotId: undefined,
        requestedDepartDate: "2027-03-15",
        participantCount: 80,
      },
      NOW,
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.recommendedBusCount).toBe(2);
      expect(res.summary.estimatedTotalPrice).toBe(80 * 1_399_000);
      expect(res.summary.estimatedDpAmount).toBe(55_960_000);
    }
  });
});

describe("Rate limit & hashing IP privasi", () => {
  it("menghasilkan hash SHA-256 deterministik 64 karakter hex tanpa menyimpan IP mentah", async () => {
    const h1 = await hashKey("203.0.113.42");
    const h2 = await hashKey("203.0.113.42");
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
    expect(h1).not.toContain("203.0.113.42");
  });

  it("membatasi maksimal 5 permintaan per 10 menit per key di memoryLimit", () => {
    const t0 = 1_700_000_000_000;
    const rule = { limit: 5, windowMs: 10 * 60 * 1000 };
    expect(windowStartFor(new Date(t0 + 12345), rule.windowMs).getTime()).toBe(
      Math.floor((t0 + 12345) / rule.windowMs) * rule.windowMs,
    );

    for (let i = 0; i < 5; i++) {
      expect(memoryLimit("test-ip-1", rule, t0 + i * 1000)).toBe(true);
    }
    expect(memoryLimit("test-ip-1", rule, t0 + 6000)).toBe(false);
    expect(memoryLimit("test-ip-2", rule, t0 + 6000)).toBe(true);
    expect(memoryLimit("test-ip-1", rule, t0 + 10 * 60 * 1000 + 1)).toBe(true);
  });
});
