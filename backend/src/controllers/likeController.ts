import { Response } from 'express';
import Like from '../models/Like';
import { AuthRequest } from '../middleware/auth';

export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;

    const existing = await Like.findOne({ user: userId, product: productId });
    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      res.json({ liked: false, message: 'Like removed' });
    } else {
      await Like.create({ user: userId, product: productId });
      res.json({ liked: true, message: 'Product liked' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getUserLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const likes = await Like.find({ user: req.user?._id }).populate('product');
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
