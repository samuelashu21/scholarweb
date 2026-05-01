'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard, { Product } from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';

interface Category {
  _id: string;
  categoryname: string;
  image: string;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products?limit=8'),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data.products);
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to ShopHub</h1>
          <p className="text-xl mb-8 text-indigo-100">
            Discover thousands of products at unbeatable prices
          </p>
          <Link
            href="/products"
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3 rounded-full text-lg transition shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat._id} {...cat} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No categories yet.</p>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
            <Link href="/products" className="text-indigo-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">No products yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-50 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to sell?</h2>
        <p className="text-gray-600 mb-8">Join thousands of sellers on ShopHub today.</p>
        <Link
          href="/register"
          className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-8 py-3 rounded-full text-lg transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}
