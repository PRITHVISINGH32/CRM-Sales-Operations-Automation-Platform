import { Router } from 'express';
import { getDashboardMetrics, getPipelineByStage, getLeadsBySource } from '../controllers/analytics';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardMetrics);
router.get('/pipeline', getPipelineByStage);
router.get('/leads-by-source', getLeadsBySource);

export default router;
