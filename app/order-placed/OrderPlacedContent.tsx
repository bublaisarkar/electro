'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';

type Order = {
  _id: string;
  items: { product: { name: string; offerPrice: number }; quantity: number }[];
  amount: number;
  address: { fullName: string; area: string; city: string; state: string };
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
};

const OrderPlaced = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const [progress, setProgress] = useState(100);
  const totalDuration = 5000;
  const intervalStep = 100;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/order/${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setStatusCode(res.status);
          throw new Error(data.error || `Error ${res.status}`);
        }

        setOrder(data);
      } catch (err) {
        console.error('Order fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Could not load order details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Redirect if 404 (not found) or 403 (forbidden)
  useEffect(() => {
    if (statusCode === 404 || statusCode === 403) {
      const timer = setTimeout(() => router.push('/my-orders'), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusCode, router]);

  // Countdown and redirect (only when order is loaded)
  useEffect(() => {
    if (!order) return;

    isMounted.current = true;
    intervalRef.current = setInterval(() => {
      if (!isMounted.current) return;
      setProgress((prev) => {
        const newProgress = prev - (intervalStep / totalDuration) * 100;
        if (newProgress <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => router.push('/my-orders'), 0);
          return 0;
        }
        return newProgress;
      });
    }, intervalStep);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [order, router]);

  const handleViewOrders = () => router.push('/my-orders');
  const handleRetry = () => window.location.reload();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    const isNotFound = statusCode === 404;
    const message = isNotFound
      ? 'Order not found. Redirecting to your orders...'
      : error || 'Order not found';
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200/60 p-8 text-center">
            <p className="text-red-500">{message}</p>
            <div className="mt-4 flex flex-col gap-2">
              {!isNotFound && (
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={handleViewOrders}
                className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
              >
                Go to My Orders
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200/60 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50" />
              <CheckCircle size={72} className="text-green-500 relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Order Placed!
            </span>
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Your order has been successfully placed.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-gray-700">{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-blue-600">${order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="text-green-600 font-medium">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          <p className="text-gray-500 text-xs mb-4">
            We&apos;ll send a confirmation email to your registered email address.
          </p>

          <div className="relative w-20 h-20 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#6366f1"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 - (progress / 100) * 264}
                className="transition-all duration-100 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-500">
              {Math.ceil((progress / 100) * 5)}s
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Redirecting to your orders in a few seconds...
          </p>

          <button
            onClick={handleViewOrders}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition"
          >
            View Orders
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderPlaced;