import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Product interface for cart items
 * Matches the inventory product structure
 */
interface CartItem {
  id: string;
  name: string;
  stock: number;
  sold: boolean;
  soldPrice?: number;
  collectorNickname?: string;
  soldAt?: string;
  quantity?: number;
}

/**
 * Cart data structure stored in Vercel KV
 */
interface CartData {
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  totalItems: number;
}

/**
 * Standard API response structure
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

const KV_PREFIX = 'cart';
const KV_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate cache key for user cart
 * @param userId Unique identifier for the user
 * @returns Formatted cache key
 */
function getCacheKey(userId: string): string {
  return `${KV_PREFIX}:${userId}`;
}

/**
 * Validate userId from request
 * Accepts userId from query parameters or X-User-ID header
 * @param request Next.js request object
 * @returns userId or null if not found
 */
function getUserId(request: NextRequest): string | null {
  // Try to get from header first (more secure)
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) {
    return headerUserId;
  }

  // Fall back to query parameter
  const { searchParams } = new URL(request.url);
  const queryUserId = searchParams.get('userId');
  return queryUserId;
}

/**
 * GET /api/cart
 * Retrieve cart for a user from Vercel KV
 * Query param: ?userId=<string>
 * Header: X-User-ID: <string>
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId parameter or X-User-ID header',
          status: 400
        },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(userId);

    // Fetch from Vercel KV
    const cartData = await kv.get<CartData>(cacheKey);

    if (!cartData) {
      // Return empty cart if not found
      return NextResponse.json(
        {
          success: true,
          data: {
            userId,
            items: [],
            totalItems: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: cartData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cart GET Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve cart',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Save or update cart for a user in Vercel KV
 * Body: { userId: string, items: CartItem[] }
 * TTL: 7 days
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json() as { userId?: string; items?: CartItem[] };

    const { userId, items } = body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing userId in request body',
          status: 400
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Items must be an array',
          status: 400
        },
        { status: 400 }
      );
    }

    // Validate cart items
    for (const item of items) {
      if (!item.id || !item.name) {
        return NextResponse.json(
          {
            success: false,
            error: 'Each cart item must have id and name',
            status: 400
          },
          { status: 400 }
        );
      }
    }

    const cacheKey = getCacheKey(userId);
    const now = new Date().toISOString();

    // Build cart data
    const cartData: CartData = {
      userId,
      items,
      createdAt: now,
      updatedAt: now,
      totalItems: items.length
    };

    // Save to Vercel KV with TTL
    await kv.setex(cacheKey, KV_TTL, cartData);

    return NextResponse.json(
      {
        success: true,
        data: cartData
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          status: 400
        },
        { status: 400 }
      );
    }

    console.error('[Cart POST Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save cart',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Remove cart for a user from Vercel KV
 * Query param: ?userId=<string>
 * Header: X-User-ID: <string>
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId parameter or X-User-ID header',
          status: 400
        },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(userId);

    // Delete from Vercel KV
    const result = await kv.del(cacheKey);

    // kv.del returns number of keys deleted
    if (result === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cart not found',
          status: 404
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Cart deleted successfully', userId }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cart DELETE Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete cart',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/cart
 * CORS preflight handler
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-ID'
      }
    }
  );
}
