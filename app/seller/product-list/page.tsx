'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Product } from '@/assets/assets';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

const ProductList = () => {
  const router = useRouter();
  const { refetchProducts } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setDeleting(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      // Remove from local state
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      // Optionally refresh the context product list
      await refetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">All Products</h2>
            <button
              onClick={() => router.push('/seller/add-product')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              Add New
            </button>
          </div>
          <div className="flex flex-col items-center max-w-5xl w-full overflow-x-auto rounded-md bg-white border border-gray-200/60 shadow-sm">
            <table className="w-full min-w-[600px]">
              <thead className="text-gray-900 text-sm text-left border-b border-gray-200">
                <tr>
                  <th className="w-2/5 px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="bg-gray-50 rounded p-1.5 flex-shrink-0">
                        <Image
                          src={product.image?.[0] || '/placeholder.png'}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <span className="truncate font-medium text-gray-800">
                        {product.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden capitalize">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${product.offerPrice}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {/* View (storefront) */}
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View on store"
                        >
                          <Eye size={16} />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => router.push(`/seller/edit-product/${product._id}`)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;