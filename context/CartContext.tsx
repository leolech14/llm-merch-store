'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  credits?: number;
  badge?: string;
  popular?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate anonymous user ID if not authenticated
const generateAnonymousId = (): string => {
  const crypto = typeof window !== 'undefined' && window.crypto
    ? window.crypto
    : { getRandomValues: (arr: Uint8Array) => arr };

  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const id = Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `anon_${id}`;
};

// Get or create user ID (authenticated session or anonymous)
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';

  const existingId = localStorage.getItem('userId');
  if (existingId) return existingId;

  const newId = generateAnonymousId();
  localStorage.setItem('userId', newId);
  return newId;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save cart to API in background
  const saveCart = async (cartItems: CartItem[]) => {
    // 1. Update localStorage immediately for instant feedback
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // 2. Sync to API in background (don't wait for response)
    try {
      const userId = getUserId();
      if (!userId) {
        console.warn('CartContext: Unable to determine user ID, skipping API sync');
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items: cartItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('CartContext: API sync failed', {
          status: response.status,
          error: errorData,
        });
      }
    } catch (error) {
      console.error('CartContext: Failed to sync cart to API:', error);
      // Cart still works via localStorage - graceful degradation
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('CartContext: Failed to parse saved cart:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage and API whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce API calls to prevent excessive requests
    syncTimeoutRef.current = setTimeout(() => {
      saveCart(items);
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, isInitialized]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    showToast('Added to cart!');
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

function showToast(message: string) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-black text-white px-6 py-3 shadow-lg z-50 animate-bounce border-2 border-white';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}
