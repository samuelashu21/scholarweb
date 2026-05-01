'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface OrderDetail {
  _id: string;
  user: { name: string; email: string };
  orderItems: { name: string; image: string; price: number; qty: number; product: string }[];
  shippingAddress: { address: string; city: string; postalCode: string; country: string };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api
        .get(`/api/orders/${id}`)
        .then((res) => setOrder(res.data))
        .catch(() => router.push('/orders'))
        .finally(() => setFetching(false));
    }
  }, [user, id, router]);

  const handlePay = async () => {
    setPaying(true);
    try {
      await api.put(`/api/orders/${id}/pay`, {
        id: 'simulated',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: user?.email,
      });
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch { /* ignore */ } finally {
      setPaying(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Details</h1>
      <p className="text-gray-500 mb-8">Order #{order._id.slice(-8).toUpperCase()}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-gray-800 mb-3">Shipping</h2>
            <p className="text-gray-600">
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <span
              className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {order.isDelivered
                ? `Delivered on ${new Date(order.deliveredAt!).toLocaleDateString()}`
                : 'Not Delivered'}
            </span>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-gray-800 mb-3">Payment</h2>
            <p className="text-gray-600">Method: {order.paymentMethod}</p>
            <span
              className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {order.isPaid
                ? `Paid on ${new Date(order.paidAt!).toLocaleDateString()}`
                : 'Not Paid'}
            </span>
            {!order.isPaid && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-4 block w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {paying ? 'Processing...' : 'Mark as Paid (Simulate)'}
              </button>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-gray-800 mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item.product} className="flex justify-between text-sm">
                  <span className="text-gray-800">
                    {item.name} × {item.qty}
                  </span>
                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="font-bold text-gray-800 mb-4">Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Items</span><span>${order.itemsPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
