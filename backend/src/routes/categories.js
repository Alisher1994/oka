import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;
