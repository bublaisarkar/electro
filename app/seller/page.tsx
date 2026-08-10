'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, DollarSign, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Loading from '@/components/Loading';

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: any[];
  orderStatusCounts: {
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
};

const SellerDashboard = () => {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/seller');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (sessionStatus !== 'authenticated') return;
      try {
        setLoading(true);
        const res = await fetch('/api/seller/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError('Could not load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [sessionStatus]);

  if (sessionStatus === 'loading' || loading) {
    return <Loading />;
  }

  if (sessionStatus === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return <Loading />;
  }

  const statusIcons = {
    pending: Clock,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-50',
    shipped: 'text-blue-600 bg-blue-50',
    delivered: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(stats.orderStatusCounts).map(([status, count]) => {
            const Icon = statusIcons[status as keyof typeof statusIcons];
            const colorClass = statusColors[status as keyof typeof statusColors];
            return (
              <div key={status} className={`p-4 rounded-lg ${colorClass}`}>
                <div className="flex items-center gap-2">
                  <Icon size={18} />
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-3 px-2 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-2">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-2 font-medium">${order.amount.toFixed(2)}</td>
                    <td className="py-3 px-2 capitalize">{order.status}</td>
                    <td className="py-3 px-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-right">
          <button
            onClick={() => router.push('/seller/orders')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all orders →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;