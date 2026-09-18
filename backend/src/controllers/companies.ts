import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        contacts: true,
        deals: true,
        activities: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await prisma.company.create({
      data: req.body,
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const company = await prisma.company.update({
      where: { id },
      data: req.body,
    });
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.company.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete' });
  }
};
