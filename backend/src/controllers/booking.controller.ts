import { Response, NextFunction } from 'express';
import { createSeatHold } from '../services/hold.service';
import { processSimulatedPayment } from '../services/booking.service';
import { cancelBooking } from '../services/waitlist.service';
import { createHoldSchema, simulatePaymentSchema } from '../validators/hold.validator';
import { AuthRequest } from '../types';
import { prisma } from '../config/prisma';

export const createHold = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { showId } = req.params;
    const validated = createHoldSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const holdResult = await createSeatHold({
      showId,
      userId: req.user.userId,
      showSeatIds: validated.seatIds,
    });

    return res.status(201).json({
      success: true,
      data: holdResult,
    });
  } catch (error) {
    next(error);
  }
};

export const simulatePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = simulatePaymentSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const holdToken = validated.holdToken || validated.holdId;
    if (!holdToken) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_HOLD', message: 'Hold token required' } });
    }

    const bookingResult = await processSimulatedPayment({
      userId: req.user.userId,
      holdToken,
      result: validated.result,
    });

    return res.json({
      success: true,
      data: bookingResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: {
        show: {
          include: { event: true, venue: true },
        },
        bookingSeats: {
          include: {
            showSeat: {
              include: { seat: true, category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        show: {
          include: { event: true, venue: true },
        },
        bookingSeats: {
          include: {
            showSeat: {
              include: { seat: true, category: true },
            },
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found' },
      });
    }

    if (booking.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied to this booking' },
      });
    }

    return res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBookingHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const result = await cancelBooking({
      bookingId: id,
      userId: req.user.userId,
      isAdmin: req.user.role === 'ADMIN',
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
