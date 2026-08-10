"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import ProductCard from "./ProductCard";
import { ChevronRight } from "lucide-react";

const HomeProducts = () => {
  const { products, router, loading } = useAppContext();

  // Sort products by rating (descending) and take top 8
  const popularProducts = React.useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .filter((p) => p.inStock && p.image && p.image.length > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8);
  }, [products]);

  // Show loading skeleton
  if (loading) {
    return (
      <section className="w-full py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (popularProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10">
      {/* Section header with "See all" link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔥 Popular Products</h2>
        <button
          onClick={() => router.push("/all-products")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
        >
          See all
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {popularProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* "View All" button */}
      {products.length > 8 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2.5 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View All Products
          </button>
        </div>
      )}
    </section>
  );
};

export default HomeProducts;