import { prisma } from '../config/prisma';
import { config } from '../config';
import crypto from 'crypto';
import { sendWaitlistOfferEmail } from '../utils/email.service';
import { broadcastSeatUpdate } from '../sockets/socket.server';

export const joinWaitlist = async ({
  showId,
  userId,
  categoryId,
}: {
  showId: string;
  userId: string;
  categoryId: string;
}) => {
  const show = await prisma.show.findUnique({
    where: { id: showId },
  });

  if (!show) {
    const err: any = new Error('Show not found');
    err.statusCode = 404;
    throw err;
  }

  const existing = await prisma.waitlistEntry.findFirst({
    where: {
      showId,
      userId,
      categoryId,
      status: { in: ['WAITING', 'OFFERED'] },
    },
  });

  if (existing) {
    const err: any = new Error('You are already on the waitlist for this show category');
    err.statusCode = 409;
    err.code = 'DUPLICATE_WAITLIST';
    throw err;
  }

  const maxPosEntry = await prisma.waitlistEntry.findFirst({
    where: { showId, categoryId, status: 'WAITING' },
    orderBy: { position: 'desc' },
  });

  const position = (maxPosEntry?.position || 0) + 1;

  const entry = await prisma.waitlistEntry.create({
    data: {
      showId,
      userId,
      categoryId,
      position,
      status: 'WAITING',
    },
    include: {
      category: true,
      show: { include: { event: true, venue: true } },
    },
  });

  return entry;
};

export const cancelBooking = async ({
  bookingId,
  userId,
  isAdmin = false,
}: {
  bookingId: string;
  userId: string;
  isAdmin?: boolean;
}) => {
  const result = await prisma.$transaction(async (tx: any) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        showSeats: true,
        user: true,
      },
    });

    if (!booking) {
      const err: any = new Error('Booking not found');
      err.statusCode = 404;
      throw err;
    }

    if (!isAdmin && booking.userId !== userId) {
      const err: any = new Error('Unauthorized to cancel this booking');
      err.statusCode = 403;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err: any = new Error('Booking is already cancelled');
      err.statusCode = 400;
      throw err;
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    const releasedSeats: Array<{ id: string; showId: string; categoryId: string }> = [];

    for (const seat of booking.showSeats) {
      await tx.showSeat.update({
        where: { id: seat.id },
        data: {
          status: 'AVAILABLE',
          bookingId: null,
          holdToken: null,
          holdExpiresAt: null,
        },
      });

      releasedSeats.push({
        id: seat.id,
        showId: seat.showId,
        categoryId: seat.categoryId,
      });
    }

    return { booking, releasedSeats };
  });

  for (const seat of result.releasedSeats) {
    broadcastSeatUpdate(seat.showId, seat.id, 'AVAILABLE');
  }

  for (const seat of result.releasedSeats) {
    await processWaitlistAllocation(seat.showId, seat.categoryId, seat.id);
  }

  return { success: true, message: 'Booking cancelled and seats released' };
};

export const processWaitlistAllocation = async (
  showId: string,
  categoryId: string,
  availableSeatId: string
) => {
  try {
    const ttlMs = config.waitlistOfferTtlMinutes * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);

    const offerData = await prisma.$transaction(async (tx: any) => {
      const seat = await tx.showSeat.findUnique({
        where: { id: availableSeatId },
      });

      if (!seat || seat.status !== 'AVAILABLE') {
        return null;
      }

      const nextWaiting = await tx.waitlistEntry.findFirst({
        where: {
          showId,
          categoryId,
          status: 'WAITING',
        },
        orderBy: { createdAt: 'asc' },
        include: {
          user: true,
          category: true,
          show: { include: { event: true, venue: true } },
        },
      });

      if (!nextWaiting) {
        return null;
      }

      const rawToken = crypto.randomUUID();
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const offer = await tx.waitlistOffer.create({
        data: {
          waitlistEntryId: nextWaiting.id,
          showSeatId: availableSeatId,
          tokenHash,
          expiresAt,
          status: 'PENDING',
        },
      });

      await tx.waitlistEntry.update({
        where: { id: nextWaiting.id },
        data: { status: 'OFFERED' },
      });

      await tx.showSeat.update({
        where: { id: availableSeatId },
        data: {
          status: 'HELD',
          holdExpiresAt: expiresAt,
        },
      });

      return {
        rawToken,
        offer,
        userEmail: nextWaiting.user.email,
        userName: nextWaiting.user.name,
        eventTitle: nextWaiting.show.event.title,
        venueName: nextWaiting.show.venue.name,
        categoryName: nextWaiting.category.name,
        showId,
        seatId: availableSeatId,
      };
    });

    if (offerData) {
      broadcastSeatUpdate(offerData.showId, offerData.seatId, 'OFFERED');

      const claimUrl = `${config.frontendUrl}/waitlist/claim?token=${offerData.rawToken}`;

      sendWaitlistOfferEmail({
        to: offerData.userEmail,
        customerName: offerData.userName,
        eventTitle: offerData.eventTitle,
        venueName: offerData.venueName,
        categoryName: offerData.categoryName,
        claimUrl,
        expiresInMinutes: config.waitlistOfferTtlMinutes,
      }).catch((err) => console.error('Error sending waitlist offer email:', err));
    }
  } catch (error) {
    console.error('Error in processWaitlistAllocation:', error);
  }
};

export const claimWaitlistOffer = async ({
  rawToken,
  userId,
}: {
  rawToken: string;
  userId: string;
}) => {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const now = new Date();

  const result = await prisma.$transaction(async (tx: any) => {
    const offer = await tx.waitlistOffer.findFirst({
      where: {
        tokenHash,
        status: 'PENDING',
        expiresAt: { gt: now },
      },
      include: {
        waitlistEntry: { include: { user: true } },
        showSeat: {
          include: {
            seat: true,
            category: true,
            show: {
              include: {
                categoryPrices: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      const err: any = new Error('Waitlist offer is invalid or has expired');
      err.statusCode = 404;
      err.code = 'OFFER_EXPIRED';
      throw err;
    }

    if (offer.waitlistEntry.userId !== userId) {
      const err: any = new Error('This waitlist offer belongs to another customer');
      err.statusCode = 403;
      err.code = 'UNAUTHORIZED_OFFER';
      throw err;
    }

    const holdToken = crypto.randomUUID();
    const holdTtlMs = config.seatHoldTtlMinutes * 60 * 1000;
    const holdExpiresAt = new Date(now.getTime() + holdTtlMs);

    await tx.waitlistOffer.update({
      where: { id: offer.id },
      data: { status: 'CLAIMED' },
    });

    await tx.waitlistEntry.update({
      where: { id: offer.waitlistEntryId },
      data: { status: 'FULFILLED' },
    });

    await tx.showSeat.update({
      where: { id: offer.showSeatId },
      data: {
        status: 'HELD',
        holdToken,
        holdExpiresAt,
      },
    });

    const categoryPriceObj = offer.showSeat.show.categoryPrices.find(
      (cp: any) => cp.categoryId === offer.showSeat.categoryId
    );
    const price = categoryPriceObj ? categoryPriceObj.price : 0;

    return {
      holdToken,
      showId: offer.showSeat.showId,
      expiresAt: holdExpiresAt,
      seats: [
        {
          showSeatId: offer.showSeatId,
          seatNumber: offer.showSeat.seat.seatNumber,
          rowLabel: offer.showSeat.seat.rowLabel,
          categoryName: offer.showSeat.category.name,
          price,
        },
      ],
      totalAmount: price,
    };
  });

  return result;
};
