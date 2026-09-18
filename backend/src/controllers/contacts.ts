import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        company: true,
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        owner: { select: { firstName: true, lastName: true } },
        deals: true,
        activities: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
      },
    });

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contact.create({
      data: req.body,
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateContact = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: req.body,
    });
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.contact.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete' });
  }
};
