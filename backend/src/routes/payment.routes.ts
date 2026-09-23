import { Router } from 'express';
import { simulatePayment } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/simulate', requireAuth, simulatePayment);

export default router;
