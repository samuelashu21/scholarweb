'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import StarRating from '@/components/StarRating';

interface Review {
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  _id: string;
}

interface ProductDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: { _id: string; categoryname: string };
  seller: { _id: string; name: string };
  stock: number;
  averageRating: number;
  ratings: Review[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    api
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  // ✅ URL validator
  const isValidUrl = (str?: string) => {
    if (!str) return false;
    try {
      return new URL(str).protocol.startsWith('http');
    } catch {
      return false;
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLikeLoading(true);
    try {
      const { data } = await api.post(`/api/likes/${id}`);
      setLiked(data.liked);
    } catch {
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const safeImage = isValidUrl(product.images?.[0])
      ? product.images[0]
      : '/placeholder.png';

    addToCart({
      _id: product._id,
      name: product.name,
      image: safeImage,
      price: product.price,
      qty,
      stock: product.stock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // ✅ CLEAN ALL IMAGES
  const cleanedImages = (product.images || []).filter(isValidUrl);

  const images =
    cleanedImages.length > 0
      ? cleanedImages
      : ['/placeholder.png'];

  // ✅ SAFE INDEX
  const safeIndex =
    selectedImage < images.length ? selectedImage : 0;

  const mainImage = images[safeIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

        {/* Images */}
        <div>
          <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    safeIndex === i
                      ? 'border-indigo-600'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
            {product.category?.categoryname}
          </span>

          <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating
              rating={product.averageRating}
              count={product.ratings.length}
              size="md"
            />
          </div>

          <p className="text-4xl font-bold text-indigo-600 mb-4">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <span
              className={`font-medium ${
                product.stock > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : 'Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>

                <span className="px-4 py-2 font-medium">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty(Math.min(product.stock, qty + 1))
                  }
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          )}

          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              liked
                ? 'border-red-400 text-red-500 bg-red-50'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {liked ? '❤️ Liked' : '🤍 Add to Wishlist'}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Sold by:{' '}
            <span className="font-medium">
              {product.seller?.name}
            </span>
          </p>
        </div>
      </div>

      {/* Reviews section unchanged */}
    </div>
  );
}