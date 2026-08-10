'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';

type Promo = {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
};

const PromosPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/promo');
      if (!res.ok) throw new Error('Failed to fetch promo codes');
      const data = await res.json();
      setPromos(data);
    } catch (error) {
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPromos();
    }
  }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/promo/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Promo code deleted');
      await fetchPromos();
    } catch (error) {
      toast.error('Failed to delete promo code');
    } finally {
      setDeleting(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  if (loading) return <Loading />;

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Promo Codes</h2>
        <button
          onClick={() => router.push('/seller/promos/create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No promo codes created yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="text-left bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Discount</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Min Order</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Valid</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Used</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm font-mono font-medium">
                    <button
                      onClick={() => copyCode(promo.code)}
                      className="flex items-center gap-2 hover:text-blue-600"
                    >
                      {promo.code}
                      <Copy size={14} className="text-gray-400" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                    {promo.maxDiscount && promo.discountType === 'percentage' && ` (max $${promo.maxDiscount})`}
                  </td>
                  <td className="px-4 py-3 text-sm">${promo.minOrderAmount || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(promo.validFrom).toLocaleDateString()} – {new Date(promo.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{promo.usedCount}/{promo.usageLimit}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promo.active && new Date(promo.validUntil) >= new Date()
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {promo.active && new Date(promo.validUntil) >= new Date() ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/seller/promos/edit/${promo._id}`)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(promo._id)}
                        disabled={deleting === promo._id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
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
      )}
    </div>
  );
};

export default PromosPage;