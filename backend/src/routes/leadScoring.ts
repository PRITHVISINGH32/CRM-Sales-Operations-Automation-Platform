import { Router } from 'express';
import { getLeadScoreRules, createLeadScoreRule, getContactLeadScoreLogs, calculateContactScore } from '../controllers/leadScoring';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/rules', getLeadScoreRules);
router.post('/rules', createLeadScoreRule);
router.get('/contact/:contactId', getContactLeadScoreLogs);
router.post('/contact/:contactId/calculate', calculateContactScore);

export default router;
