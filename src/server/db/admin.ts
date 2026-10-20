import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import type {
  BookingStatus,
  OrganizationType,
  OriginRegion,
  PaymentType,
} from "@/generated/prisma/enums";
import { parseDateOnly } from "@/server/booking/rules";
import { canTransition } from "@/server/booking/status";

export type BookingFilter = {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  code?: string;
  organizationType?: OrganizationType;
  originRegion?: OriginRegion;
  page?: number;
};

export const PAGE_SIZE = 50;

/** Daftar permintaan & pesanan rombongan untuk pengelola (HANYA dipanggil setelah requireAdmin*). */
export async function listGroupBookings(db: PrismaClient, f: BookingFilter) {
  const requestedDepartDate: { gte?: Date; lte?: Date } = {};
  const from = f.dateFrom ? parseDateOnly(f.dateFrom) : null;
  const to = f.dateTo ? parseDateOnly(f.dateTo) : null;
  if (from) requestedDepartDate.gte = from;
  if (to) requestedDepartDate.lte = to;

  const where = {
    ...(f.status ? { status: f.status } : {}),
    ...(from || to ? { requestedDepartDate } : {}),
    ...(f.code ? { code: f.code } : {}),
    ...(f.organizationType ? { organizationType: f.organizationType } : {}),
    ...(f.originRegion ? { originRegion: f.originRegion } : {}),
  };

  const page = Math.max(1, f.page ?? 1);
  const [items, total] = await Promise.all([
    db.groupBooking.findMany({
      where,
      orderBy: [{ requestedDepartDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        package: { select: { name: true, slug: true } },
        departureSlot: {
          select: {
            id: true,
            label: true,
            maxRombonganQuota: true,
            bookedRombonganCount: true,
          },
        },
        statusLogs: { orderBy: { createdAt: "desc" }, take: 5 },
        paymentLogs: { orderBy: { paidAt: "desc" }, take: 10 },
      },
    }),
    db.groupBooking.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Statistik ringkasan kartu dashboard admin & kuota slot keberangkatan. */
export async function getAdminSummaryStats(db: PrismaClient) {
  const [countsByStatus, slots] = await Promise.all([
    db.groupBooking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.departureSlot.findMany({
      where: { isActive: true },
      orderBy: { departDate: "asc" },
      select: {
        id: true,
        label: true,
        departDate: true,
        maxRombonganQuota: true,
        bookedRombonganCount: true,
        isClosed: true,
      },
    }),
  ]);

  const map: Partial<Record<BookingStatus, number>> = {};
  let totalAll = 0;
  for (const row of countsByStatus) {
    map[row.status] = row._count._all;
    totalAll += row._count._all;
  }

  return {
    totalAll,
    menungguPenawaran: map.MENUNGGU_PENAWARAN ?? 0,
    mouDitandatangani: map.MOU_DITANDATANGANI ?? 0,
    dpDiterima: map.DP_DITERIMA ?? 0,
    lunas: map.LUNAS ?? 0,
    selesai: map.SELESAI ?? 0,
    batal: map.BATAL ?? 0,
    slots,
  };
}

export type ChangeStatusResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "INVALID_TRANSITION" | "STALE" };

/**
 * Mengubah status pesanan rombongan + mencatat `BookingStatusLog` secara atomik.
 * Bila pesanan yang terikat ke `DepartureSlot` dibatalkan (`to === "BATAL"`),
 * maka baris `DepartureSlot` dikunci dengan `SELECT ... FOR UPDATE` dan `bookedRombonganCount` dikurangi 1.
 */
export async function changeGroupBookingStatus(
  db: PrismaClient,
  args: {
    bookingId: string;
    expectedFrom: BookingStatus;
    to: BookingStatus;
    note?: string;
    actorEmail: string;
  },
): Promise<ChangeStatusResult> {
  if (!canTransition(args.expectedFrom, args.to)) {
    return { ok: false, error: "INVALID_TRANSITION" };
  }

  return db.$transaction(async (tx) => {
    const existing = await tx.groupBooking.findUnique({
      where: { id: args.bookingId },
      select: { id: true, status: true, departureSlotId: true },
    });
    if (!existing) return { ok: false, error: "NOT_FOUND" } as const;
    if (existing.status !== args.expectedFrom) {
      return { ok: false, error: "STALE" } as const;
    }

    const updated = await tx.groupBooking.updateMany({
      where: { id: args.bookingId, status: args.expectedFrom },
      data: { status: args.to },
    });
    if (updated.count === 0) return { ok: false, error: "STALE" } as const;

    if (
      args.to === "BATAL" &&
      args.expectedFrom !== "BATAL" &&
      existing.departureSlotId
    ) {
      const locked = await tx.$queryRaw<
        { id: string; bookedRombonganCount: number }[]
      >`
        SELECT "id", "bookedRombonganCount"
        FROM "DepartureSlot"
        WHERE "id" = ${existing.departureSlotId}
        FOR UPDATE`;

      if (locked.length === 1 && locked[0].bookedRombonganCount > 0) {
        await tx.departureSlot.update({
          where: { id: existing.departureSlotId },
          data: {
            bookedRombonganCount: Math.max(
              0,
              locked[0].bookedRombonganCount - 1,
            ),
          },
        });
      }
    }

    await tx.bookingStatusLog.create({
      data: {
        bookingId: args.bookingId,
        fromStatus: args.expectedFrom,
        toStatus: args.to,
        note: args.note ?? null,
        changedByEmail: args.actorEmail,
      },
    });

    return { ok: true } as const;
  });
}

export type RecordPaymentResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "INVALID_AMOUNT" };

/** Mencatat transaksi pembayaran termin (DP 50%, Pelunasan, atau Refund) ke `PaymentLog`. */
export async function recordGroupPayment(
  db: PrismaClient,
  args: {
    bookingId: string;
    paymentType: PaymentType;
    amount: number;
    note?: string;
    actorEmail: string;
  },
): Promise<RecordPaymentResult> {
  if (!Number.isSafeInteger(args.amount) || args.amount <= 0) {
    return { ok: false, error: "INVALID_AMOUNT" };
  }

  const exists = await db.groupBooking.findUnique({
    where: { id: args.bookingId },
    select: { id: true },
  });
  if (!exists) return { ok: false, error: "NOT_FOUND" };

  await db.paymentLog.create({
    data: {
      bookingId: args.bookingId,
      paymentType: args.paymentType,
      amount: args.amount,
      note: args.note ?? null,
      recordedByEmail: args.actorEmail,
    },
  });

  return { ok: true };
}

/** Data lengkap pesanan rombongan untuk halaman cetak lampiran MOU / invoice (`/admin/pesanan/[id]/cetak`). */
export async function getGroupBookingForPrint(
  db: PrismaClient,
  bookingId: string,
) {
  return db.groupBooking.findUnique({
    where: { id: bookingId },
    include: {
      package: {
        select: {
          slug: true,
          name: true,
          durationDays: true,
          durationNights: true,
          totalDestinations: true,
          facilities: true,
          hotels: true,
        },
      },
      departureSlot: {
        select: {
          label: true,
          departDate: true,
          returnDate: true,
          seatCapacityPerBus: true,
        },
      },
      paymentLogs: {
        orderBy: { paidAt: "asc" },
      },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}
