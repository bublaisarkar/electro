'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext, Product } from '@/context/AppContext';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';
import OrderSummary from '@/components/OrderSummary';
import Loading from '@/components/Loading';

type CartItem = { product: Product; quantity: number };

const Cart = () => {
  const { products, cartItems, addToCart, updateCartQuantity, getCartCount, loading, setCartItems } =
    useAppContext();
  const [mounted, setMounted] = useState(false);

  // ✅ On mount, ensure context matches localStorage
  useEffect(() => {
    setMounted(true);
    // If cartItems is empty but localStorage has data, sync context
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved && Object.keys(cartItems).length === 0) {
        try {
          const parsed = JSON.parse(saved);
          if (Object.keys(parsed).length > 0) {
            setCartItems(parsed);
          }
        } catch (_) {
          // ignore
        }
      }
    }
  }, []);

  const totalItems = mounted ? getCartCount() : 0;

  const cartItemsList: CartItem[] = mounted && !loading
    ? Object.keys(cartItems)
        .map((id) => {
          const product = products.find((p) => p._id === id);
          if (!product || cartItems[id] <= 0) return null;
          return { product, quantity: cartItems[id] };
        })
        .filter((item): item is CartItem => item !== null)
    : [];

  // If cart is empty after mount, ensure localStorage is cleared
  useEffect(() => {
    if (mounted && totalItems === 0 && typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Object.keys(parsed).length > 0) {
            localStorage.removeItem('cart');
          }
        } catch (_) {
          // ignore
        }
      }
    }
  }, [mounted, totalItems]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            {!mounted || loading ? (
              <Loading />
            ) : totalItems === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-500 mt-2">Looks like you haven&apos;t added anything yet.</p>
                <Link
                  href="/all-products"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <ChevronLeft size={18} />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Your Cart
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <th className="pb-3 pl-0 pr-4">Product</th>
                        <th className="pb-3 px-4">Price</th>
                        <th className="pb-3 px-4">Qty</th>
                        <th className="pb-3 px-4">Subtotal</th>
                        <th className="pb-3 pr-0 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItemsList.map(({ product, quantity }) => (
                        <tr key={product._id} className="border-b border-gray-100 last:border-0">
                          <td className="py-4 pl-0 pr-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={product.image?.[0] || '/placeholder.png'}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-800 line-clamp-1">
                                  {product.name}
                                </p>
                                <button
                                  onClick={() => updateCartQuantity(product._id, 0)}
                                  className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">${product.offerPrice}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(product._id, quantity - 1)}
                                className="p-1 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition"
                              >
                                <Minus size={14} className="text-gray-600" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {quantity}
                              </span>
                              <button
                                onClick={() => addToCart(product._id)}
                                className="p-1 rounded-full border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition"
                              >
                                <Plus size={14} className="text-gray-600" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium">
                            ${(product.offerPrice * quantity).toFixed(2)}
                          </td>
                          <td className="py-4 pr-0 text-right">
                            <button
                              onClick={() => updateCartQuantity(product._id, 0)}
                              className="p-1 text-gray-400 hover:text-red-500 transition"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6">
                  <Link
                    href="/all-products"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
                  >
                    <ChevronLeft size={16} />
                    Continue Shopping
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <OrderSummary />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;