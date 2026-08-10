"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

type Slide = {
  id: string;
  title: string;
  offer: string;
  buttonText1: string;
  buttonText2: string;
  imgSrc: string;
  gradient: string;
  ringColor: string;
  productId: string;
};

// Predefined gradient and ring color pairs for variety
const gradientOptions = [
  { gradient: "from-cyan-600 to-blue-600", ringColor: "cyan-400" },
  { gradient: "from-purple-600 to-pink-600", ringColor: "purple-400" },
  { gradient: "from-orange-600 to-red-600", ringColor: "orange-400" },
  { gradient: "from-green-600 to-teal-600", ringColor: "green-400" },
  { gradient: "from-indigo-600 to-blue-600", ringColor: "indigo-400" },
];

const HeaderSlider = () => {
  const router = useRouter();
  const { products, loading } = useAppContext();

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Build slides from top products
  useEffect(() => {
    if (loading || !products.length) return;

    // Sort by rating (desc) and take top 3
    const sorted = [...products]
      .filter((p) => p.inStock && p.image && p.image.length > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    const newSlides: Slide[] = sorted.map((product, index) => ({
      id: product._id,
      title: product.name,
      offer: `⭐ Top Rated • ${product.rating || 0}★`,
      buttonText1: "Buy now",
      buttonText2: "View Details",
      imgSrc: product.image[0] || "/placeholder.png",
      gradient: gradientOptions[index % gradientOptions.length].gradient,
      ringColor: gradientOptions[index % gradientOptions.length].ringColor,
      productId: product._id,
    }));

    setSlides(newSlides);
  }, [products, loading]);

  const totalSlides = slides.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (totalSlides === 0) return;
      setCurrentSlide((index + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const nextSlide = useCallback(
    () => goToSlide(currentSlide + 1),
    [currentSlide, goToSlide]
  );
  const prevSlide = useCallback(
    () => goToSlide(currentSlide - 1),
    [currentSlide, goToSlide]
  );

  useEffect(() => {
    if (totalSlides === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, totalSlides]);

  if (loading) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-200 animate-pulse rounded-2xl" />
    );
  }

  if (totalSlides === 0) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">No popular products available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <div className="overflow-hidden rounded-2xl shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`min-w-full bg-gradient-to-br ${slide.gradient} px-5 md:px-14 py-8 flex flex-col-reverse md:flex-row items-center justify-between gap-4 relative overflow-hidden`}
            >
              {/* Decorative blur orbs */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

              {/* Text content */}
              <div className="flex-1 text-center md:text-left z-10 text-white">
                <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    {slide.offer}
                  </span>
                  <Sparkles
                    size={14}
                    className="text-yellow-300 animate-pulse"
                  />
                </div>
                <h2 className="text-2xl md:text-[32px] font-bold leading-snug drop-shadow max-w-lg">
                  {slide.title}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                  <button
                    onClick={() => router.push(`/product/${slide.productId}`)}
                    className="px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 text-sm font-semibold rounded-full shadow transition-all transform hover:scale-105 flex items-center gap-1"
                  >
                    {slide.buttonText1}
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => router.push(`/product/${slide.productId}`)}
                    className="group flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/70 rounded-full backdrop-blur-sm hover:bg-white/10 transition"
                  >
                    {slide.buttonText2}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition"
                    />
                  </button>
                </div>
              </div>

              {/* Product Image with Tech Display Stand */}
              <div className="flex-1 flex justify-center items-center z-10">
                <div className="relative flex items-center justify-center">
                  {/* Shadow on the floor */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 md:w-56 h-4 bg-black/30 rounded-full blur-md" />

                  {/* Glass display stand */}
                  <div className="relative bg-gradient-to-b from-gray-800/60 to-gray-900/90 rounded-2xl p-3 backdrop-blur-sm border border-white/10 shadow-2xl">
                    {/* Neon ring glow */}
                    <div
                      className={`absolute -inset-1 rounded-2xl bg-${slide.ringColor}/20 blur-xl`}
                    />
                    {/* Neon ring border */}
                    <div
                      className={`absolute inset-0 rounded-2xl border-2 border-${slide.ringColor}/40`}
                    />

                    {/* Gradient overlay on product */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-white/10" />

                    {/* The product image */}
                    <Image
                      className="w-40 md:w-56 object-contain relative z-10 drop-shadow-2xl"
                      src={slide.imgSrc}
                      alt={slide.title}
                      width={400}
                      height={400}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-20 border border-white/20"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-20 border border-white/20"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-white scale-125 shadow"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;