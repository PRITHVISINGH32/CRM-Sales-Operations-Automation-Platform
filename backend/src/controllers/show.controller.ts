import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { createShowSchema } from '../validators/event.validator';
import { AuthRequest } from '../types';

export const getShowById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        event: true,
        venue: { include: { categories: true } },
        categoryPrices: { include: { category: true } },
      },
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHOW_NOT_FOUND', message: 'Show not found' },
      });
    }

    return res.json({
      success: true,
      data: { show },
    });
  } catch (error) {
    next(error);
  }
};

export const getShowSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        event: true,
        venue: true,
        categoryPrices: { include: { category: true } },
      },
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        error: { code: 'SHOW_NOT_FOUND', message: 'Show not found' },
      });
    }

    // Fetch all show seats
    const showSeats = await prisma.showSeat.findMany({
      where: { showId: id },
      include: {
        seat: true,
        category: true,
      },
      orderBy: [
        { seat: { rowLabel: 'asc' } },
        { seat: { seatNumber: 'asc' } },
      ],
    });

    // Check if holds are expired dynamically when reading
    const now = new Date();
    const sanitizedSeats = showSeats.map((s: any) => {
      let currentStatus: 'AVAILABLE' | 'HELD' | 'BOOKED' = s.status;

      if (s.status === 'HELD' && s.holdExpiresAt && s.holdExpiresAt < now) {
        currentStatus = 'AVAILABLE';
      }

      return {
        id: s.id,
        seatId: s.seatId,
        rowLabel: s.seat.rowLabel,
        seatNumber: s.seat.seatNumber,
        position: s.seat.position,
        categoryId: s.categoryId,
        categoryName: s.category.name,
        status: currentStatus,
      };
    });

    // Calculate category summary and availability
    const categoryStats = show.categoryPrices.map((cp: any) => {
      const catSeats = sanitizedSeats.filter((s: any) => s.categoryId === cp.categoryId);
      const availableSeats = catSeats.filter((s: any) => s.status === 'AVAILABLE').length;
      return {
        categoryId: cp.categoryId,
        categoryName: cp.category.name,
        price: cp.price,
        totalSeats: catSeats.length,
        availableSeats,
        isSoldOut: availableSeats === 0,
      };
    });

    return res.json({
      success: true,
      data: {
        show,
        seats: sanitizedSeats,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createShowSchema.parse(req.body);

    // Verify physical seats in venue
    const physicalSeats = await prisma.seat.findMany({
      where: { venueId: validated.venueId },
    });

    if (physicalSeats.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_SEATS', message: 'Selected venue has no physical seats configured' },
      });
    }

    const show = await prisma.$transaction(async (tx: any) => {
      const newShow = await tx.show.create({
        data: {
          eventId: validated.eventId,
          venueId: validated.venueId,
          startTime: new Date(validated.startTime),
          endTime: new Date(validated.endTime),
        },
      });

      // Pricing
      await tx.showCategoryPrice.createMany({
        data: validated.categoryPrices.map((cp) => ({
          showId: newShow.id,
          categoryId: cp.categoryId,
          price: cp.price,
        })),
      });

      // ShowSeats initialization
      const showSeatData = physicalSeats.map((seat: any) => ({
        showId: newShow.id,
        seatId: seat.id,
        categoryId: seat.categoryId,
        status: 'AVAILABLE' as const,
      }));

      await tx.showSeat.createMany({
        data: showSeatData,
      });

      return newShow;
    });

    return res.status(201).json({
      success: true,
      data: { show },
    });
  } catch (error) {
    next(error);
  }
};
