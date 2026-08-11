"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  User,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Heart, // ✅ added Heart
} from "lucide-react";

export default function UserButton() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  if (status === "unauthenticated") {
    return (
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
      >
        Sign In
      </button>
    );
  }

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  const user = session?.user;
  const avatarUrl = user?.image || "/default-avatar.png";
  // ✅ Use type assertion with a specific shape
  const userWithRoles = user as { isSeller?: boolean; isAdmin?: boolean };
  const canAccessSeller = userWithRoles?.isSeller || userWithRoles?.isAdmin || false;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="relative w-8 h-8 rounded-full border-2 border-gray-200 overflow-hidden">
          <Image
            src={avatarUrl}
            alt={user?.name || "User"}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
        <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <User size={16} /> My Profile
            </Link>
            <Link
              href="/my-orders"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <ShoppingBag size={16} /> My Orders
            </Link>
            {/* ✅ Wishlist link added here */}
            <Link
              href="/wishlist"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Heart size={16} /> Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <ShoppingCart size={16} /> Cart
            </Link>

            {canAccessSeller && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <Link
                  href="/seller"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                >
                  <LayoutDashboard size={16} /> Seller Dashboard
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}