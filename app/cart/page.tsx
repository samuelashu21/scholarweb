'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';

export default function CartPage() {
  const { cartItems, clearCart, totalPrice } = useCart();

  const taxPrice = totalPrice * 0.1;
  const shippingPrice = totalPrice > 100 ? 0 : 10;
  const orderTotal = totalPrice + taxPrice + shippingPrice;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some products to get started!</p>
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">{cartItems.length} item(s)</h2>
            <button onClick={clearCart} className="text-red-500 hover:underline text-sm">
              Clear Cart
            </button>
          </div>
          {cartItems.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              {shippingPrice === 0 && (
                <p className="text-green-600 text-xs">🎉 Free shipping on orders over $100</p>
              )}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="block mt-6 w-full bg-indigo-600 text-white text-center py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block mt-3 w-full text-center text-indigo-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
