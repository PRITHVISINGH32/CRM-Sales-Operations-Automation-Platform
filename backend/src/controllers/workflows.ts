import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getWorkflows = async (req: Request, res: Response): Promise<void> => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        triggers: true,
        conditions: true,
        actions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkflowById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        triggers: true,
        conditions: true,
        actions: true,
        executions: { orderBy: { executedAt: 'desc' }, take: 20 },
      },
    });

    if (!workflow) {
      res.status(404).json({ error: 'Workflow not found' });
      return;
    }

    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
  const { name, description, triggers, conditions, actions } = req.body;
  try {
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        triggers: { create: triggers },
        conditions: { create: conditions },
        actions: { create: actions },
      },
      include: { triggers: true, conditions: true, actions: true }
    });
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const executeWorkflow = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { triggerEvent } = req.body;
  
  try {
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        triggerEvent: triggerEvent || 'Manual Execution',
        status: 'SUCCESS', // Simulation
      }
    });
    res.json({ message: 'Workflow executed successfully', execution });
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
};

export const getWorkflowLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.workflowExecution.findMany({
      include: { workflow: { select: { name: true } } },
      orderBy: { executedAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
