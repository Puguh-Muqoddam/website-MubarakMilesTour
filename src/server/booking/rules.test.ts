import { describe, expect, it } from "vitest";
import {
  addDays,
  bookingWindow,
  checkRombonganQuota,
  computeContractDeadlines,
  computeDpAmount,
  computeGroupContractPricing,
  computeTotal,
  daysBetween,
  parseDateOnly,
  resolveUnitPrice,
  todayInJakarta,
  validateDepartDate,
  validateDepartureSlot,
  validateParticipantsAndSpecialNeeds,
} from "./rules";

// Selasa 20 Okt 2026 10:00 WIB = 03:00 UTC
const OCT_20_MORNING_WIB = new Date("2026-10-20T03:00:00Z");

describe("todayInJakarta & utilitas tanggal", () => {
  it("memakai zona waktu WIB (Asia/Jakarta), bukan UTC", () => {
    // 2026-10-20 18:30 UTC = 2026-10-21 01:30 WIB
    expect(todayInJakarta(new Date("2026-10-20T18:30:00Z"))).toBe("2026-10-21");
    // 2026-10-20 16:59:59 UTC = 2026-10-20 23:59:59 WIB
    expect(todayInJakarta(new Date("2026-10-20T16:59:59Z"))).toBe("2026-10-20");
  });

  it("parseDateOnly menolak tanggal tidak ada dan format salah", () => {
    expect(parseDateOnly("2027-02-29")).toBeNull();
    expect(parseDateOnly("2027-2-1")).toBeNull();
    expect(parseDateOnly("2027-02-01T00:00")).toBeNull();
    expect(parseDateOnly("2027-02-01")?.toISOString()).toBe(
      "2027-02-01T00:00:00.000Z",
    );
  });

  it("menghitung addDays, daysBetween, dan bookingWindow", () => {
    expect(addDays("2027-02-01", -30)).toBe("2027-01-02");
    expect(addDays("2027-02-01", -14)).toBe("2027-01-18");
    expect(daysBetween("2026-10-20", "2026-11-03")).toBe(14);
    expect(bookingWindow(OCT_20_MORNING_WIB)).toEqual({
      from: "2026-11-03",
      to: addDays("2026-10-20", 540),
    });
  });
});

describe("computeContractDeadlines (H-30 DP & H-14 Pelunasan)", () => {
  it("menghitung tenggat H-30 untuk DP 50% dan H-14 untuk pelunasan pada pemesanan normal", () => {
    const d = computeContractDeadlines("2027-02-01", "2026-10-20");
    expect(d.dpDeadline).toBe("2027-01-02"); // H-30 sebelum 1 Feb 2027
    expect(d.fullPaymentDeadline).toBe("2027-01-18"); // H-14 sebelum 1 Feb 2027
    expect(d.daysUntilDeparture).toBe(104);
  });

  it("memberikan grace +2 hari untuk DP jika pemesanan masuk kurang dari H-30 (namun >= H-14)", () => {
    // Booking pada 10 Jan 2027 untuk keberangkatan 1 Feb 2027 (H-22)
    const d = computeContractDeadlines("2027-02-01", "2027-01-10");
    expect(d.dpDeadline).toBe("2027-01-12"); // +2 hari sejak booking
    expect(d.fullPaymentDeadline).toBe("2027-01-18"); // H-14
  });

  it("membatasi grace DP agar tidak melewati tenggat pelunasan H-14", () => {
    // Booking tepat pada H-14 (18 Jan 2027)
    const d = computeContractDeadlines("2027-02-01", "2027-01-18");
    expect(d.dpDeadline).toBe("2027-01-18");
    expect(d.fullPaymentDeadline).toBe("2027-01-18");
  });
});

describe("validateDepartDate", () => {
  it("menerima jadwal keberangkatan tepat H-14 dan jadwal brosur 1 Feb 2027", () => {
    expect(validateDepartDate("2026-11-03", OCT_20_MORNING_WIB, false)).toEqual({
      ok: true,
    });
    expect(validateDepartDate("2027-02-01", OCT_20_MORNING_WIB, false)).toEqual({
      ok: true,
    });
  });

  it("menolak jadwal kurang dari H-14 (TOO_SOON)", () => {
    expect(validateDepartDate("2026-11-02", OCT_20_MORNING_WIB, false)).toEqual({
      ok: false,
      error: "TOO_SOON",
    });
  });

  it("menolak jadwal lebih dari 540 hari ke depan (TOO_FAR)", () => {
    const tooFar = addDays("2026-10-20", 541);
    expect(validateDepartDate(tooFar, OCT_20_MORNING_WIB, false)).toEqual({
      ok: false,
      error: "TOO_FAR",
    });
  });

  it("menolak tanggal tutup operasional dan tanggal tidak valid", () => {
    expect(validateDepartDate("2027-02-01", OCT_20_MORNING_WIB, true)).toEqual({
      ok: false,
      error: "DATE_CLOSED",
    });
    expect(validateDepartDate("bukan-tanggal", OCT_20_MORNING_WIB, false)).toEqual({
      ok: false,
      error: "INVALID_DATE",
    });
  });
});

