import { Router } from 'express';
import { getDeals, getDealById, createDeal, updateDeal } from '../controllers/deals';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getDeals);
router.post('/', createDeal);
router.get('/:id', getDealById);
router.put('/:id', updateDeal);

export default router;
