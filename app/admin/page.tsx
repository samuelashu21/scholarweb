'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      Promise.all([
        api.get('/api/orders'),
        api.get('/api/products?limit=1'),
      ])
        .then(([ordersRes, prodRes]) => {
          const orders = ordersRes.data;
          setStats({
            totalOrders: orders.length,
            totalRevenue: orders.filter((o: { isPaid: boolean }) => o.isPaid).reduce((sum: number, o: { totalPrice: number }) => sum + o.totalPrice, 0),
            pendingOrders: orders.filter((o: { isDelivered: boolean }) => !o.isDelivered).length,
            totalProducts: prodRes.data.total,
          });
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user]);

  if (loading || fetching) return null;
  if (!user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'bg-blue-50 text-blue-700' },
          { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 text-green-700' },
          { label: 'Pending Delivery', value: stats.pendingOrders, icon: '🚚', color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Total Products', value: stats.totalProducts, icon: '🏪', color: 'bg-indigo-50 text-indigo-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-6 ${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { href: '/admin/products', label: 'Manage Products', desc: 'Add, edit, delete products', icon: '🏷️' },
          { href: '/admin/categories', label: 'Manage Categories', desc: 'Organize product categories', icon: '📂' },
          { href: '/admin/orders', label: 'Manage Orders', desc: 'View and update orders', icon: '📋' },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-3xl mb-3">{link.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg">{link.label}</h3>
              <p className="text-gray-500 text-sm mt-1">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
