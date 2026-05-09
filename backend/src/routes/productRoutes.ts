import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from '../controllers/productController';

import { protect } from '../middleware/auth';
import { admin } from '../middleware/admin';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getProducts);

router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  admin,
  upload.array('images', 5),
  createProduct
);

router.put(
  '/:id',
  protect,
  admin,
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, admin, deleteProduct);

router.post('/:id/reviews', protect, addReview);

export default router;