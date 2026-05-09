'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ FIX hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/products?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  // ✅ Prevent SSR mismatch
  if (!mounted) {
    return (
      <nav className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          ShopHub
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            ShopHub
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 text-gray-900 rounded-l-lg"
              />
              <button
                type="submit"
                className="bg-indigo-500 px-4 py-2 rounded-r-lg"
              >
                🔍
              </button>
            </div>
          </form>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* CART */}
            <Link href="/cart" className="relative text-2xl">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* AUTH */}
            {user ? (
              <div className="relative">

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-indigo-600 px-3 py-2 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden md:block">{user.name}</span>
                  <span>▾</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">

                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Orders
                    </Link>

                    <Link
                      href="/chat"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Messages
                    </Link>

                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-indigo-600 font-medium hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-3 py-2 hover:bg-indigo-600 rounded-lg">
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-white text-indigo-700 px-3 py-2 rounded-lg font-medium"
                >
                  Register
                </Link>
              </div>
            )}

            {/* MOBILE MENU */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>

          </div>
        </div>

        {/* MOBILE SEARCH */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-gray-900 rounded-l-lg"
              />
              <button className="bg-indigo-500 px-4 py-2 rounded-r-lg">
                🔍
              </button>
            </form>
          </div>
        )}

      </div>
    </nav>
  );
}