'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200/60 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Logo & Copyright */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="QuickCart" width={100} height={32} className="w-24 md:w-28" />
          </Link>
          <div className="hidden md:block h-6 w-px bg-gray-300" />
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} QuickCart. All rights reserved.
          </p>
        </div>

        {/* Right: Social Icons with React Icons */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="p-2 bg-gray-100 hover:bg-blue-50 rounded-full text-gray-500 hover:text-blue-600 transition"
            aria-label="Facebook"
          >
            <FaFacebookF size={16} />
          </a>
          <a
            href="#"
            className="p-2 bg-gray-100 hover:bg-blue-50 rounded-full text-gray-500 hover:text-blue-600 transition"
            aria-label="Twitter"
          >
            <FaTwitter size={16} />
          </a>
          <a
            href="#"
            className="p-2 bg-gray-100 hover:bg-pink-50 rounded-full text-gray-500 hover:text-pink-600 transition"
            aria-label="Instagram"
          >
            <FaInstagram size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;