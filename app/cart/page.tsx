'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const { cartItems, clearCart, totalPrice, mounted } = useCart();

  // ✅ Better loading state (avoid blank screen)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">
          Loading cart...
        </div>
      </div>
    );
  }

  // ✅ Safe calculations
  const safeTotal = totalPrice || 0;
  const taxPrice = safeTotal * 0.1;
  const shippingPrice = safeTotal > 100 ? 0 : 10;
  const orderTotal = safeTotal + taxPrice + shippingPrice;

  // =========================
  // EMPTY CART
  // =========================
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-3xl p-10 text-center max-w-md w-full border border-gray-100">
          
          <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-indigo-100 text-5xl mb-6">
            🛒
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mb-8">
            Looks like you haven’t added anything yet.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // CART PAGE
  // =========================
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Shopping Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {cartItems.length} item(s) in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="mt-4 md:mt-0 text-red-500 font-medium hover:text-red-600 transition"
          >
            Clear Cart
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-5">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-5 border border-gray-100"
              >
                <CartItem item={item} />
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${safeTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-medium">
                    ${taxPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shippingPrice === 0
                      ? 'Free'
                      : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </div>

                {/* FREE SHIPPING MESSAGE */}
                {shippingPrice === 0 && (
                  <div className="bg-green-50 text-green-600 text-sm rounded-xl p-3">
                    🎉 You unlocked free shipping!
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 space-y-3">

                <Link
                  href="/checkout"
                  className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="block w-full text-center border border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition"
                >
                  Continue Shopping
                </Link>

              </div>

              {/* SECURITY BADGE */}
              <div className="mt-6 text-center text-sm text-gray-400">
                🔒 Secure Checkout
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 