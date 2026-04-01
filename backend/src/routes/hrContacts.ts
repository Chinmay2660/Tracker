import express from 'express';
import {
  listHrContacts,
  createHrContact,
  updateHrContact,
  deleteHrContact,
} from '../controllers/hrContactController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.get('/', listHrContacts);
router.post('/', createHrContact);
router.put('/:id', updateHrContact);
router.delete('/:id', deleteHrContact);

export default router;
