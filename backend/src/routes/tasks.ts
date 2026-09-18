import { Router } from 'express';
import { getTasks, createTask, updateTask } from '../controllers/tasks';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);

export default router;
