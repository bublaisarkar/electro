'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ─── Types (moved here, no external dependency) ───
export type Product = {
  _id: string;
  name: string;
  description: string;
  brand?: string;
  category: string;
  price: number;
  offerPrice: number;
  image: string[];         // array of Cloudinary URLs
  rating: number;
  numReviews: number;
  inStock: boolean;
  sellerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isSeller: boolean;
  isAdmin?: boolean;
};

// ─── Cart types ───
type CartItems = Record<string, number>;

// ─── Context type ───
type AppContextType = {
  currency: string;
  router: ReturnType<typeof useRouter>;
  isSeller: boolean;
  setIsSeller: (val: boolean) => void;
  userData: User | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  refetchProducts: () => Promise<void>;
  cartItems: CartItems;
  setCartItems: (items: CartItems) => void;
  addToCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  getCartCount: () => number;
  getCartAmount: () => number;
};

// ─── Context ───
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppContextProvider');
  return ctx;
};

// ─── Provider ───
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'USD';
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User data from session – typed with the expected shape
  const user = session?.user as {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isSeller?: boolean;
    isAdmin?: boolean;
  } | undefined;

  const [userData, setUserData] = useState<User | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);

  // Update user info when session changes
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserData({
        id: user.id || '',
        name: user.name || '',
        email: user.email || '',
        avatar: user.image || '',
        isSeller: user.isSeller || false,
        isAdmin: user.isAdmin || false,
      });
      setIsSeller(user.isSeller || false);
    } else {
      setUserData(null);
      setIsSeller(false);
    }
  }, [user]);

  // Cart persisted in localStorage
  const [cartItems, setCartItems] = useState<CartItems>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          return JSON.parse(saved) as CartItems;
        } catch {
          // ignore
        }
      }
    }
    return {};
  });

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ─── Fetch products from API ───
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Could not load products.');
      setProducts([]); // no fallback
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const refetchProducts = async () => {
    await fetchProducts();
  };

  // ─── Cart actions ───
  const addToCart = (itemId: string) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      newCart[itemId] = (newCart[itemId] || 0) + 1;
      return newCart;
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (quantity <= 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = quantity;
      }
      return newCart;
    });
  };

  const getCartCount = (): number => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const getCartAmount = (): number => {
    let total = 0;
    for (const [id, qty] of Object.entries(cartItems)) {
      if (qty <= 0) continue;
      const product = products.find((p) => p._id === id);
      if (product) {
        total += product.offerPrice * qty;
      }
    }
    return Math.floor(total * 100) / 100;
  };

  const value: AppContextType = {
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    products,
    loading,
    error,
    refetchProducts,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};