import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';
import {
  createBranch,
  updateBranch,
  deleteBranch
} from '../controllers/branchesController.js';
import {
  getAllOrders,
  updateOrderStatus,
  getOrdersStats
} from '../controllers/adminController.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка multer для загрузки файлов
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware для проверки админа (упрощенная версия)
// В продакшене используйте JWT и проверку Telegram ID
const isAdmin = (req, res, next) => {
  // TODO: Добавить проверку JWT токена или Telegram авторизации
  next();
};

// Categories
router.post('/categories', isAdmin, createCategory);
router.put('/categories/:id', isAdmin, updateCategory);
router.delete('/categories/:id', isAdmin, deleteCategory);

// Products
router.post('/products', isAdmin, upload.single('image'), createProduct);
router.put('/products/:id', isAdmin, upload.single('image'), updateProduct);
router.delete('/products/:id', isAdmin, deleteProduct);

// Branches
router.post('/branches', isAdmin, createBranch);
router.put('/branches/:id', isAdmin, updateBranch);
router.delete('/branches/:id', isAdmin, deleteBranch);

// Orders
router.get('/orders', isAdmin, getAllOrders);
router.put('/orders/:id/status', isAdmin, updateOrderStatus);
router.get('/orders/stats', isAdmin, getOrdersStats);

export default router;
