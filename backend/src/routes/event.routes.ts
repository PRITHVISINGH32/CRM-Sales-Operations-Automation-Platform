import { Router } from 'express';
import { getEvents, getEventById, createEvent } from '../controllers/event.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', requireAuth, requireRole('ORGANISER', 'ADMIN'), createEvent);

export default router;
