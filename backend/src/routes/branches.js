import express from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchesController.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getBranches);
router.get('/:id', getBranchById);

export default router;
