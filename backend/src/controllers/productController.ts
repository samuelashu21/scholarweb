import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) (filter.price as Record<string, number>).$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(req.query.maxPrice as string);
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'categoryname')
      .populate('seller', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'categoryname')
      .populate('seller', 'name')
      .populate('ratings.user', 'name avatar');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, images, category, stock } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      images: images || [],
      category,
      seller: req.user?._id,
      stock: stock || 0,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    Object.assign(product, req.body);
    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    const alreadyReviewed = product.ratings.find(
      (r) => r.user.toString() === req.user?._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400).json({ message: 'Already reviewed' });
      return;
    }
    product.ratings.push({
      user: req.user!._id,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    });
    product.averageRating =
      product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
