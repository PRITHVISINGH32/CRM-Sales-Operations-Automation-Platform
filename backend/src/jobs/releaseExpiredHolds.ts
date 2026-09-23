import { prisma } from '../config/prisma';
import { broadcastSeatUpdate } from '../sockets/socket.server';

export const releaseExpiredHolds = async (): Promise<number> => {
  const now = new Date();

  try {
    const releasedSeats = await prisma.$transaction(async (tx: any) => {
      const expiredSeats: any[] = await tx.$queryRaw`
        SELECT id, "showId"
        FROM "ShowSeat"
        WHERE status = 'HELD'
          AND "holdExpiresAt" IS NOT NULL
          AND "holdExpiresAt" < ${now}
        FOR UPDATE SKIP LOCKED
      `;

      if (expiredSeats.length === 0) {
        return [];
      }

      const expiredIds = expiredSeats.map((s) => s.id);

      await tx.showSeat.updateMany({
        where: { id: { in: expiredIds } },
        data: {
          status: 'AVAILABLE',
          holdToken: null,
          holdExpiresAt: null,
        },
      });

      return expiredSeats;
    });

    if (releasedSeats.length > 0) {
      console.log(`⏰ Expiration Worker: Released ${releasedSeats.length} expired seat holds`);
      for (const seat of releasedSeats) {
        broadcastSeatUpdate(seat.showId, seat.id, 'AVAILABLE');
      }
    }

    return releasedSeats.length;
  } catch (error) {
    console.error('Error in releaseExpiredHolds worker:', error);
    return 0;
  }
};
