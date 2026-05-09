import mongoose, { Schema, Document } from 'mongoose';

/**
 * Rating interface
 */
export interface IRating {
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

/**
 * Product interface
 */
export interface IProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  stock: number;
  ratings: IRating[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rating schema
 */
const ratingSchema = new Schema<IRating>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

/**
 * Product schema
 */
const productSchema = new Schema<IProduct & Document>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },

    price: {
      type: Number,
      required: true,
      index: true,
    },

    // ✅ Cloudinary image URLs
    images: {
      type: [String],
      default: [],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    stock: {
      type: Number,
      default: 0,
    },

    ratings: [ratingSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * ✅ Text search index (important for e-commerce search)
 */
productSchema.index({
  name: 'text',
  description: 'text',
});

/**
 * ✅ Virtual average rating (no need to store in DB)
 */
productSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;

  return (
    this.ratings.reduce((sum, r) => sum + r.rating, 0) /
    this.ratings.length
  );
});

/**
 * Ensure virtuals are included in JSON output
 */
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

/**
 * Model export
 */
const Product = mongoose.model<IProduct & Document>(
  'Product',
  productSchema
);

export default Product;