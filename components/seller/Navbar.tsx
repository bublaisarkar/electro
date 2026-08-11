"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication state (adjust to your implementation)
    localStorage.removeItem("token"); // Example: remove token
    // If you have a logout API endpoint, call it here:
    // await fetch('/api/logout', { method: 'POST' });

    // Redirect to login page
    router.push("/login");
  };

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