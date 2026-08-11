"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";

const Navbar = () => {
  const router = useRouter();
  const { status } = useSession(); // session is not used, only status

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Loading state
  if (status === "loading") {
    return (
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-200 bg-white">
        <div className="w-28 lg:w-32 h-10 bg-gray-200 animate-pulse rounded" />
        <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-full" />
      </nav>
    );
  }

  // Unauthenticated – show Sign In button
  if (status === "unauthenticated") {
    return (
      <nav className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-200 bg-white">
        <Image
          onClick={() => router.push("/")}
          src="/logo.png"
          alt="Electro Store"
          width={128}
          height={40}
          className="w-28 lg:w-32 cursor-pointer"
          style={{ height: "auto" }}
          priority
        />
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
        >
          Sign In
        </button>
      </nav>
    );
  }

  // Authenticated – show logo and Logout button
  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-200 bg-white">
      <Image
        onClick={() => router.push("/")}
        src="/logo.png"
        alt="Electro Store"
        width={128}
        height={40}
        className="w-28 lg:w-32 cursor-pointer"
        style={{ height: "auto" }}
        priority
      />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  );
};

export default Navbar;