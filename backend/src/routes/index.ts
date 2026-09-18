import { Router } from 'express';
import authRouter from './auth';
import contactsRouter from './contacts';
import companiesRouter from './companies';
import activitiesRouter from './activities';
import dealsRouter from './deals';
import tasksRouter from './tasks';
import leadScoringRouter from './leadScoring';
import workflowsRouter from './workflows';
import analyticsRouter from './analytics';

const router = Router();

router.use('/auth', authRouter);
router.use('/contacts', contactsRouter);
router.use('/companies', companiesRouter);
router.use('/activities', activitiesRouter);
router.use('/deals', dealsRouter);
router.use('/tasks', tasksRouter);
router.use('/lead-scoring', leadScoringRouter);
router.use('/workflows', workflowsRouter);
router.use('/analytics', analyticsRouter);

export default router;
