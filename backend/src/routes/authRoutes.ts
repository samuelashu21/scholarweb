import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} from '../controllers/authController';

import { protect } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

// ✅ CLOUDINARY UPLOAD HERE
router.put(
  '/profile',
  protect,
  upload.single('avatar'),
  updateProfile
);

export default router;