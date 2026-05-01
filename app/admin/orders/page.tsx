'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  orderItems: { name: string }[];
}

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push('/');
  }, [user, loading, router]);

  const fetchOrders = () => {
    api
      .get('/api/orders')
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (user?.isAdmin) fetchOrders();
  }, [user]);

  const handleDeliver = async (id: string) => {
    await api.put(`/api/orders/${id}/deliver`);
    fetchOrders();
  };

  if (loading || fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Orders</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600">ID</th>
                <th className="text-left px-4 py-3 text-gray-600">User</th>
                <th className="text-left px-4 py-3 text-gray-600">Date</th>
                <th className="text-left px-4 py-3 text-gray-600">Total</th>
                <th className="text-left px-4 py-3 text-gray-600">Paid</th>
                <th className="text-left px-4 py-3 text-gray-600">Delivered</th>
                <th className="text-left px-4 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{order.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-indigo-600">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.isDelivered ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/orders/${order._id}`} className="text-indigo-600 hover:underline text-xs">
                      View
                    </Link>
                    {!order.isDelivered && (
                      <button
                        onClick={() => handleDeliver(order._id)}
                        className="text-green-600 hover:underline text-xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
