import express from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders
} from '../controllers/ordersController.js';

const router = express.Router();

// Публичные маршруты
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/user/orders', getUserOrders);

export default router;
