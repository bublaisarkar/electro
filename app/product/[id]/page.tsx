"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";
import { Product } from "@/context/AppContext";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { products, addToCart } = useAppContext(); // still needed for related products & cart

  const [mounted, setMounted] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mount flag to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Fetch product data directly from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProductData(data);
        setMainImage(data.image?.[0] || "");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load product";
        setError(message);
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchProduct();
    }
  }, [id, mounted]);

  // Skeleton loader before mount (matches server layout)
  if (!mounted || loading) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="px-5 lg:px-16 xl:px-20">
                <div className="rounded-lg overflow-hidden bg-gray-200 aspect-square mb-4"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-gray-200 aspect-square"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10 min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
          <button
            onClick={() => router.push("/all-products")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!productData) {
    return <Loading />;
  }

  const {
    _id,
    name,
    image,
    offerPrice,
    price,
    rating,
    numReviews,
    category,
    description,
    inStock,
    brand,
  } = productData;

  // Render stars
  const renderStars = () => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`full-${i}`} size={18} className="fill-yellow-400 text-yellow-400" />
        ))}
        {half === 1 && (
          <Star
            key="half"
            size={18}
            className="fill-yellow-400 text-yellow-400"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`empty-${i}`} size={18} className="text-gray-300" />
        ))}
      </>
    );
  };

  const handleAddToCart = () => addToCart(_id);
  const handleBuyNow = () => {
    addToCart(_id);
    router.push("/cart");
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left: Images */}
          <div className="px-5 lg:px-16 xl:px-20">
            {/* Main image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              <Image
                src={mainImage}
                alt={name}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {image.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 transition border-2 ${
                    mainImage === img ? "border-blue-600" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${name} ${idx + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">{name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">{renderStars()}</div>
              <span className="text-sm text-gray-500">({numReviews})</span>
            </div>
            <p className="text-gray-600 mt-3">{description}</p>
            <p className="text-3xl font-medium mt-6">
              ${offerPrice}
              {price > offerPrice && (
                <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                  ${price}
                </span>
              )}
            </p>
            <hr className="bg-gray-600 my-6" />
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72">
                <tbody>
                  <tr>
                    <td className="text-gray-600 font-medium">Brand</td>
                    <td className="text-gray-800/50">{brand || "Generic"}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Color</td>
                    <td className="text-gray-800/50">Multi</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 font-medium">Category</td>
                    <td className="text-gray-800/50 capitalize">{category}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full py-3.5 bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-4 mt-16">
            <p className="text-3xl font-medium">
              Featured <span className="font-medium text-blue-600">Products</span>
            </p>
            <div className="w-28 h-0.5 bg-blue-600 mt-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
            {products
              .filter((p) => p._id !== _id)
              .slice(0, 5)
              .map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
          <button
            onClick={() => router.push("/all-products")}
            className="px-8 py-2 mb-16 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            See more
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;