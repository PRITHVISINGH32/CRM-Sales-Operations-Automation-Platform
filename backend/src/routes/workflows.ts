import { Router } from 'express';
import { getWorkflows, getWorkflowById, createWorkflow, executeWorkflow, getWorkflowLogs } from '../controllers/workflows';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.get('/logs', getWorkflowLogs);
router.get('/:id', getWorkflowById);
router.post('/:id/execute', executeWorkflow);

export default router;