describe("validateDepartureSlot & checkRombonganQuota", () => {
  const baseSlot = {
    isActive: true,
    isClosed: false,
    maxRombonganQuota: 2,
    bookedRombonganCount: 0,
  };

  it("menerima slot aktif yang masih memiliki kuota rombongan bus", () => {
    expect(validateDepartureSlot(baseSlot)).toEqual({ ok: true });
    expect(validateDepartureSlot({ ...baseSlot, bookedRombonganCount: 1 })).toEqual({
      ok: true,
    });
  });

  it("menolak slot null, tidak aktif, atau ditutup manual", () => {
    expect(validateDepartureSlot(null)).toEqual({
      ok: false,
      error: "SLOT_UNAVAILABLE",
    });
    expect(validateDepartureSlot({ ...baseSlot, isActive: false })).toEqual({
      ok: false,
      error: "SLOT_UNAVAILABLE",
    });
    expect(validateDepartureSlot({ ...baseSlot, isClosed: true })).toEqual({
      ok: false,
      error: "SLOT_UNAVAILABLE",
    });
  });

  it("menolak slot yang kuota rombongannya sudah penuh", () => {
    expect(validateDepartureSlot({ ...baseSlot, bookedRombonganCount: 2 })).toEqual({
      ok: false,
      error: "SLOT_QUOTA_EXCEEDED",
    });
    expect(checkRombonganQuota(1, 1, 2)).toEqual({ ok: true });
    expect(checkRombonganQuota(2, 1, 2)).toEqual({
      ok: false,
      error: "SLOT_QUOTA_EXCEEDED",
    });
  });
});

describe("validateParticipantsAndSpecialNeeds & perhitungan kontrak B2B", () => {
  const pkgReguler = {
    priceNormalPerPax: 1_499_000,
    pricePromoPerPax: 1_399_000,
    minParticipants: 20,
    maxParticipants: 45,
  };

  it("memvalidasi rentang jamaah (20-45) serta jumlah lansia dan kursi roda", () => {
    expect(
      validateParticipantsAndSpecialNeeds(pkgReguler, {
        participantCount: 40,
        elderlyCount: 15,
        wheelchairCount: 1,
      }),
    ).toEqual({ ok: true });

    expect(
      validateParticipantsAndSpecialNeeds(pkgReguler, {
        participantCount: 19,
        elderlyCount: 0,
        wheelchairCount: 0,
      }),
    ).toEqual({ ok: false, error: "PARTICIPANTS_OUT_OF_RANGE" });

    expect(
      validateParticipantsAndSpecialNeeds(pkgReguler, {
        participantCount: 46,
        elderlyCount: 0,
        wheelchairCount: 0,
      }),
    ).toEqual({ ok: false, error: "PARTICIPANTS_OUT_OF_RANGE" });

    expect(
      validateParticipantsAndSpecialNeeds(pkgReguler, {
        participantCount: 40,
        elderlyCount: 41,
        wheelchairCount: 0,
      }),
    ).toEqual({ ok: false, error: "ELDERLY_COUNT_INVALID" });

    expect(
      validateParticipantsAndSpecialNeeds(pkgReguler, {
        participantCount: 40,
        elderlyCount: 10,
        wheelchairCount: 41,
      }),
    ).toEqual({ ok: false, error: "WHEELCHAIR_COUNT_INVALID" });
  });

  it("menghitung harga kontrak 40 jamaah (Rp55.960.000) & DP 50% (Rp27.980.000) secara akurat sesuai PPBI §6.5", () => {
    expect(resolveUnitPrice(pkgReguler)).toBe(1_399_000);
    const pricing = computeGroupContractPricing(pkgReguler, 40);
    expect(pricing).toEqual({
      unitPrice: 1_399_000,
      estimatedTotalPrice: 55_960_000,
      estimatedDpAmount: 27_980_000,
      estimatedRemainingAmount: 27_980_000,
      recommendedBusCount: 1,
    });
  });

  it("menghitung rekomendasi jumlah bus untuk rombongan besar (misal 85 jamaah -> 3 bus)", () => {
    const pricing = computeGroupContractPricing(pkgReguler, 85);
    expect(pricing.recommendedBusCount).toBe(3);
    expect(pricing.estimatedTotalPrice).toBe(1_399_000 * 85);
    expect(pricing.estimatedDpAmount + pricing.estimatedRemainingAmount).toBe(
      pricing.estimatedTotalPrice,
    );
  });

  it("membulatkan DP 50% ke ribuan terdekat dan menolak harga/jumlah tidak valid", () => {
    expect(computeDpAmount(1_001_000)).toBe(501_000);
    expect(() => computeTotal(1_399_000.5, 40)).toThrow();
    expect(() => computeTotal(1_399_000, 0)).toThrow();
  });
});
