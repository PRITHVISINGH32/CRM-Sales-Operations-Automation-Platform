import { Router } from 'express';
import { claimWaitlistOfferHandler, getMyWaitlists } from '../controllers/waitlist.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-waitlists', requireAuth, getMyWaitlists);
router.post('/claim', requireAuth, claimWaitlistOfferHandler);

export default router;
