"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import { Search, ShoppingCart, Menu, X, LayoutDashboard } from "lucide-react";
import UserButton from "@/components/UserButton";

const Navbar = () => {
  const { router, getCartCount } = useAppContext();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const cartCount = getCartCount();

  // Type assertion to include isSeller and isAdmin
  const user = session?.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isSeller?: boolean;
    isAdmin?: boolean;
  };

  const canAccessSeller = user?.isSeller === true || user?.isAdmin === true;

  useEffect(() => {
    // This effect runs once after mount to prevent hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      closeMobileMenu();
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 w-28 md:w-32 lg:w-36">
              <div className="relative aspect-[4/1]">
                <Image
                  onClick={() => router.push("/")}
                  src="/logo.png"
                  alt="Electro Store"
                  width={160}
                  height={40}
                  className="cursor-pointer w-28 md:w-32 lg:w-36"
                  style={{ height: "auto" }}
                  priority
                />
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700 ml-8 lg:ml-12">
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/all-products"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Contact
              </Link>
              {canAccessSeller && (
                <button
                  onClick={() => router.push("/seller")}
                  className="text-xs border border-blue-500 text-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors duration-200 flex items-center gap-1"
                >
                  <LayoutDashboard size={14} />
                  Seller Dashboard
                </button>
              )}
            </div>

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="hidden md:block">
                <UserButton />
              </div>

              {/* Cart with badge */}
              <Link
                href="/cart"
                className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart size={24} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile side drawer – FIXED: added overflow-y-auto to inner container */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full p-6 overflow-y-auto"> {/* ← overflow-y-auto added here */}
              <button
                onClick={closeMobileMenu}
                className="self-end p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <form onSubmit={handleSearch} className="mt-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              <div className="flex flex-col space-y-4 text-gray-700 font-medium">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="hover:text-blue-600 py-2 border-b border-gray-100"
                >
                  Home
                </Link>
                <Link
                  href="/all-products"
                  onClick={closeMobileMenu}
                  className="hover:text-blue-600 py-2 border-b border-gray-100"
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="hover:text-blue-600 py-2 border-b border-gray-100"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className="hover:text-blue-600 py-2 border-b border-gray-100"
                >
                  Contact
                </Link>
                {canAccessSeller && (
                  <button
                    onClick={() => {
                      router.push("/seller");
                      closeMobileMenu();
                    }}
                    className="text-left text-blue-600 font-semibold py-2 border-b border-gray-100 flex items-center gap-2"
                  >
                    <LayoutDashboard size={18} />
                    Seller Dashboard
                  </button>
                )}
                <div className="py-2 border-b border-gray-100">
                  <UserButton />
                </div>
                <Link
                  href="/cart"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 py-2"
                >
                  <ShoppingCart size={20} />
                  <span>Cart ({cartCount})</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;