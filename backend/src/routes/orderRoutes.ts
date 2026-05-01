import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
  getAllOrders,
  deliverOrder,
} from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { admin } from '../middleware/admin';

const router = Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/deliver', protect, admin, deliverOrder);

export default router;
