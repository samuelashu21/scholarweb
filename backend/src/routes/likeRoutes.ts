import { Router } from 'express';
import { toggleLike, getUserLikes } from '../controllers/likeController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/:productId', protect, toggleLike);
router.get('/user', protect, getUserLikes);

export default router;
