'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { ChevronDown, Plus, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

type Address = {
  _id: string;
  fullName: string;
  phoneNumber: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type PaymentVerificationRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
};

type AppliedPromo = {
  code: string;
  discount: number;
  promoId: string;
};

type OrderPayload = {
  items: { productId: string; quantity: number }[];
  addressId: string;
  paymentMethod: string;
  promoCode?: string;
  discount?: number;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    cartItems,
    products,
    setCartItems, // ✅ added
  } = useAppContext();
  const { data: session, status } = useSession();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (status !== 'authenticated') {
        setLoadingAddresses(false);
        return;
      }

      try {
        const res = await fetch('/api/address');
        if (!res.ok) throw new Error('Failed to fetch addresses');
        const data = await res.json();
        setUserAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0]);
        }
      } catch (_error) {
        console.error('Failed to load addresses:', _error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [status]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.querySelector('#razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Apply promo code
  const applyPromo = async () => {
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoCode('');
      toast.success('Promo code removed');
      return;
    }

    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    try {
      const subtotal = getCartAmount();
      const res = await fetch('/api/promo/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: subtotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid promo code');
        return;
      }

      setAppliedPromo({
        code: data.code,
        discount: data.discount,
        promoId: data.promoId,
      });
      toast.success(`Promo code applied! You saved $${data.discount.toFixed(2)}`);
      setPromoCode('');
    } catch {
      toast.error('Failed to apply promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  // ─── Core: create order ────────────────────────────────────────
  const createOrder = async () => {
    if (!selectedAddress) return;
    if (getCartCount() === 0) {
      alert('Your cart is empty.');
      return;
    }

    setCreatingOrder(true);

    try {
      // 1. Build order items
      const orderItems = Object.keys(cartItems)
        .map((id) => {
          const product = products.find((p) => p._id === id);
          if (!product || cartItems[id] <= 0) return null;
          return {
            productId: id,
            quantity: cartItems[id],
          };
        })
        .filter((item) => item !== null);

      if (orderItems.length === 0) {
        alert('Your cart is empty.');
        setCreatingOrder(false);
        return;
      }

      // 2. Prepare order payload with promo
      const orderPayload: OrderPayload = {
        items: orderItems,
        addressId: selectedAddress._id,
        paymentMethod: 'Razorpay',
      };
      if (appliedPromo) {
        orderPayload.promoCode = appliedPromo.code;
        orderPayload.discount = appliedPromo.discount;
      }

      // 3. Create order
      const orderRes = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      const orderId = orderData._id;
      const orderAmount = orderData.amount;
      const paymentStatus = orderData.paymentStatus;

      // ─── Helper: clear cart and redirect ──────────────────────
      const clearCartAndRedirect = () => {
        localStorage.removeItem('cart');   // clear local storage
        setCartItems({});                 // clear React context state
        router.push(`/order-placed?orderId=${orderId}`);
        setCreatingOrder(false);
      };

      // 4. If free order (paid or zero amount), skip Razorpay
      const isFreeOrder = Math.abs(orderAmount) < 0.01 || paymentStatus === 'Paid';
      if (isFreeOrder) {
        clearCartAndRedirect();
        return;
      }

      // 5. Proceed with Razorpay
      const razorpayRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const razorpayData = await razorpayRes.json();
      if (!razorpayRes.ok) {
        if (razorpayData.error?.includes('already paid')) {
          clearCartAndRedirect();
          return;
        }
        throw new Error(razorpayData.error || 'Failed to create payment');
      }

      // 6. Load Razorpay script and open checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const options: RazorpayOptions = {
        key: razorpayData.key,
        amount: razorpayData.amount * 100,
        currency: razorpayData.currency,
        name: 'Electro Store',
        description: `Order #${orderId}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyPayload: PaymentVerificationRequest = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            };

            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyPayload),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

            // Clear cart and redirect
            localStorage.removeItem('cart');
            setCartItems({});
            router.push(`/order-placed?orderId=${orderId}`);
          } catch (error) {
            const err = error as Error;
            alert(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => setCreatingOrder(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const err = error as Error;
      console.error('Order creation failed:', err);
      alert(err.message || 'Failed to place order. Please try again.');
      setCreatingOrder(false);
    }
  };

  // ─── Totals ─────────────────────────────────────────────────────
  const subtotal = getCartAmount();
  const discount = appliedPromo?.discount || 0;
  const tax = (subtotal - discount) * 0.02;
  const total = subtotal - discount + tax;

  // ─── UI ────────────────────────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200/60 sticky top-24">
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
        <hr className="border-gray-200 my-4" />
        <p className="text-sm text-gray-600 mb-4">Please sign in to proceed.</p>
        <button
          onClick={() =>
            router.push(
              `/auth/signin?callbackUrl=${encodeURIComponent(
                window.location.pathname
              )}`
            )
          }
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (status === 'loading' || loadingAddresses) {
    return (
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200/60 sticky top-24">
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
        <hr className="border-gray-200 my-4" />
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200/60 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
      <hr className="border-gray-200 my-4" />

      {/* Address Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Select Address
        </label>
        <div className="relative">
          <button
            className="w-full text-left px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-sm text-gray-700 truncate">
              {selectedAddress
                ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                : userAddresses.length > 0
                ? 'Select Address'
                : 'No addresses saved'}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isDropdownOpen && (
            <ul className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-auto py-1">
              {userAddresses.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-500">
                  No addresses saved.
                </li>
              ) : (
                userAddresses.map((addr) => (
                  <li
                    key={addr._id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    onClick={() => handleAddressSelect(addr)}
                  >
                    {addr.fullName}, {addr.area}, {addr.city}, {addr.state}
                  </li>
                ))
              )}
              <li
                onClick={() => router.push('/add-address')}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-blue-600 font-medium flex items-center gap-1 border-t border-gray-100"
              >
                <Plus size={16} /> Add New Address
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Promo Code
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={appliedPromo ? `Applied: ${appliedPromo.code}` : 'Enter code'}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={!!appliedPromo}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm disabled:bg-gray-100"
            />
          </div>
          <button
            onClick={applyPromo}
            disabled={applyingPromo || (!promoCode.trim() && !appliedPromo)}
            className={`px-6 py-2.5 text-white text-sm font-medium rounded-lg transition whitespace-nowrap ${
              appliedPromo
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {appliedPromo ? 'Remove' : applyingPromo ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {appliedPromo && (
          <p className="text-xs text-green-600 mt-1">
            ✅ ${appliedPromo.discount.toFixed(2)} discount applied
          </p>
        )}
      </div>

      <hr className="border-gray-200 my-4" />

      {/* Totals */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            {currency}
            {subtotal.toFixed(2)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{currency}{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (2%)</span>
          <span className="font-medium">
            {currency}
            {tax.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-blue-600">
            {currency}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={
          !selectedAddress ||
          userAddresses.length === 0 ||
          creatingOrder ||
          getCartCount() === 0
        }
        className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {creatingOrder ? 'Processing...' : 'Place Order'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        By placing your order, you agree to our Terms & Conditions.
      </p>
    </div>
  );
};

export default OrderSummary;