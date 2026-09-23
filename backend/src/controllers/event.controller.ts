import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { createEventSchema } from '../validators/event.validator';
import { AuthRequest } from '../types';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, search } = req.query;

    const whereClause: any = {};

    if (type && ['MOVIE', 'CONCERT'].includes(type as string)) {
      whereClause.type = type as any;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        organiser: {
          select: { id: true, name: true, email: true },
        },
        shows: {
          where: { startTime: { gte: new Date() } },
          include: {
            venue: true,
            categoryPrices: { include: { category: true } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { events },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organiser: { select: { id: true, name: true, email: true } },
        shows: {
          include: {
            venue: {
              include: { categories: true },
            },
            categoryPrices: { include: { category: true } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found' },
      });
    }

    return res.json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createEventSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const event = await prisma.event.create({
      data: {
        title: validated.title,
        description: validated.description,
        type: validated.type as any,
        posterUrl: validated.posterUrl || null,
        organiserId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};
