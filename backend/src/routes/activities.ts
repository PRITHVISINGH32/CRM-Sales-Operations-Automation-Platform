import { Router } from 'express';
import { getActivities, createActivity } from '../controllers/activities';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', createActivity);

export default router;
