"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { MdPhone, MdEmail } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="bg-gray-50/80 border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12 md:py-16">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Image
              src="/logo.png"
              alt="Electro Store"
              className="w-28 md:w-32 cursor-pointer"
              onClick={() => router.push("/")}
              width={128}
              height={40}
            />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Your one‑stop shop for the latest electronics, gadgets, and tech
              accessories.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                aria-label="YouTube"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-blue-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-500 hover:text-blue-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-blue-600 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-blue-600 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-blue-600 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-500 hover:text-blue-600 transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-500 hover:text-blue-600 transition">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-blue-600 transition">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-3">
                <span className="p-1.5 bg-blue-50 rounded-full text-blue-600">
                  <MdPhone size={16} />
                </span>
                <span>+1-234-567-890</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="p-1.5 bg-blue-50 rounded-full text-blue-600">
                  <MdEmail size={16} />
                </span>
                <span>freshcarts.customer@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="p-1.5 bg-blue-50 rounded-full text-blue-600 mt-0.5">
                  <FiMapPin size={16} />
                </span>
                <span className="text-xs text-gray-400">
                  123 Tech Street, Silicon Valley, CA 94000
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200/60 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Electro. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link href="/terms" className="hover:text-blue-600 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-blue-600 transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;