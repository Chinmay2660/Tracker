import express from 'express';
import { getColumns, createColumn, updateColumn, deleteColumn } from '../controllers/columnController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.get('/', getColumns);
router.post('/', createColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

export default router;

