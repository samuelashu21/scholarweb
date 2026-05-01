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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    api
      .get(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleLike = async () => {
    if (!user) { router.push('/login'); return; }
    setLikeLoading(true);
    try {
      const { data } = await api.post(`/api/likes/${id}`);
      setLiked(data.liked);
    } catch { /* ignore */ } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      qty,
      stock: product.stock,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post(`/api/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setReviewError(axiosErr.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
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

  const images = product.images.length > 0 ? product.images : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden mb-4">
            <Image
              src={images[selectedImage]}
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
                    selectedImage === i ? 'border-indigo-600' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" sizes="80px" />
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
          <h1 className="text-3xl font-bold text-gray-800 mt-3 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.averageRating} count={product.ratings.length} size="md" />
          </div>
          <p className="text-4xl font-bold text-indigo-600 mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-gray-100 rounded-l-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-4 py-2 hover:bg-gray-100 rounded-r-lg"
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
              liked ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {liked ? '❤️ Liked' : '🤍 Add to Wishlist'}
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Sold by: <span className="font-medium">{product.seller?.name}</span>
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

        {user && (
          <form onSubmit={handleReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Write a Review</h3>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  className={`text-2xl transition ${s <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
              rows={3}
            />
            {reviewError && <p className="text-red-500 text-sm mb-2">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {product.ratings.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {product.ratings.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{review.user?.name || 'User'}</span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
