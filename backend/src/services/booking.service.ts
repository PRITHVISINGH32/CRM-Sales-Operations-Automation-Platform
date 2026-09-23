import { prisma } from '../config/prisma';
import { generateQrCodeDataUrl } from '../utils/qr';
import { sendBookingConfirmationEmail } from '../utils/email.service';
import { broadcastMultipleSeatUpdates } from '../sockets/socket.server';

export interface SimulatePaymentParams {
  userId: string;
  holdToken: string;
  result: 'SUCCESS' | 'FAILED';
}

export interface BookingResult {
  bookingId?: string;
  bookingReference?: string;
  totalAmount?: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  paymentStatus: 'SUCCESS' | 'FAILED';
  qrCodeData?: string;
  seats?: Array<{ rowLabel: string; seatNumber: number; categoryName: string; price: number }>;
}

export const processSimulatedPayment = async ({
  userId,
  holdToken,
  result,
}: SimulatePaymentParams): Promise<BookingResult> => {
  const now = new Date();

  // Find user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Handle Payment Failure
  if (result === 'FAILED') {
    const releasedSeats = await prisma.$transaction(async (tx: any) => {
      const seatsToRelease = await tx.showSeat.findMany({
        where: { holdToken, status: 'HELD' },
      });

      if (seatsToRelease.length > 0) {
        await tx.showSeat.updateMany({
          where: { holdToken },
          data: {
            status: 'AVAILABLE',
            holdToken: null,
            holdExpiresAt: null,
          },
        });
      }

      return seatsToRelease;
    });

    if (releasedSeats.length > 0) {
      broadcastMultipleSeatUpdates(
        releasedSeats[0].showId,
        releasedSeats.map((s: any) => ({ seatId: s.id, status: 'AVAILABLE' }))
      );
    }

    return {
      status: 'FAILED',
      paymentStatus: 'FAILED',
    };
  }

  // Handle Payment SUCCESS inside atomic PostgreSQL transaction
  const booking = await prisma.$transaction(async (tx: any) => {
    // 1. Lock and fetch ShowSeat records with holdToken FOR UPDATE
    const heldSeats: any[] = await tx.$queryRaw`
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
      WHERE ss."holdToken" = ${holdToken}
      FOR UPDATE OF ss
    `;

    if (heldSeats.length === 0) {
      const err: any = new Error('Hold not found or already expired/processed');
      err.statusCode = 404;
      err.code = 'HOLD_NOT_FOUND';
      throw err;
    }

    // Verify hold expiry
    for (const seat of heldSeats) {
      if (seat.status !== 'HELD' || !seat.holdExpiresAt || new Date(seat.holdExpiresAt) < now) {
        const err: any = new Error('Your seat hold has expired. Please select seats again.');
        err.statusCode = 400;
        err.code = 'HOLD_EXPIRED';
        throw err;
      }
    }

    const showId = heldSeats[0].showId;
    const totalAmount = heldSeats.reduce((sum, s) => sum + Number(s.price), 0);

    // Generate unique reference
    const timestampRef = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `BOOK-2026-${timestampRef}${randomSuffix}`;

    // Generate QR Code data URL
    const qrCodeDataUrl = await generateQrCodeDataUrl(bookingReference);

    // Create Booking
    const newBooking = await tx.booking.create({
      data: {
        bookingReference,
        userId: user.id,
        showId: showId,
        totalAmount: totalAmount,
        status: 'CONFIRMED',
        paymentStatus: 'SUCCESS',
        qrCodeData: qrCodeDataUrl,
      },
    });

    // Create BookingSeat entries & update ShowSeat to BOOKED
    for (const seat of heldSeats) {
      await tx.bookingSeat.create({
        data: {
          bookingId: newBooking.id,
          showSeatId: seat.id,
          price: Number(seat.price),
        },
      });

      await tx.showSeat.update({
        where: { id: seat.id },
        data: {
          status: 'BOOKED',
          holdToken: null,
          holdExpiresAt: null,
          bookingId: newBooking.id,
        },
      });
    }

    return {
      bookingId: newBooking.id,
      bookingReference: newBooking.bookingReference,
      totalAmount,
      qrCodeData: qrCodeDataUrl,
      showId,
      seats: heldSeats.map((s) => ({
        showSeatId: s.id,
        rowLabel: s.rowLabel,
        seatNumber: s.seatNumber,
        categoryName: s.categoryName,
        price: Number(s.price),
      })),
    };
  });

  // Broadcast Socket.IO updates
  broadcastMultipleSeatUpdates(
    booking.showId,
    booking.seats.map((s: any) => ({ seatId: s.showSeatId, status: 'BOOKED' }))
  );

  // Fetch show details for email template
  try {
    const showDetails = await prisma.show.findUnique({
      where: { id: booking.showId },
      include: { event: true, venue: true },
    });

    if (showDetails) {
      const seatLabels = booking.seats.map((s: any) => `${s.rowLabel}${s.seatNumber}`);
      const showTimeString = `${new Date(showDetails.startTime).toLocaleDateString()} at ${new Date(showDetails.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Send email asynchronously (non-blocking)
      sendBookingConfirmationEmail({
        to: user.email,
        customerName: user.name,
        bookingReference: booking.bookingReference,
        eventTitle: showDetails.event.title,
        venueName: showDetails.venue.name,
        showTime: showTimeString,
        seats: seatLabels,
        totalAmount: booking.totalAmount,
        qrCodeUrl: booking.qrCodeData,
      }).catch((err) => console.error('Asynchronous email trigger caught error:', err));
    }
  } catch (emailError) {
    console.error('Non-critical email dispatch error:', emailError);
  }

  return {
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    totalAmount: booking.totalAmount,
    status: 'CONFIRMED',
    paymentStatus: 'SUCCESS',
    qrCodeData: booking.qrCodeData,
    seats: booking.seats,
  };
};
