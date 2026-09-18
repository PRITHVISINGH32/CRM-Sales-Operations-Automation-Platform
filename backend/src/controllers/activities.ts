import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  const { contactId, companyId, dealId } = req.query;
  try {
    const activities = await prisma.activity.findMany({
      where: {
        ...(contactId ? { contactId: String(contactId) } : {}),
        ...(companyId ? { companyId: String(companyId) } : {}),
        ...(dealId ? { dealId: String(dealId) } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await prisma.activity.create({
      data: req.body,
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};
