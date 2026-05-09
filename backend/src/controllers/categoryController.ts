import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ categoryname: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createCategory = async (req: any, res: Response): Promise<void> => {
  try {
    const { categoryname } = req.body;

    // ✅ Cloudinary image comes from req.file
    const image = req.file?.path;

    const exists = await Category.findOne({ categoryname });
    if (exists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = await Category.create({
      categoryname,
      image, // ✅ Cloudinary URL
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};