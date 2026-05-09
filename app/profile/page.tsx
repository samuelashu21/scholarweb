'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface FormData {
  name: string;
  email: string;
  avatar: string;
  password: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const initialized = useRef(false);

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    avatar: '',
    password: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && !initialized.current) {
      initialized.current = true;

      setForm({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        password: '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || '',
        postalCode: user.address?.postalCode || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('email', form.email);

      if (form.password) {
        formData.append('password', form.password);
      }

      formData.append(
        'address',
        JSON.stringify({
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
        })
      );

      if (avatarFile) {
        formData.append('avatar', avatarFile); // Cloudinary upload
      }

      const { data } = await api.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl space-y-6">

        {/* AVATAR UPLOAD */}
        <div>
          <label className="block text-sm mb-1">Avatar</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full"
          />

          {form.avatar && !avatarFile && (
            <img
              src={form.avatar}
              className="w-20 h-20 rounded-full mt-3 object-cover"
            />
          )}
        </div>

        {/* NAME */}
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="w-full border p-2 rounded"
        />

        {/* EMAIL */}
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full border p-2 rounded"
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New password"
          className="w-full border p-2 rounded"
        />

        <hr />

        {/* ADDRESS */}
        <input placeholder="Street" value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full border p-2 rounded" />

        <input placeholder="City" value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border p-2 rounded" />

        <input placeholder="State" value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full border p-2 rounded" />

        <input placeholder="Country" value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border p-2 rounded" />

        <input placeholder="Postal Code" value={form.postalCode}
          onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full border p-2 rounded" />

        {/* STATUS */}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-3 rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}