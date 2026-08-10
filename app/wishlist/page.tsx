'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Loading from '@/components/Loading';
import { Heart } from 'lucide-react';

// ✅ Updated Product type to match ProductCard expectations
interface Product {
  _id: string;
  name: string;
  price: number;
  offerPrice: number;
  image?: string[];
  rating: number;
  inStock: boolean;
}

export default function WishlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/wishlist');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (status !== 'authenticated') return;
      try {
        const res = await fetch('/api/user/wishlist');
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={28} className="text-red-500 fill-red-500" />
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Wishlist
            </span>
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">Your wishlist is empty.</p>
            <a
              href="/all-products"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}