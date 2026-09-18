import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProcessMaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const maps = await prisma.processMap.findMany({
      include: {
        steps: { orderBy: { order: 'asc' } },
      },
    });
    res.json(maps);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProcessMap = async (req: Request, res: Response): Promise<void> => {
  const { name, description, steps } = req.body;
  try {
    const map = await prisma.processMap.create({
      data: {
        name,
        description,
        steps: { create: steps },
      },
      include: { steps: true },
    });
    res.status(201).json(map);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const getDataHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalContacts = await prisma.contact.count();
    const missingEmails = await prisma.contact.count({ where: { email: { equals: '' } } });
    const missingCompanies = await prisma.contact.count({ where: { companyId: null } });
    const missingOwners = await prisma.contact.count({ where: { ownerId: null } });
    
    // Simulate duplicate check (in a real app, this would be a complex query or background job)
    const duplicateContacts = Math.floor(totalContacts * 0.05);

    const issues = missingEmails + missingCompanies + missingOwners + duplicateContacts;
    const dataQualityScore = totalContacts > 0 ? Math.max(0, 100 - ((issues / (totalContacts * 4)) * 100)) : 100;

    res.json({
      totalContacts,
      missingEmails,
      missingCompanies,
      missingOwners,
      duplicateContacts,
      dataQualityScore: Math.round(dataQualityScore),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
