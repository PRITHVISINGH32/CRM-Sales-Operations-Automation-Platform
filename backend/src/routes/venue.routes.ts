import { Router } from 'express';
import { getVenues, getVenueById, createVenue } from '../controllers/venue.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getVenues);
router.get('/:id', getVenueById);
router.post('/', requireAuth, requireRole('ADMIN'), createVenue);

export default router;
