import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cart API utilities for syncing with Vercel KV backend
 */

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  credits?: number;
  badge?: string;
  popular?: boolean;
  quantity: number;
}

interface CartResponse {
  success: boolean;
  message?: string;
  items?: CartItem[];
  updatedAt?: string;
  error?: string;
}

/**
 * Save cart to API backend
 * @param userId - The user's ID (authenticated or anonymous)
 * @param items - Array of cart items to save
 * @returns Response from the API
 */
export async function saveCartToAPI(
  userId: string,
  items: CartItem[]
): Promise<CartResponse> {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        items,
      }),
    });

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save cart');
    }

    return data;
  } catch (error) {
    console.error('Failed to save cart to API:', error);
    throw error;
  }
}

/**
 * Load cart from API backend
 * @param userId - The user's ID (authenticated or anonymous)
 * @returns Cart data from the API
 */
export async function loadCartFromAPI(userId: string): Promise<CartItem[]> {
  try {
    const response = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`);

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load cart');
    }

    return data.items || [];
  } catch (error) {
    console.error('Failed to load cart from API:', error);
    return [];
  }
}

/**
 * Clear cart from API backend
 * @param userId - The user's ID (authenticated or anonymous)
 * @returns Response from the API
 */
export async function clearCartFromAPI(userId: string): Promise<CartResponse> {
  try {
    const response = await fetch(
      `/api/cart?userId=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
      }
    );

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to clear cart');
    }

    return data;
  } catch (error) {
    console.error('Failed to clear cart from API:', error);
    throw error;
  }
}
