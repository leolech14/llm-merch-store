import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order } from '@/types/orders';

const KV_TTL = 90 * 24 * 60 * 60; // 90 days

/**
 * GET /api/admin/orders/[orderId]
 * Get single order details
 * Requires admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const cacheKey = `order:${orderId}`;
    const order = await kv.get<Order>(cacheKey);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('[Admin Order GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[orderId]
 * Update order fulfillment details
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const {
      fulfillmentStatus,
      trackingNumber,
      estimatedDelivery,
      adminNotes,
    } = body;

    const cacheKey = `order:${orderId}`;
    const order = await kv.get<Order>(cacheKey);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order fields
    const updatedOrder: Order = {
      ...order,
      ...(fulfillmentStatus && { fulfillmentStatus }),
      ...(trackingNumber && { trackingNumber }),
      ...(estimatedDelivery && { estimatedDelivery }),
      ...(adminNotes !== undefined && { adminNotes }),
      updatedAt: new Date().toISOString(),
    };

    // Save back to KV (maintain original TTL)
    await kv.setex(cacheKey, KV_TTL, updatedOrder);

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('[Admin Order PATCH Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
