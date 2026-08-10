"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { ArrowRight, Star } from "lucide-react";

const Banner = () => {
  const router = useRouter();
  const { products, loading } = useAppContext();

  // Get the most popular product (by rating, or you can change the logic)
  const popularProduct = React.useMemo(() => {
    if (!products.length) return null;
    return [...products]
      .filter((p) => p.inStock && p.image && p.image.length > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 1)[0];
  }, [products]);

  if (loading) {
    return (
      <section className="w-full py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 md:h-80 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (!popularProduct) {
    return null; // or show a fallback banner
  }

  return (
    <section className="w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          onClick={() => router.push(`/product/${popularProduct._id}`)}
          className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100/80 cursor-pointer group"
        >
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-10 lg:p-12">
            {/* Left Image: Product image */}
            <div className="w-40 md:w-48 lg:w-56 flex-shrink-0 mb-6 md:mb-0">
              <Image
                src={popularProduct.image[0] || '/placeholder.png'}
                alt={popularProduct.name}
                width={300}
                height={300}
                className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Center Text */}
            <div className="flex-1 text-center md:text-left px-2 md:px-6">
              <span className="inline-block text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full mb-3">
                ⭐ Best Seller
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {popularProduct.name}
                </span>
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto md:mx-0 line-clamp-2">
                {popularProduct.description || 'Top-rated product with excellent reviews.'}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(popularProduct.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({popularProduct.numReviews || 0})</span>
              </div>
              <button className="group mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all">
                Shop Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Image: Another angle or just use the same product image */}
            <div className="hidden md:block w-44 lg:w-52 flex-shrink-0">
              <Image
                src={popularProduct.image[1] || popularProduct.image[0] || '/placeholder.png'}
                alt={popularProduct.name}
                width={350}
                height={350}
                className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Mobile: Second image below text */}
            <div className="md:hidden w-40 mt-4">
              <Image
                src={popularProduct.image[1] || popularProduct.image[0] || '/placeholder.png'}
                alt={popularProduct.name}
                width={200}
                height={200}
                className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Subtle decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>
      </div>
    </section>
  );
};

export default Banner;