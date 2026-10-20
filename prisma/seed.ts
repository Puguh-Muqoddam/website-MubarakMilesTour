import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  FIXTURE_DEPARTURE_SLOTS,
  FIXTURE_DESTINATIONS,
  FIXTURE_FAQS,
  FIXTURE_PACKAGES,
} from "../src/server/db/fixtures";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL/DATABASE_URL belum diisi");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (let i = 0; i < FIXTURE_PACKAGES.length; i++) {
    const p = FIXTURE_PACKAGES[i];
    await prisma.package.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        totalDestinations: p.totalDestinations,
        priceNormalPerPax: p.priceNormalPerPax,
        pricePromoPerPax: p.pricePromoPerPax,
        minParticipants: p.minParticipants,
        maxParticipants: p.maxParticipants,
        highlights: p.highlights,
        facilities: p.facilities,
        hotels: p.hotels,
        isCustomAllowed: p.isCustomAllowed,
        sortOrder: i + 1,
      },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        durationDays: p.durationDays,
        durationNights: p.durationNights,
        totalDestinations: p.totalDestinations,
        priceNormalPerPax: p.priceNormalPerPax,
        pricePromoPerPax: p.pricePromoPerPax,
        minParticipants: p.minParticipants,
        maxParticipants: p.maxParticipants,
        highlights: p.highlights,
        facilities: p.facilities,
        hotels: p.hotels,
        isCustomAllowed: p.isCustomAllowed,
        sortOrder: i + 1,
      },
    });
  }

  for (let i = 0; i < FIXTURE_DEPARTURE_SLOTS.length; i++) {
    const s = FIXTURE_DEPARTURE_SLOTS[i];
    const departDate = new Date(`${s.departDate}T00:00:00.000Z`);
    const returnDate = new Date(`${s.returnDate}T00:00:00.000Z`);
    await prisma.departureSlot.upsert({
      where: {
        packageId_departDate: {
          packageId: s.packageId,
          departDate,
        },
      },
      update: {
        returnDate,
        label: s.label,
        maxRombonganQuota: s.maxRombonganQuota,
        seatCapacityPerBus: s.seatCapacityPerBus,
        sortOrder: i + 1,
      },
      create: {
        id: s.id,
        packageId: s.packageId,
        departDate,
        returnDate,
        label: s.label,
        maxRombonganQuota: s.maxRombonganQuota,
        bookedRombonganCount: 0,
        seatCapacityPerBus: s.seatCapacityPerBus,
        sortOrder: i + 1,
      },
    });
  }

  for (let i = 0; i < FIXTURE_DESTINATIONS.length; i++) {
    const d = FIXTURE_DESTINATIONS[i];
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {
        name: d.name,
        city: d.city,
        category: d.category,
        description: d.description,
        lat: d.lat,
        lng: d.lng,
        imageUrl: d.imageUrl,
        sortOrder: i + 1,
      },
      create: {
        id: d.id,
        slug: d.slug,
        name: d.name,
        city: d.city,
        category: d.category,
        description: d.description,
        lat: d.lat,
        lng: d.lng,
        imageUrl: d.imageUrl,
        sortOrder: i + 1,
      },
    });
  }

  for (let i = 0; i < FIXTURE_FAQS.length; i++) {
    const f = FIXTURE_FAQS[i];
    await prisma.faq.upsert({
      where: { id: f.id },
      update: {
        question: f.question,
        answer: f.answer,
        sortOrder: i + 1,
      },
      create: {
        id: f.id,
        question: f.question,
        answer: f.answer,
        sortOrder: i + 1,
      },
    });
  }
}

main()
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : "Seed gagal");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
