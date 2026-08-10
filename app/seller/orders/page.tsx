'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

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
  user: {
    name: string;
    email: string;
  };
};

const Orders = () => {
  const { currency } = useAppContext();
  const { status: sessionStatus } = useSession(); // ✅ only destructure status
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not seller
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/seller/orders');
    }
  }, [sessionStatus, router]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/order/seller');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Could not load orders. Please try again.');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdating(orderId);
      const res = await fetch(`/api/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Update status error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const map = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      shipped: { color: 'bg-blue-100 text-blue-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const { color, icon: Icon } = map[status];
    return { color, Icon };
  };

  if (sessionStatus === 'loading') {
    return <Loading />;
  }

  if (sessionStatus === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="md:p-10 p-4 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="md:p-10 p-4 text-center">
          <Package size={48} className="mx-auto text-gray-300" />
          <p className="mt-4 text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="md:p-10 p-4 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Orders ({orders.length})</h2>
            <button
              onClick={fetchOrders}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const { color, Icon } = getStatusBadge(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition p-5"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Left: Order items */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {order.items.map((item, idx) => (
                              <span key={idx}>
                                {item.product.name} × {item.quantity}
                                {idx < order.items.length - 1 && ', '}
                              </span>
                            ))}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Order #{order._id.slice(-8).toUpperCase()} •{' '}
                            {order.items.length} item(s)
                          </p>
                          <p className="text-xs text-gray-500">
                            Customer: {order.user?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="text-xs text-gray-600 flex-1">
                      <p className="font-medium">{order.address.fullName}</p>
                      <p>{order.address.area}</p>
                      <p>{order.address.city}, {order.address.state}</p>
                      <p>{order.address.phoneNumber}</p>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex-1 flex flex-col items-start md:items-end gap-2">
                      <p className="text-lg font-bold text-blue-600">
                        {currency}{order.amount.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} flex items-center gap-1`}>
                          <Icon size={12} />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-400 flex flex-col items-end gap-0.5">
                        <span>{order.paymentMethod}</span>
                        <span>{new Date(order.date).toLocaleDateString('en-US')}</span>
                      </div>

                      {/* Status update dropdown */}
                      <div className="mt-2 w-full">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value as Order['status'])}
                          disabled={updating === order._id}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;