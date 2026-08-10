'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, Tag, FolderTree } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seller/product-list', label: 'Products', icon: Package },
    { href: '/seller/add-product', label: 'Add Product', icon: PlusCircle },
    { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/seller/promos', label: 'Promo Codes', icon: Tag },
    { href: '/seller/categories', label: 'Categories', icon: FolderTree }, // ✅ Added
  ];

  return (
    <aside className="w-16 md:w-64 border-r border-gray-200 min-h-[calc(100vh-72px)] bg-white flex flex-col py-3 flex-shrink-0">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname?.startsWith(href + '/');
        return (
          <Link key={href} href={href} className="block">
            <div
              className={`flex items-center py-3 px-4 gap-3 transition ${
                isActive
                  ? 'border-r-4 md:border-r-[6px] border-blue-600 bg-blue-50/80 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <p className="hidden md:block text-sm font-medium">{label}</p>
            </div>
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;