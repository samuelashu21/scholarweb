'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: {
    _id: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    stock: number;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQty } = useCart();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
        <p className="text-indigo-600 font-semibold">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{item.qty}</span>
        <button
          onClick={() => updateQty(item._id, Math.min(item.stock, item.qty + 1))}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold transition"
        >
          +
        </button>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-800">${(item.price * item.qty).toFixed(2)}</p>
        <button
          onClick={() => removeFromCart(item._id)}
          className="text-red-500 hover:text-red-700 text-sm mt-1 transition"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
