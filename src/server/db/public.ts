import "server-only";
import { getDb, isDbConfigured } from "./client";
import {
  FIXTURE_DEPARTURE_SLOTS,
  FIXTURE_DESTINATIONS,
  FIXTURE_FAQS,
  FIXTURE_PACKAGES,
} from "./fixtures";
import type {
  PublicDepartureSlot,
  PublicDestination,
  PublicFaq,
  PublicPackage,
} from "./types";

// Query data publik. Bila DB belum dikonfigurasi (hanya di luar produksi), pakai fixture.
// Data pesanan rombongan tidak pernah dikembalikan; ketersediaan hanya berupa sisa kuota rombongan.

async function shouldUseFixtures(): Promise<boolean> {
  if (await isDbConfigured()) return false;
  if (process.env.NODE_ENV === "production") throw new Error("Database belum dikonfigurasi");
  return true;
}

export async function getPackages(): Promise<PublicPackage[]> {
  if (await shouldUseFixtures()) return FIXTURE_PACKAGES;
  const db = await getDb();
  const rows = await db.package.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      durationDays: true,
      durationNights: true,
      totalDestinations: true,
      priceNormalPerPax: true,
      pricePromoPerPax: true,
      minParticipants: true,
      maxParticipants: true,
      highlights: true,
      facilities: true,
      hotels: true,
      isCustomAllowed: true,
    },
  });
  return rows.length > 0 ? rows : FIXTURE_PACKAGES;
}

export async function getDepartureSlots(): Promise<PublicDepartureSlot[]> {
  if (await shouldUseFixtures()) return FIXTURE_DEPARTURE_SLOTS;
  const db = await getDb();
  const rows = await db.departureSlot.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { departDate: "asc" }],
    select: {
      id: true,
      packageId: true,
      departDate: true,
      returnDate: true,
      label: true,
      maxRombonganQuota: true,
      bookedRombonganCount: true,
      seatCapacityPerBus: true,
      isClosed: true,
      closedReason: true,
    },
  });
  if (rows.length === 0) return FIXTURE_DEPARTURE_SLOTS;
  return rows.map((r) => ({
    id: r.id,
    packageId: r.packageId,
    departDate: r.departDate.toISOString().slice(0, 10),
    returnDate: r.returnDate.toISOString().slice(0, 10),
    label: r.label,
    maxRombonganQuota: r.maxRombonganQuota,
    bookedRombonganCount: r.bookedRombonganCount,
    remainingRombonganQuota: r.isClosed
      ? 0
      : Math.max(0, r.maxRombonganQuota - r.bookedRombonganCount),
    seatCapacityPerBus: r.seatCapacityPerBus,
    isClosed: r.isClosed,
    closedReason: r.closedReason,
  }));
}

export async function getDestinations(): Promise<PublicDestination[]> {
  if (await shouldUseFixtures()) return FIXTURE_DESTINATIONS;
  const db = await getDb();
  const rows = await db.destination.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      category: true,
      description: true,
      lat: true,
      lng: true,
      imageUrl: true,
    },
  });
  return rows.length > 0 ? rows : FIXTURE_DESTINATIONS;
}

export async function getFaqs(): Promise<PublicFaq[]> {
  if (await shouldUseFixtures()) return FIXTURE_FAQS;
  const db = await getDb();
  const rows = await db.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, question: true, answer: true },
  });
  return rows.length > 0 ? rows : FIXTURE_FAQS;
}
