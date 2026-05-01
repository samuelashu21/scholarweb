'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (!user) return null;

  const taxPrice = totalPrice * 0.1;
  const shippingPrice = totalPrice > 100 ? 0 : 10;
  const orderTotal = totalPrice + taxPrice + shippingPrice;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const orderItems = cartItems.map((item) => ({
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        product: item._id,
      }));
      const { data } = await api.post('/api/orders', {
        orderItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        itemsPrice: totalPrice,
        taxPrice,
        shippingPrice,
        totalPrice: orderTotal,
      });
      clearCart();
      router.push(`/orders/${data._id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-8 gap-4">
        {['Shipping', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={step === i + 1 ? 'font-semibold text-indigo-600' : 'text-gray-500'}>{s}</span>
            {i < 2 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="123 Main St"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="United States"
                    required
                  />
                </div>
                <button
                  onClick={() => { if (address && city && postalCode && country) setStep(2); }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {['Credit Card', 'PayPal', 'Stripe'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="text-indigo-600"
                    />
                    <span className="font-medium">{method}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Review Order</h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Shipping to:</p>
                <p className="text-gray-600">{address}, {city}, {postalCode}, {country}</p>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Payment Method: {paymentMethod}</p>
              </div>
              <div className="mb-6">
                <p className="font-medium text-gray-700 mb-3">Items:</p>
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm py-1">
                    <span>{item.name} × {item.qty}</span>
                    <span>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span className="truncate max-w-[150px]">{item.name} ×{item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-3 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${taxPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span></div>
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
