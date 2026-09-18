import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getLeadScoreRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const rules = await prisma.leadScoreRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLeadScoreRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const rule = await prisma.leadScoreRule.create({
      data: req.body,
    });
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const getContactLeadScoreLogs = async (req: Request, res: Response): Promise<void> => {
  const { contactId } = req.params;
  try {
    const logs = await prisma.leadScore.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const calculateContactScore = async (req: Request, res: Response): Promise<void> => {
  const { contactId } = req.params;
  try {
    // This is a simplified engine that would normally evaluate `condition` JSON against the contact's data.
    // For this simulation, we'll just demonstrate adding a log and updating the total score.
    const { ruleName, points } = req.body;

    await prisma.leadScore.create({
      data: {
        contactId,
        ruleName,
        points: parseInt(points, 10),
      }
    });

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (contact) {
      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: { leadScore: contact.leadScore + parseInt(points, 10) }
      });
      res.json(updatedContact);
      return;
    }
    res.status(404).json({ error: 'Contact not found' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
