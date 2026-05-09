'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Category {
  _id: string;
  categoryname: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.isAdmin;

  // ✅ Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthorized
  useEffect(() => {
    if (mounted && !loading && !isAdmin) {
      router.replace('/');
    }
  }, [mounted, loading, isAdmin, router]);

  const fetchCategories = () => {
    api.get('/api/categories')
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    if (mounted && isAdmin) {
      fetchCategories();
    }
  }, [mounted, isAdmin]);

  // ☁️ Upload image to Cloudinary via backend (multer)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('categoryname', name);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/api/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setName('');
      setImageFile(null);
      fetchCategories();

    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/api/categories/${id}`);
    fetchCategories();
  };

  // ✅ safe render
  if (!mounted || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-500">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Categories
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <h2 className="font-bold text-lg text-gray-700 mb-4">
          Add New Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* NAME */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Electronics"
              required
            />
          </div>

          {/* IMAGE FILE UPLOAD */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Category Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] || null)
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 bg-indigo-600 text-white px-8 py-2 rounded-lg"
        >
          {submitting ? 'Creating...' : 'Add Category'}
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Image</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat._id}>

                <td className="px-4 py-3 font-medium">
                  {cat.categoryname}
                </td>

                <td className="px-4 py-3">
                  <img
                    src={cat.image}
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {categories.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No categories yet.
          </p>
        )}
      </div>

    </div>
  );
}