import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
