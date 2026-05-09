'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import StarRating from './StarRating';
import api from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: { _id: string; categoryname: string };
  seller: { _id: string; name: string };
  stock: number;
  averageRating: number;
  ratings: { user: string; rating: number; comment: string }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    setLikeLoading(true);
    try {
      const { data } = await api.post(`/api/likes/${product._id}`);
      setLiked(data.liked);
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0] || '/placeholder.png',
      price: product.price,
      qty: 1,
      stock: product.stock,
    });
  };

  // ✅ SAFE IMAGE HANDLER (FIXES YOUR ERROR)
  const imageUrl = (() => {
    const img = product.images?.[0];

    if (!img || typeof img !== 'string') {
      return '/placeholder.png';
    }

    if (img.startsWith('http')) {
      return img;
    }

    if (img.startsWith('/')) {
      return `http://localhost:5000${img}`;
    }

    return '/placeholder.png';
  })();

  return (
    <Link href={`/products/${product._id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
        
        <div className="relative h-52 bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={!imageUrl.startsWith('http')}
          />

          <button
            onClick={handleLike}
            disabled={likeLoading || !user}
            className={`absolute top-2 right-2 p-2 rounded-full transition ${
              liked
                ? 'bg-red-100 text-red-500'
                : 'bg-white/80 text-gray-400'
            } hover:scale-110`}
          >
            {liked ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 truncate">
            {product.name}
          </h3>

          <p className="text-gray-500 text-sm truncate mt-1">
            {product.description}
          </p>

          <StarRating
            rating={product.averageRating}
            count={product.ratings.length}
            size="sm"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-indigo-600">
              ${product.price.toFixed(2)}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}