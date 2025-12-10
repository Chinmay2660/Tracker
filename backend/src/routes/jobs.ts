import express from 'express';
import { getJobs, createJob, updateJob, deleteJob, moveJob, reorderJobs } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.get('/', getJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/move', moveJob);
router.patch('/reorder', reorderJobs);

export default router;

