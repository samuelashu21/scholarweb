import { Router } from 'express';
import {
  getUserChats,
  createOrGetChat,
  sendMessage,
  editMessage,
  deleteMessage,
} from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getUserChats);
router.post('/', protect, createOrGetChat);
router.post('/:chatId/messages', protect, sendMessage);
router.put('/:chatId/messages/:messageId', protect, editMessage);
router.delete('/:chatId/messages/:messageId', protect, deleteMessage);

export default router;
