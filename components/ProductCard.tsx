"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingBag, Plus } from "lucide-react";
import toast from "react-hot-toast";

// ✅ Define Product interface locally (or import from a shared types file)
interface Product {
  _id: string;
  name: string;
  image?: string[];
  rating: number;
  offerPrice: number;
  price: number;
  inStock: boolean;
  // ... other fields as needed
}

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { currency, addToCart } = useAppContext();
  // ✅ Only take status – session is not needed
  const { status } = useSession();
  const router = useRouter();

  const { _id, name, image, rating, offerPrice, price, inStock } = product;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const imageSrc =
    Array.isArray(image) && image.length > 0
      ? image[0]
      : "/placeholder.png";

  // Fetch wishlist status on mount (only if authenticated)
  useEffect(() => {
    const fetchWishlist = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/user/wishlist");
        if (!res.ok) throw new Error("Failed to fetch wishlist");
        const data = (await res.json()) as Product[];
        // ✅ No 'any' – the data is typed as Product[]
        setIsWishlisted(data.some((p) => p._id === _id));
      } catch {
        // Silent fail – wishlist is non‑critical; we can log if needed
        // console.error(error);
      }
    };
    fetchWishlist();
  }, [_id, status]);

  // Render stars
  const renderStars = () => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={14}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
        {half === 1 && (
          <Star
            key="half"
            size={14}
            className="fill-yellow-400 text-yellow-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
      </>
    );
  };

  const handleCardClick = () => {
    router.push(`/product/${_id}`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (status !== "authenticated") {
      toast.error("Please sign in to add to wishlist");
      router.push(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (loadingWishlist) return;

    setLoadingWishlist(true);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: _id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update wishlist");
      }

      const data = await res.json();
      setIsWishlisted(data.action === "added");
      toast.success(
        data.action === "added" ? "Added to wishlist" : "Removed from wishlist"
      );
    } catch (err) {
      // ✅ Proper error handling without 'any'
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addToCart(_id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 800);
  };

  const isOnSale = price > offerPrice;

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-200"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!inStock && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              SOLD OUT
            </span>
          )}
          {isOnSale && inStock && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              SALE
            </span>
          )}
        </div>
        {/* Wishlist Heart */}
        <button
          onClick={handleWishlist}
          disabled={loadingWishlist}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition z-10 disabled:opacity-50"
        >
          <Heart
            size={18}
            className={`transition-colors ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500 hover:text-red-400"
            }`}
          />
        </button>

        {/* Quick Add overlay */}
        {inStock && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
            <button
              onClick={handleAddToCart}
              className="px-5 py-1.5 bg-white/90 hover:bg-white text-blue-600 font-medium text-sm rounded-full shadow-lg flex items-center gap-1.5 transition hover:scale-105"
            >
              <Plus size={16} />
              Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <span className="text-xs text-gray-500 ml-0.5">({rating})</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {currency}
              {offerPrice}
            </span>
            {isOnSale && (
              <span className="text-xs text-gray-400 line-through">
                {currency}
                {price}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`p-2 rounded-full transition-all duration-300 ${
              inStock
                ? isAdded
                  ? "bg-green-500 text-white scale-110"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={18} />
          </button>
        </div>

        {/* Full-width Add to Cart (mobile) */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed md:hidden"
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;