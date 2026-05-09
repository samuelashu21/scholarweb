import { Router } from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/categoryController';

import { protect } from '../middleware/auth';
import { admin } from '../middleware/admin';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getCategories);

// ✅ Add Cloudinary upload support here
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  createCategory
);

router.delete('/:id', protect, admin, deleteCategory);

export default router;