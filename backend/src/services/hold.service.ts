import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { config } from '../config';
import crypto from 'crypto';
import { broadcastMultipleSeatUpdates } from '../sockets/socket.server';

export interface CreateHoldParams {
  showId: string;
  userId: string;
  showSeatIds: string[];
}

export interface HoldResult {
  holdToken: string;
  showId: string;
  expiresAt: Date;
  seats: Array<{
    showSeatId: string;
    seatNumber: number;
    rowLabel: string;
    categoryName: string;
    price: number;
  }>;
  totalAmount: number;
}

export const createSeatHold = async ({
  showId,
  userId,
  showSeatIds,
}: CreateHoldParams): Promise<HoldResult> => {
  const ttlMs = config.seatHoldTtlMinutes * 60 * 1000;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);
  const holdToken = crypto.randomUUID();

  // Execute inside a PostgreSQL transaction with FOR UPDATE row locking
  const result = await prisma.$transaction(async (tx: any) => {
    // 1. Lock the requested ShowSeat rows using raw SQL FOR UPDATE
    const lockedSeats: any[] = await tx.$queryRaw`
      SELECT 
        ss.id, 
        ss.status, 
        ss."holdExpiresAt", 
        ss."showId", 
        ss."seatId", 
        ss."categoryId",
        s."rowLabel", 
        s."seatNumber", 
        sc."name" AS "categoryName",
        scp.price
      FROM "ShowSeat" ss
      JOIN "Seat" s ON ss."seatId" = s.id
      JOIN "SeatCategory" sc ON ss."categoryId" = sc.id
      JOIN "ShowCategoryPrice" scp ON ss."showId" = scp."showId" AND ss."categoryId" = scp."categoryId"
      WHERE ss."showId" = ${showId} 
        AND ss.id IN (${Prisma.join(showSeatIds)})
      FOR UPDATE OF ss
    `;

    if (lockedSeats.length !== showSeatIds.length) {
      const err: any = new Error('One or more requested seats do not exist for this show');
      err.statusCode = 404;
      err.code = 'SEAT_NOT_FOUND';
      throw err;
    }

    // 2. Validate all seats availability
    for (const seat of lockedSeats) {
      const isCurrentlyHeld = seat.status === 'HELD' && seat.holdExpiresAt && new Date(seat.holdExpiresAt) > now;
      const isBooked = seat.status === 'BOOKED';

      if (isBooked || isCurrentlyHeld) {
        const err: any = new Error(`Seat ${seat.rowLabel}${seat.seatNumber} is no longer available`);
        err.statusCode = 409;
        err.code = 'SEAT_UNAVAILABLE';
        throw err;
      }
    }

    // 3. Update all seats to HELD
    await tx.showSeat.updateMany({
      where: {
        id: { in: showSeatIds },
        showId: showId,
      },
      data: {
        status: 'HELD',
        holdToken: holdToken,
        holdExpiresAt: expiresAt,
      },
    });

    const totalAmount = lockedSeats.reduce((sum, s) => sum + Number(s.price), 0);

    return {
      holdToken,
      showId,
      expiresAt,
      seats: lockedSeats.map((s) => ({
        showSeatId: s.id,
        seatNumber: s.seatNumber,
        rowLabel: s.rowLabel,
        categoryName: s.categoryName,
        price: Number(s.price),
      })),
      totalAmount,
    };
  });

  // Broadcast real-time Socket.IO updates (outside transaction)
  broadcastMultipleSeatUpdates(
    showId,
    showSeatIds.map((id) => ({ seatId: id, status: 'HELD' }))
  );

  return result;
};
