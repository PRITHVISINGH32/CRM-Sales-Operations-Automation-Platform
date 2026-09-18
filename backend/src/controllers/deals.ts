import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        company: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDealById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        owner: { select: { firstName: true, lastName: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
      },
    });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.create({
      data: req.body,
    });
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deal = await prisma.deal.update({
      where: { id },
      data: req.body,
    });
    res.json(deal);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};
