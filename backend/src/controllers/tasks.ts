import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        contact: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
        deal: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await prisma.task.create({
      data: req.body,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: req.body,
    });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};
