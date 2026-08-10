'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from '@/context/AppContext';
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react';
import Loading from '@/components/Loading';

type OrderItem = {
  product: {
    _id: string;
    name: string;
    image: string[];
    price: number;
    offerPrice: number;
  };
  quantity: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  amount: number;
  address: {
    fullName: string;
    area: string;
    city: string;
    state: string;
    phoneNumber: string;
  };
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
};

const MyOrders = () => {
  const { currency } = useAppContext();
  const { status: sessionStatus } = useSession(); // ✅ only destructure what we need
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusInfo = (status: Order['status']) => {
    const map = {
      pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      shipped: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
      delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      cancelled: { icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
    };
    return map[status];
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-orders');
    }
  }, [sessionStatus, router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionStatus !== 'authenticated') return;

      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/order');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError('Could not load your orders. Please try again later.');
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [sessionStatus]);

  // Show loading while checking auth
  if (sessionStatus === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (sessionStatus === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
        <div className="flex flex-col">
          <div className="flex flex-col items-start mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Orders
              </span>
            </h1>
            <div className="mt-1 h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">You haven&apos;t placed any orders yet.</p>
              <a
                href="/all-products"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left: Order items summary */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Package size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {order.items.map((item, idx) => (
                                <span key={idx}>
                                  {item.product.name} × {item.quantity}
                                  {idx < order.items.length - 1 && ', '}
                                </span>
                              ))}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Center: Address */}
                      <div className="md:border-l md:border-gray-200 md:pl-6 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{order.address.fullName}</span>
                          <br />
                          {order.address.area}
                          <br />
                          {order.address.city}, {order.address.state}
                          <br />
                          {order.address.phoneNumber}
                        </p>
                      </div>

                      {/* Right: Amount & Status */}
                      <div className="md:border-l md:border-gray-200 md:pl-6 flex-1 flex flex-col items-start md:items-end">
                        <p className="text-xl font-bold text-blue-600">
                          {currency}
                          {order.amount.toFixed(2)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                            <StatusIcon size={14} />
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400 flex flex-col items-start md:items-end gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.date).toLocaleDateString('en-US')}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard size={14} />
                            {order.paymentMethod}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.paymentStatus || 'Pending'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MyOrders;