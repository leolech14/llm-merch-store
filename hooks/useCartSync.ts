'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { saveCartToAPI, loadCartFromAPI, clearCartFromAPI } from '@/lib/utils';

/**
 * Hook to manage cart synchronization with the API
 * Provides methods to manually trigger cart sync operations
 *
 * Usage:
 * const { syncCart, loadCart, clearCart, isSyncing } = useCartSync();
 */
export function useCartSync() {
  const { items, clearCart: clearLocalCart } = useCart();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  // Get userId from localStorage
  const getUserId = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userId') || '';
  }, []);

  // Manually trigger cart sync to API
  const syncCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn('useCartSync: No userId found');
      return false;
    }

    try {
      isSyncingRef.current = true;
      await saveCartToAPI(userId, items);
      return true;
    } catch (error) {
      console.error('useCartSync: Failed to sync cart:', error);
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [getUserId, items]);

  // Manually load cart from API (optional - restores from backup)
  const loadCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn('useCartSync: No userId found');
      return [];
    }

    try {
      isSyncingRef.current = true;
      const cartItems = await loadCartFromAPI(userId);
      return cartItems;
    } catch (error) {
      console.error('useCartSync: Failed to load cart:', error);
      return [];
    } finally {
      isSyncingRef.current = false;
    }
  }, [getUserId]);

  // Manually clear cart from API
  const clearCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn('useCartSync: No userId found');
      return false;
    }

    try {
      isSyncingRef.current = true;
      await clearCartFromAPI(userId);
      clearLocalCart();
      return true;
    } catch (error) {
      console.error('useCartSync: Failed to clear cart:', error);
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [getUserId, clearLocalCart]);

  return {
    syncCart,
    loadCart,
    clearCart,
    isSyncing: isSyncingRef.current,
  };
}
