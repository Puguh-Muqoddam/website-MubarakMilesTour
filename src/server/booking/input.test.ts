import { describe, expect, it } from "vitest";
import {
  formatBookingCodeDisplay,
  generateBookingCode,
  normalizeBookingCode,
} from "./code";
import { bookingInputSchema, normalizeWhatsapp } from "./input";
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  formatDateId,
} from "./whatsapp";

const validInput = {
  packageId: "pkg_walisongo_3h2m",
  departureSlotId: "slot_feb_2027_01",
  requestedDepartDate: "2027-02-01",
  participantCount: "40",
  elderlyCount: "12",
  wheelchairCount: "1",
  picName: "  Hj. Siti Aminah  ",
  whatsapp: "0858-4787-9784",
  email: "  SITI.AMINAH@Example.com ",
  organizationName: "  Majelis Taklim Al-Ikhlas Rungkut  ",
  organizationType: "MAJELIS_TAKLIM",
  originRegion: "SURABAYA_RAYA",
  originCity: "  Surabaya  ",
  notes: "  Mohon kursi roda lipat disiapkan di titik kumpul  ",
};

describe("bookingInputSchema (B2B Rombongan)", () => {
  it("melakukan trim, normalisasi email/WA, dan coercion angka dengan benar", () => {
    const parsed = bookingInputSchema.parse(validInput);
    expect(parsed).toMatchObject({
      packageId: "pkg_walisongo_3h2m",
      departureSlotId: "slot_feb_2027_01",
      requestedDepartDate: "2027-02-01",
      participantCount: 40,
      elderlyCount: 12,
      wheelchairCount: 1,
      picName: "Hj. Siti Aminah",
      whatsapp: "6285847879784",
      email: "siti.aminah@example.com",
      organizationName: "Majelis Taklim Al-Ikhlas Rungkut",
      organizationType: "MAJELIS_TAKLIM",
      originRegion: "SURABAYA_RAYA",
      originCity: "Surabaya",
      notes: "Mohon kursi roda lipat disiapkan di titik kumpul",
    });
  });

  it("mengizinkan email dan departureSlotId kosong (untuk jadwal custom majelis)", () => {
    const customSchedule = bookingInputSchema.parse({
      ...validInput,
      departureSlotId: "   ",
      email: "",
      notes: "",
    });
    expect(customSchedule.departureSlotId).toBeUndefined();
    expect(customSchedule.email).toBeUndefined();
    expect(customSchedule.notes).toBeUndefined();
  });

  it("menolak field tak dikenal seperti manipulasi harga dari klien (.strict())", () => {
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        unitPrice: 100_000,
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        estimatedTotalPrice: 1_000_000,
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        status: "LUNAS",
      }).success,
    ).toBe(false);
  });

  it("menolak jumlah lansia atau kursi roda yang melebihi total jamaah", () => {
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        participantCount: 30,
        elderlyCount: 31,
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        participantCount: 30,
        wheelchairCount: 35,
      }).success,
    ).toBe(false);
  });

  it("membatasi panjang string dan memvalidasi enum komunitas/wilayah", () => {
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        picName: "a".repeat(101),
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        organizationName: "a".repeat(151),
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        notes: "a".repeat(601),
      }).success,
    ).toBe(false);
    expect(
      bookingInputSchema.safeParse({
        ...validInput,
        organizationType: "PERUSAHAAN_ASING",
      }).success,
    ).toBe(false);
  });
});

describe("normalizeWhatsapp", () => {
  it.each([
    ["085847879784", "6285847879784"],
    ["+62 858-4787-9784", "6285847879784"],
    ["6285847879784", "6285847879784"],
    ["85847879784", "6285847879784"],
  ])("menormalisasi %s menjadi %s", (input, expected) => {
    expect(normalizeWhatsapp(input)).toBe(expected);
  });

  it("menolak nomor telepon rumah atau format tidak valid", () => {
    expect(normalizeWhatsapp("12345")).toBeNull();
    expect(normalizeWhatsapp("0318291234")).toBeNull();
  });
});

describe("generateBookingCode & format tampilan MMT", () => {
  it("menghasilkan 8 karakter unik dari alfabet tanpa karakter ambigu", () => {
    const codes = new Set(
      Array.from({ length: 2000 }, () => generateBookingCode()),
    );
    expect(codes.size).toBe(2000);
    for (const c of codes) {
      expect(c).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);
    }
  });

  it("memformat dan menormalisasi prefiks MMT- dengan benar", () => {
    expect(formatBookingCodeDisplay("7k4p9x2a")).toBe("MMT-7K4P9X2A");
    expect(normalizeBookingCode("mmt-7k4p9x2a")).toBe("7K4P9X2A");
    expect(normalizeBookingCode("7K4P9X2A")).toBe("7K4P9X2A");
  });
});

describe("buildWhatsappMessage & buildWhatsappUrl", () => {
  it("menyusun pesan penawaran rombongan B2B dan meng-encode URL wa.me", () => {
    expect(formatDateId("2027-02-01")).toBe("Senin, 1 Februari 2027");

    const msg = buildWhatsappMessage({
      code: "7K4P9X2A",
      packageName: "Ziarah Wali Songo + Tour Wisata (3H2M — 12 Destinasi)",
      scheduleLabel: "Batch Perdana — 1–3 Februari 2027",
      requestedDepartDate: "2027-02-01",
      participantCount: 40,
      elderlyCount: 12,
      wheelchairCount: 1,
      unitPrice: 1_399_000,
      estimatedTotalPrice: 55_960_000,
      estimatedDpAmount: 27_980_000,
      picName: "Hj. Siti & Pengurus",
      organizationName: "Muslimat NU Ranting Wonokromo",
      organizationTypeLabel: "Majelis Taklim",
      originCity: "Surabaya",
      originRegionLabel: "Surabaya Raya",
      notes: "Titik jemput di Masjid Agung Surabaya",
    });

    expect(msg).toContain("Kode Penawaran: MMT-7K4P9X2A");
    expect(msg).toContain("Muslimat NU Ranting Wonokromo");
    expect(msg).toContain("Lansia: 12 orang, Kursi Roda: 1 unit");
    expect(msg).toContain("MOU");

    const url = buildWhatsappUrl("6285847879784", msg);
    expect(url.startsWith("https://wa.me/6285847879784?text=")).toBe(true);
    expect(url).not.toContain("&Pengurus");
    expect(decodeURIComponent(url.split("text=")[1])).toBe(msg);
    expect(() => buildWhatsappUrl("085847879784", msg)).toThrow();
  });
});
