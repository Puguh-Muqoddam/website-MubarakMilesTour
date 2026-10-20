import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import type { BookingStatus } from "@/generated/prisma/enums";
import { canPrintDocument, canTransition } from "@/server/booking/status";
import {
  changeGroupBookingStatus,
  recordGroupPayment,
} from "@/server/db/admin";
import { authorizeAdmin } from "./authorize";

describe("authorizeAdmin (lapis otorisasi email allowlist)", () => {
  const allowlist = ["admin@mubarakmilestour.com", "tiya@mubarakmilestour.com"];

  it("menolak sesi tanpa user atau tanpa email", () => {
    expect(authorizeAdmin(null, allowlist)).toBeNull();
    expect(authorizeAdmin(undefined, allowlist)).toBeNull();
    expect(authorizeAdmin({ id: "u1", email: null }, allowlist)).toBeNull();
  });

  it("menolak user terautentikasi yang tidak ada di ADMIN_EMAILS", () => {
    expect(
      authorizeAdmin({ id: "u2", email: "jamaah@gmail.com" }, allowlist),
    ).toBeNull();
  });

  it("menerima user yang terdaftar di ADMIN_EMAILS secara case-insensitive", () => {
    const res = authorizeAdmin(
      { id: "u3", email: "  TIYA@MubarakMilesTour.com " },
      allowlist,
    );
    expect(res).toEqual({
      id: "u3",
      email: "tiya@mubarakmilestour.com",
    });
  });
});

describe("state machine status kontrak rombongan B2B", () => {
  it("mengizinkan alur resmi PPBI §6.2 secara berurutan", () => {
    expect(canTransition("MENUNGGU_PENAWARAN", "MOU_DITANDATANGANI")).toBe(true);
    expect(canTransition("MOU_DITANDATANGANI", "DP_DITERIMA")).toBe(true);
    expect(canTransition("DP_DITERIMA", "LUNAS")).toBe(true);
    expect(canTransition("LUNAS", "SELESAI")).toBe(true);
  });

  it("melarang lompat tahapan (mis. langsung LUNAS tanpa MOU & DP)", () => {
    expect(canTransition("MENUNGGU_PENAWARAN", "DP_DITERIMA")).toBe(false);
    expect(canTransition("MENUNGGU_PENAWARAN", "LUNAS")).toBe(false);
    expect(canTransition("MOU_DITANDATANGANI", "LUNAS")).toBe(false);
  });

  it("melarang perubahan dari status terminal SELESAI atau BATAL", () => {
    expect(canTransition("SELESAI", "BATAL")).toBe(false);
    expect(canTransition("BATAL", "MOU_DITANDATANGANI")).toBe(false);
  });

  it("mengizinkan cetak dokumen selama status bukan BATAL", () => {
    expect(canPrintDocument("MENUNGGU_PENAWARAN")).toBe(true);
    expect(canPrintDocument("MOU_DITANDATANGANI")).toBe(true);
    expect(canPrintDocument("DP_DITERIMA")).toBe(true);
    expect(canPrintDocument("LUNAS")).toBe(true);
    expect(canPrintDocument("SELESAI")).toBe(true);
    expect(canPrintDocument("BATAL")).toBe(false);
  });
});

describe("changeGroupBookingStatus & pelepasan kuota slot saat BATAL", () => {
  function makeMockAdminDb(initial: {
    status: BookingStatus;
    departureSlotId: string | null;
    bookedRombonganCount: number;
  }) {
    const state = { ...initial };
    const statusLogs: Array<{
      fromStatus: BookingStatus | null;
      toStatus: BookingStatus;
      note: string | null;
      changedByEmail: string;
    }> = [];
    const paymentLogs: Array<{
      paymentType: string;
      amount: number;
      recordedByEmail: string;
    }> = [];

    const tx = {
      groupBooking: {
        findUnique: async () => ({
          id: "b-1",
          status: state.status,
          departureSlotId: state.departureSlotId,
        }),
        updateMany: async ({
          where,
          data,
        }: {
          where: { status: BookingStatus };
          data: { status: BookingStatus };
        }) => {
          if (state.status !== where.status) return { count: 0 };
          state.status = data.status;
          return { count: 1 };
        },
      },
      $queryRaw: async () => [
        {
          id: state.departureSlotId ?? "slot-1",
          bookedRombonganCount: state.bookedRombonganCount,
        },
      ],
      departureSlot: {
        update: async ({
          data,
        }: {
          data: { bookedRombonganCount: number };
        }) => {
          state.bookedRombonganCount = data.bookedRombonganCount;
          return { id: state.departureSlotId };
        },
      },
      bookingStatusLog: {
        create: async ({
          data,
        }: {
          data: {
            fromStatus: BookingStatus | null;
            toStatus: BookingStatus;
            note: string | null;
            changedByEmail: string;
          };
        }) => {
          statusLogs.push(data);
          return { id: "log-1" };
        },
      },
      paymentLog: {
        create: async ({
          data,
        }: {
          data: {
            paymentType: string;
            amount: number;
            recordedByEmail: string;
          };
        }) => {
          paymentLogs.push(data);
          return { id: "pay-1" };
        },
      },
    };

    const db = {
      ...tx,
      $transaction: async <T>(fn: (client: typeof tx) => Promise<T>) => fn(tx),
    } as unknown as PrismaClient;

    return { db, state, statusLogs, paymentLogs };
  }

  it("mengurangi bookedRombonganCount sebesar 1 secara atomik saat pesanan ber-slot dibatalkan", async () => {
    const { db, state, statusLogs } = makeMockAdminDb({
      status: "MENUNGGU_PENAWARAN",
      departureSlotId: "slot-juli",
      bookedRombonganCount: 2,
    });

    const res = await changeGroupBookingStatus(db, {
      bookingId: "b-1",
      expectedFrom: "MENUNGGU_PENAWARAN",
      to: "BATAL",
      note: "Jadwal diundur oleh pengurus majelis",
      actorEmail: "admin@mubarakmilestour.com",
    });

    expect(res).toEqual({ ok: true });
    expect(state.status).toBe("BATAL");
    expect(state.bookedRombonganCount).toBe(1);
    expect(statusLogs).toHaveLength(1);
    expect(statusLogs[0]?.toStatus).toBe("BATAL");
  });

  it("mencatat pembayaran termin DP 50% secara valid ke PaymentLog", async () => {
    const { db, paymentLogs } = makeMockAdminDb({
      status: "MOU_DITANDATANGANI",
      departureSlotId: "slot-juli",
      bookedRombonganCount: 1,
    });

    const res = await recordGroupPayment(db, {
      bookingId: "b-1",
      paymentType: "DP_50",
      amount: 27980000,
      note: "Transfer Bank Syariah Indonesia",
      actorEmail: "admin@mubarakmilestour.com",
    });

    expect(res).toEqual({ ok: true });
    expect(paymentLogs).toHaveLength(1);
    expect(paymentLogs[0]).toMatchObject({
      paymentType: "DP_50",
      amount: 27980000,
      recordedByEmail: "admin@mubarakmilestour.com",
    });
  });
});
