'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Category {
  _id: string;
  categoryname: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category: { _id: string; categoryname: string };
  images: string[];
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
};

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.isAdmin;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !loading && !isAdmin) {
      router.replace('/');
    }
  }, [mounted, loading, isAdmin, router]);

  useEffect(() => {
    if (mounted && isAdmin) {
      fetchProducts();
      api.get('/api/categories').then((res) => setCategories(res.data));
    }
  }, [mounted, isAdmin]);

  const fetchProducts = () => {
    api.get('/api/products?limit=100')
      .then((res) => setProducts(res.data.products));
  };

  // ✅ CLOUDINARY UPLOAD VIA MULTER (IMPORTANT FIX)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);

      // 👇 IMPORTANT: send files directly
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      if (editId) {
        await api.put(`/api/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setForm(emptyForm);
      setImageFiles([]);
      setEditId(null);
      setShowForm(false);
      fetchProducts();

    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  if (loading) {
    return <div className="p-8">Loading auth...</div>;
  }

  if (!isAdmin) {
    return <div className="p-8 text-red-500">Unauthorized</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow grid gap-4">

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2"
            required
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2"
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2"
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border p-2"
            required
          />

          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border p-2"
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryname}
              </option>
            ))}
          </select>

          {/* FILE UPLOAD */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files) return;
              setImageFiles(Array.from(e.target.files));
            }}
            className="border p-2"
            required
          />

          <button
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {submitting ? 'Saving...' : 'Save Product'}
          </button>

          {error && <p className="text-red-500">{error}</p>}
        </form>
      )}

      {/* TABLE */}
      <div className="mt-10">
        <table className="w-full border">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Images</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  {p.images?.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-10 h-10 inline-block mr-1"
                    />
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}