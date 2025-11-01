import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Order item structure
 */
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * Shipping address structure
 */
interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Complete order structure
 */
interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  paymentHash?: string;
  createdAt: string;
  updatedAt: string;
}

const KV_PREFIX = 'order';
const KV_TTL = 90 * 24 * 60 * 60; // 90 days in seconds

/**
 * Generate cache key for order
 */
function getCacheKey(orderId: string): string {
  return `${KV_PREFIX}:${orderId}`;
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      orderId?: string;
      items?: OrderItem[];
      subtotal?: number;
      shipping?: number;
      total?: number;
      shippingAddress?: ShippingAddress;
      paymentHash?: string;
    };

    const { orderId, items, subtotal, shipping, total, shippingAddress, paymentHash } = body;

    // Validation
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing orderId',
          status: 400
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Items must be a non-empty array',
          status: 400
        },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid shipping address',
          status: 400
        },
        { status: 400 }
      );
    }

    if (typeof subtotal !== 'number' || typeof total !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pricing information',
          status: 400
        },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(orderId);
    const now = new Date().toISOString();

    // Build order data
    const order: Order = {
      orderId,
      items,
      subtotal,
      shipping: shipping || 0,
      total,
      shippingAddress,
      paymentStatus: 'PENDING',
      paymentHash,
      createdAt: now,
      updatedAt: now
    };

    // Save to Vercel KV with TTL
    await kv.setex(cacheKey, KV_TTL, order);

    return NextResponse.json(
      {
        success: true,
        data: order
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

    console.error('[Orders POST Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Retrieve an order by ID
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing orderId parameter',
          status: 400
        },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(orderId);
    const order = await kv.get<Order>(cacheKey);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
          status: 404
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Orders GET Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve order',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders
 * Update order payment status
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      orderId?: string;
      paymentStatus?: 'PENDING' | 'CONFIRMED' | 'FAILED';
    };

    const { orderId, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing orderId',
          status: 400
        },
        { status: 400 }
      );
    }

    if (!paymentStatus || !['PENDING', 'CONFIRMED', 'FAILED'].includes(paymentStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid paymentStatus',
          status: 400
        },
        { status: 400 }
      );
    }

    const cacheKey = getCacheKey(orderId);
    const order = await kv.get<Order>(cacheKey);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
          status: 404
        },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder: Order = {
      ...order,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };

    // Save back to KV
    await kv.setex(cacheKey, KV_TTL, updatedOrder);

    return NextResponse.json(
      {
        success: true,
        data: updatedOrder
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Orders PATCH Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
        status: 500
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/orders
 * CORS preflight handler
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
