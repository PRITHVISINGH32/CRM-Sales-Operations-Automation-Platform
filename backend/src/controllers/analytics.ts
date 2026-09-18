import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalLeads = await prisma.contact.count();
    const qualifiedLeads = await prisma.contact.count({ where: { status: 'Qualified' } });
    
    const openDealsResult = await prisma.deal.aggregate({
      _count: true,
      _sum: { value: true },
      where: { stage: { notIn: ['WON', 'LOST'] } }
    });
    
    const wonDealsResult = await prisma.deal.aggregate({
      _count: true,
      _sum: { value: true },
      where: { stage: 'WON' }
    });

    const openDeals = openDealsResult._count || 0;
    const wonDeals = wonDealsResult._count || 0;
    const pipelineValue = openDealsResult._sum.value || 0;
    
    const closedDeals = wonDeals + await prisma.deal.count({ where: { stage: 'LOST' } });
    const conversionRate = closedDeals > 0 ? (wonDeals / closedDeals) * 100 : 0;
    
    const averageDealSize = wonDeals > 0 ? (wonDealsResult._sum.value || 0) / wonDeals : 0;

    res.json({
      totalLeads,
      qualifiedLeads,
      openDeals,
      wonDeals,
      pipelineValue,
      conversionRate,
      averageDealSize,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPipelineByStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const deals = await prisma.deal.groupBy({
      by: ['stage'],
      _count: true,
      _sum: { value: true },
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeadsBySource = async (req: Request, res: Response): Promise<void> => {
  try {
    const sources = await prisma.contact.groupBy({
      by: ['leadSource'],
      _count: true,
    });
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
