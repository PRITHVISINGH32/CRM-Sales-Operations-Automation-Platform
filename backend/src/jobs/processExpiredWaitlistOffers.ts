import { prisma } from '../config/prisma';
import { processWaitlistAllocation } from '../services/waitlist.service';
import { broadcastSeatUpdate } from '../sockets/socket.server';

export const processExpiredWaitlistOffers = async (): Promise<number> => {
  const now = new Date();

  try {
    const expiredOffers = await prisma.$transaction(async (tx: any) => {
      const offers: any[] = await tx.$queryRaw`
        SELECT 
          wo.id, 
          wo."waitlistEntryId", 
          wo."showSeatId", 
          ss."showId", 
          ss."categoryId"
        FROM "WaitlistOffer" wo
        JOIN "ShowSeat" ss ON wo."showSeatId" = ss.id
        WHERE wo.status = 'PENDING'
          AND wo."expiresAt" < ${now}
        FOR UPDATE OF wo SKIP LOCKED
      `;

      if (offers.length === 0) {
        return [];
      }

      for (const offer of offers) {
        await tx.waitlistOffer.update({
          where: { id: offer.id },
          data: { status: 'EXPIRED' },
        });

        await tx.waitlistEntry.update({
          where: { id: offer.waitlistEntryId },
          data: { status: 'EXPIRED' },
        });

        await tx.showSeat.update({
          where: { id: offer.showSeatId },
          data: {
            status: 'AVAILABLE',
            holdToken: null,
            holdExpiresAt: null,
          },
        });
      }

      return offers;
    });

    if (expiredOffers.length > 0) {
      console.log(`⏰ Waitlist Worker: Expired ${expiredOffers.length} unclaimed waitlist offers`);

      for (const offer of expiredOffers) {
        broadcastSeatUpdate(offer.showId, offer.showSeatId, 'AVAILABLE');
        await processWaitlistAllocation(offer.showId, offer.categoryId, offer.showSeatId);
      }
    }

    return expiredOffers.length;
  } catch (error) {
    console.error('Error in processExpiredWaitlistOffers worker:', error);
    return 0;
  }
};
