'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  mounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart AFTER hydration
  useEffect(() => {
    const stored = localStorage.getItem('cart');

    if (stored) {
      setCartItems(JSON.parse(stored));
    }

    setMounted(true);
  }, []);

  // Save cart whenever it changes
  useEffect(() => { 
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);

      if (existing) {
        return prev.map((i) =>
          i._id === item._id
            ? {
                ...i,
                qty: Math.min(i.qty + item.qty, item.stock),
              }
            : i
        );
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const totalItems = cartItems.reduce((acc, i) => acc + i.qty, 0);

  const totalPrice = cartItems.reduce(
    (acc, i) => acc + i.price * i.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        totalPrice,
        mounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }

  return ctx;
};