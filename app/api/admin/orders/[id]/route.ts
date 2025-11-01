import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order } from '@/types/orders';

/**
 * PATCH /api/admin/orders/[id]
 * Update order fulfillment status, tracking number, and admin notes
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { fulfillmentStatus, trackingNumber, adminNotes } = body;

    // Fetch the order
    const order = await kv.get<Order>(`order:${orderId}`);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update the order
    const updatedOrder: Order = {
      ...order,
      fulfillmentStatus: fulfillmentStatus || order.fulfillmentStatus,
      trackingNumber: trackingNumber || order.trackingNumber,
      adminNotes: adminNotes || order.adminNotes,
      updatedAt: new Date().toISOString(),
    };

    // Save the updated order
    await kv.set(`order:${orderId}`, updatedOrder);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('[Admin Order Update Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/orders/[id]
 * Get a single order details
 * Requires admin authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const order = await kv.get<Order>(`order:${orderId}`);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[Admin Order Get Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
