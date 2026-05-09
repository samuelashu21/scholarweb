import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

/**
 * GET PRODUCTS
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        (filter.price as any).$gte = parseFloat(req.query.minPrice as string);
      }
      if (req.query.maxPrice) {
        (filter.price as any).$lte = parseFloat(req.query.maxPrice as string);
      }
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'categoryname')
      .populate('seller', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // ⚡ faster + avoids hydration issues

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * GET PRODUCT BY ID
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
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

/**
 * CREATE PRODUCT (Cloudinary ready)
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, description, price, category, stock } = req.body;

    const images =
      (req.files as Express.Multer.File[])?.map((file) => file.path) || [];

    const product = await Product.create({
      name,
      description,
      price,
      images,
      category,
      seller: req.user?._id,
      stock: stock || 0,
      ratings: [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * UPDATE PRODUCT
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const { name, description, price, category, stock } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      product.images = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );
    }

    const updated = await product.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * DELETE PRODUCT
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
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

/**
 * ADD REVIEW (FIXED - NO averageRating assignment)
 */
export const addReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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
      comment: req.body.comment || '',
    });

    await product.save(); // ✅ NO averageRating assignment anymore

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};