import { Router } from 'express';
import { getMyBookings, getBookingById, cancelBookingHandler } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-bookings', requireAuth, getMyBookings);
router.get('/:id', requireAuth, getBookingById);
router.post('/:id/cancel', requireAuth, cancelBookingHandler);

export default router;
