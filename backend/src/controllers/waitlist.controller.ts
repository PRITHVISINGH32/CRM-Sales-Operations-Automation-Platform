import { Response, NextFunction } from 'express';
import { joinWaitlist, claimWaitlistOffer } from '../services/waitlist.service';
import { joinWaitlistSchema, claimWaitlistOfferSchema } from '../validators/hold.validator';
import { AuthRequest } from '../types';
import { prisma } from '../config/prisma';

export const joinWaitlistHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { showId } = req.params;
    const validated = joinWaitlistSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const entry = await joinWaitlist({
      showId,
      userId: req.user.userId,
      categoryId: validated.categoryId,
    });

    return res.status(201).json({
      success: true,
      data: { waitlistEntry: entry },
    });
  } catch (error) {
    next(error);
  }
};

export const claimWaitlistOfferHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = claimWaitlistOfferSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const result = await claimWaitlistOffer({
      rawToken: validated.token,
      userId: req.user.userId,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyWaitlists = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    const waitlistEntries = await prisma.waitlistEntry.findMany({
      where: { userId: req.user.userId },
      include: {
        category: true,
        show: {
          include: { event: true, venue: true },
        },
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: { waitlistEntries },
    });
  } catch (error) {
    next(error);
  }
};
