'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Category {
  _id: string;
  categoryname: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  images: string;
  category: string;
  stock: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: { _id: string; categoryname: string };
  images: string[];
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  images: '',
  category: '',
  stock: '',
};

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push('/');
  }, [user, loading, router]);

  const fetchProducts = () => {
    api.get('/api/products?limit=100').then((res) => setProducts(res.data.products));
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchProducts();
      api.get('/api/categories').then((res) => setCategories(res.data));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        category: form.category,
        stock: parseInt(form.stock),
      };
      if (editId) {
        await api.put(`/api/products/${editId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setForm(emptyForm);
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

  const handleEdit = (product: Product) => {
    setEditId(product._id);
    setForm({
      name: product.name,
      description: '',
      price: String(product.price),
      images: product.images.join(', '),
      category: product.category?._id || '',
      stock: String(product.stock),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`);
    fetchProducts();
  };

  if (loading || !user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="col-span-2 font-bold text-lg text-gray-700">{editId ? 'Edit Product' : 'New Product'}</h2>
          {[
            { label: 'Name', key: 'name', type: 'text' },
            { label: 'Price', key: 'price', type: 'number' },
            { label: 'Stock', key: 'stock', type: 'number' },
            { label: 'Images (comma-separated URLs)', key: 'images', type: 'text' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key as keyof ProductForm]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.categoryname}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600">Name</th>
              <th className="text-left px-4 py-3 text-gray-600">Category</th>
              <th className="text-left px-4 py-3 text-gray-600">Price</th>
              <th className="text-left px-4 py-3 text-gray-600">Stock</th>
              <th className="text-left px-4 py-3 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category?.categoryname || '-'}</td>
                <td className="px-4 py-3 text-indigo-600 font-medium">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products yet.</p>
        )}
      </div>
    </div>
  );
}
