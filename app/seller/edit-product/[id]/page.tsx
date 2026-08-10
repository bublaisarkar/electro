'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, X } from 'lucide-react';
import { useAppContext, Product } from '@/context/AppContext'; // ✅ updated import
import Loading from '@/components/Loading';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import toast from 'react-hot-toast';

type Category = {
  _id: string;
  name: string;
};

const EditProduct = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { refetchProducts } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Could not load categories. Please refresh.');
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
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
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setProductData(data);
        setName(data.name);
        setDescription(data.description || '');
        setCategory(data.category);
        setPrice(data.price.toString());
        setOfferPrice(data.offerPrice.toString());
        setImageUrls(data.image || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageUrls.length === 0) {
      toast.error('Please add at least one product image.');
      return;
    }

    if (!category) {
      toast.error('Please select a category.');
      return;
    }

    const updatedProduct = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      image: imageUrls,
      inStock: productData?.inStock ?? true,
      rating: productData?.rating ?? 0,
      numReviews: productData?.numReviews ?? 0,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      toast.success('Product updated successfully!');
      await refetchProducts();
      router.push('/seller/product-list');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = (urls: string[]) => {
    setImageUrls((prev) => [...prev, ...urls]);
  };

  if (loading || categoriesLoading) {
    return <Loading />;
  }

  if (error || !productData) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <p className="text-red-500">{error || 'Product not found.'}</p>
        <button
          onClick={() => router.push('/seller/product-list')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Product
            </span>
          </h1>
          <div className="mt-1 h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 md:p-8">
        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images <span className="text-xs text-gray-400">(up to 4)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {imageUrls.length < 4 && (
              <div className="relative aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition overflow-hidden">
                <CloudinaryUpload
                  onUpload={handleUpload}
                  multiple={true}
                  maxFiles={4 - imageUrls.length}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-gray-400 text-sm">Upload</span>
                  </div>
                </CloudinaryUpload>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Upload a new image to add it. Remove existing images by clicking the X.
          </p>
        </div>

        {/* Product Name */}
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="e.g. Wireless Headphones Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Describe your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-y"
            required
          />
        </div>

        {/* Category, Price, Offer Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            {categories.length === 0 ? (
              <div className="w-full px-4 py-2.5 border border-red-300 rounded-lg text-red-500 text-sm">
                No categories found. Please add one first.
              </div>
            ) : (
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label htmlFor="offer-price" className="block text-sm font-medium text-gray-700 mb-1">
              Offer Price ($)
            </label>
            <input
              id="offer-price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || categories.length === 0}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;