import { Router } from 'express';
import { getShowById, getShowSeats, createShow } from '../controllers/show.controller';
import { createHold } from '../controllers/booking.controller';
import { joinWaitlistHandler } from '../controllers/waitlist.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', getShowById);
router.get('/:id/seats', getShowSeats);
router.post('/', requireAuth, requireRole('ORGANISER', 'ADMIN'), createShow);
router.post('/:showId/holds', requireAuth, createHold);
router.post('/:showId/waitlist', requireAuth, joinWaitlistHandler);

export default router;
