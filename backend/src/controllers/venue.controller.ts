import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { createVenueSchema } from '../validators/event.validator';
import { AuthRequest } from '../types';

export const getVenues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const venues = await prisma.venue.findMany({
      include: {
        categories: true,
        _count: {
          select: { seats: true, shows: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { venues },
    });
  } catch (error) {
    next(error);
  }
};

export const getVenueById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        categories: true,
        seats: {
          include: { category: true },
          orderBy: [{ rowLabel: 'asc' }, { seatNumber: 'asc' }],
        },
      },
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        error: { code: 'VENUE_NOT_FOUND', message: 'Venue not found' },
      });
    }

    return res.json({
      success: true,
      data: { venue },
    });
  } catch (error) {
    next(error);
  }
};

export const createVenue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createVenueSchema.parse(req.body);

    const venue = await prisma.$transaction(async (tx: any) => {
      const newVenue = await tx.venue.create({
        data: {
          name: validated.name,
          location: validated.location,
          createdBy: req.user?.userId,
        },
      });

      // Extract unique categories
      const uniqueCategoryNames = Array.from(new Set(validated.rows.map((r) => r.categoryName)));
      const categoryMap = new Map<string, string>();

      for (const catName of uniqueCategoryNames) {
        const cat = await tx.seatCategory.create({
          data: {
            venueId: newVenue.id,
            name: catName,
          },
        });
        categoryMap.set(catName, cat.id);
      }

      // Generate Seats
      let pos = 1;
      for (const rowDef of validated.rows) {
        const categoryId = categoryMap.get(rowDef.categoryName);
        if (!categoryId) continue;

        for (let i = 1; i <= rowDef.seatCount; i++) {
          await tx.seat.create({
            data: {
              venueId: newVenue.id,
              categoryId,
              rowLabel: rowDef.rowLabel,
              seatNumber: i,
              position: pos++,
            },
          });
        }
      }

      return newVenue;
    });

    return res.status(201).json({
      success: true,
      data: { venue },
    });
  } catch (error) {
    next(error);
  }
};
