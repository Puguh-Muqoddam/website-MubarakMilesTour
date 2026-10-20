import "server-only";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { generateBookingCode } from "@/server/booking/code";
import {
  ORGANIZATION_TYPE_LABELS,
  ORIGIN_REGION_LABELS,
} from "@/server/booking/config";
import type { BookingInput } from "@/server/booking/input";
import {
  checkRombonganQuota,
  computeContractDeadlines,
  type ContractDeadlines,
  computeGroupContractPricing,
  formatDateOnly,
  parseDateOnly,
  type RuleError,
  todayInJakarta,
  validateDepartDate,
  validateDepartureSlot,
  validateParticipantsAndSpecialNeeds,
} from "@/server/booking/rules";
import type { GroupBookingWhatsappSummary } from "@/server/booking/whatsapp";
import { FIXTURE_DEPARTURE_SLOTS, FIXTURE_PACKAGES } from "./fixtures";

export type CreateBookingResult =
  | {
      ok: true;
      summary: GroupBookingWhatsappSummary;
      deadlines: ContractDeadlines;
      recommendedBusCount: number;
    }
  | { ok: false; error: RuleError };

class BookingRuleAbort extends Error {
  constructor(public readonly code: RuleError) {
    super(code);
  }
}

type LockedSlotRow = {
  id: string;
  packageId: string;
  departDate: Date;
  label: string;
  maxRombonganQuota: number;
  bookedRombonganCount: number;
  isClosed: boolean;
  isActive: boolean;
};

/**
 * Membuat Permintaan Penawaran & Booking Jadwal Rombongan B2B secara transaksional:
 * 1) Validasi paket, tanggal keberangkatan (WIB), tanggal tutup, peserta, lansia, & kursi roda.
 * 2) Di dalam `prisma.$transaction`: kunci baris `DepartureSlot` dengan `SELECT ... FOR UPDATE`,
 *    periksa ulang sisa kuota rombongan bus, simpan `GroupBooking` + `BookingStatusLog`,
 *    dan tingkatkan `bookedRombonganCount`.
 */
