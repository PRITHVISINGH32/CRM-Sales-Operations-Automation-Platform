import { Router } from 'express';
import { getContacts, getContactById, createContact, updateContact, deleteContact } from '../controllers/contacts';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getContacts);
router.post('/', createContact);
router.get('/:id', getContactById);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