export async function createGroupBooking(
  db: PrismaClient,
  input: BookingInput,
  now: Date,
): Promise<CreateBookingResult> {
  const requestedDateObj = parseDateOnly(input.requestedDepartDate);
  if (!requestedDateObj) return { ok: false, error: "INVALID_DATE" };

  const [pkg, closedDate] = await Promise.all([
    db.package.findUnique({ where: { id: input.packageId } }),
    db.closedDate.findUnique({
      where: { date: requestedDateObj },
      select: { id: true },
    }),
  ]);

  if (!pkg || !pkg.isActive) return { ok: false, error: "PACKAGE_UNAVAILABLE" };

  // Paket reguler wajib memilih salah satu slot keberangkatan terjadwal
  if (!pkg.isCustomAllowed && !input.departureSlotId) {
    return { ok: false, error: "SLOT_REQUIRED" };
  }

  const dateRule = validateDepartDate(
    input.requestedDepartDate,
    now,
    closedDate !== null,
  );
  if (!dateRule.ok) return dateRule;

  const paxRule = validateParticipantsAndSpecialNeeds(pkg, {
    participantCount: input.participantCount,
    elderlyCount: input.elderlyCount,
    wheelchairCount: input.wheelchairCount,
  });
  if (!paxRule.ok) return paxRule;

  const pricing = computeGroupContractPricing(pkg, input.participantCount);

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateBookingCode();
    try {
      const txResult = await db.$transaction(async (tx) => {
        let effectiveDepartDateStr = input.requestedDepartDate;
        let effectiveDepartDateObj = requestedDateObj;
        let scheduleLabel: string | undefined;

        if (input.departureSlotId) {
          const locked = await tx.$queryRaw<LockedSlotRow[]>`
            SELECT
              "id",
              "packageId",
              "departDate",
              "label",
              "maxRombonganQuota",
              "bookedRombonganCount",
              "isClosed",
              "isActive"
            FROM "DepartureSlot"
            WHERE "id" = ${input.departureSlotId}
            FOR UPDATE`;

          if (locked.length !== 1 || locked[0].packageId !== pkg.id) {
            throw new BookingRuleAbort("SLOT_UNAVAILABLE");
          }

          const slot = locked[0];
          const slotCheck = validateDepartureSlot(slot);
          if (!slotCheck.ok) throw new BookingRuleAbort(slotCheck.error);

          const quotaCheck = checkRombonganQuota(
            slot.bookedRombonganCount,
            1,
            slot.maxRombonganQuota,
          );
          if (!quotaCheck.ok) throw new BookingRuleAbort(quotaCheck.error);

          effectiveDepartDateObj = slot.departDate;
          effectiveDepartDateStr = formatDateOnly(slot.departDate);
          scheduleLabel = slot.label;

          await tx.departureSlot.update({
            where: { id: slot.id },
            data: { bookedRombonganCount: { increment: 1 } },
          });
        }

        await tx.groupBooking.create({
          data: {
            code,
            packageId: pkg.id,
            departureSlotId: input.departureSlotId ?? null,
            requestedDepartDate: effectiveDepartDateObj,
            participantCount: input.participantCount,
            elderlyCount: input.elderlyCount,
            wheelchairCount: input.wheelchairCount,
            unitPrice: pricing.unitPrice,
            estimatedTotalPrice: pricing.estimatedTotalPrice,
            estimatedDpAmount: pricing.estimatedDpAmount,
            picName: input.picName,
            whatsapp: input.whatsapp,
            email: input.email ?? null,
            organizationName: input.organizationName,
            organizationType: input.organizationType,
            originRegion: input.originRegion,
            originCity: input.originCity,
            notes: input.notes ?? null,
            status: "MENUNGGU_PENAWARAN",
            statusLogs: {
              create: {
                fromStatus: null,
                toStatus: "MENUNGGU_PENAWARAN",
                note: "Permintaan penawaran rombongan diajukan melalui website",
                changedByEmail: "system:public-form",
              },
            },
          },
        });

        return { effectiveDepartDateStr, scheduleLabel };
      });

      const deadlines = computeContractDeadlines(
        txResult.effectiveDepartDateStr,
        todayInJakarta(now),
      );

      return {
        ok: true,
        summary: {
          code,
          packageName: pkg.name,
          scheduleLabel: txResult.scheduleLabel,
          requestedDepartDate: txResult.effectiveDepartDateStr,
          participantCount: input.participantCount,
          elderlyCount: input.elderlyCount,
          wheelchairCount: input.wheelchairCount,
          unitPrice: pricing.unitPrice,
          estimatedTotalPrice: pricing.estimatedTotalPrice,
          estimatedDpAmount: pricing.estimatedDpAmount,
          picName: input.picName,
          organizationName: input.organizationName,
          organizationTypeLabel:
            ORGANIZATION_TYPE_LABELS[input.organizationType],
          originCity: input.originCity,
          originRegionLabel: ORIGIN_REGION_LABELS[input.originRegion],
          notes: input.notes,
        },
        deadlines,
        recommendedBusCount: pricing.recommendedBusCount,
      };
    } catch (e) {
      if (e instanceof BookingRuleAbort) {
        return { ok: false, error: e.code };
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }

  throw new Error("Gagal membuat kode penawaran rombongan unik");
}

/**
 * Fallback simulasi non-produksi (HANYA jika `NODE_ENV !== "production"` dan DB belum dikonfigurasi),
 * memakai aturan validasi yang sama persis terhadap data fixture.
 */
export function createFixtureGroupBooking(
  input: BookingInput,
  now: Date,
): CreateBookingResult {
  const pkg = FIXTURE_PACKAGES.find((p) => p.id === input.packageId);
  if (!pkg) return { ok: false, error: "PACKAGE_UNAVAILABLE" };

  if (!pkg.isCustomAllowed && !input.departureSlotId) {
    return { ok: false, error: "SLOT_REQUIRED" };
  }

  let effectiveDepartDateStr = input.requestedDepartDate;
  let scheduleLabel: string | undefined;

  if (input.departureSlotId) {
    const slot = FIXTURE_DEPARTURE_SLOTS.find(
      (s) => s.id === input.departureSlotId && s.packageId === pkg.id,
    );
    const slotCheck = validateDepartureSlot(
      slot
        ? {
            isActive: true,
            isClosed: slot.isClosed,
            maxRombonganQuota: slot.maxRombonganQuota,
            bookedRombonganCount: slot.bookedRombonganCount,
          }
        : null,
    );
    if (!slotCheck.ok) return slotCheck;
    effectiveDepartDateStr = slot!.departDate;
    scheduleLabel = slot!.label;
  }

  const dateRule = validateDepartDate(effectiveDepartDateStr, now, false);
  if (!dateRule.ok) return dateRule;

  const paxRule = validateParticipantsAndSpecialNeeds(pkg, {
    participantCount: input.participantCount,
    elderlyCount: input.elderlyCount,
    wheelchairCount: input.wheelchairCount,
  });
  if (!paxRule.ok) return paxRule;

  const pricing = computeGroupContractPricing(pkg, input.participantCount);
  const deadlines = computeContractDeadlines(
    effectiveDepartDateStr,
    todayInJakarta(now),
  );
  const code = generateBookingCode();

  return {
    ok: true,
    summary: {
      code,
      packageName: pkg.name,
      scheduleLabel,
      requestedDepartDate: effectiveDepartDateStr,
      participantCount: input.participantCount,
      elderlyCount: input.elderlyCount,
      wheelchairCount: input.wheelchairCount,
      unitPrice: pricing.unitPrice,
      estimatedTotalPrice: pricing.estimatedTotalPrice,
      estimatedDpAmount: pricing.estimatedDpAmount,
      picName: input.picName,
      organizationName: input.organizationName,
      organizationTypeLabel: ORGANIZATION_TYPE_LABELS[input.organizationType],
      originCity: input.originCity,
      originRegionLabel: ORIGIN_REGION_LABELS[input.originRegion],
      notes: input.notes,
    },
    deadlines,
    recommendedBusCount: pricing.recommendedBusCount,
  };
}
