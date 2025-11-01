import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order, OrderListResponse } from '@/types/orders';

/**
 * GET /api/admin/orders
 * List all orders with pagination and filtering
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, shipped, etc.
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Scan all order keys from Vercel KV
    const orderKeys: string[] = [];
    let cursor: number | string = 0;

    do {
      const result: [number | string, string[]] = await kv.scan(cursor, {
        match: 'order:*',
        count: 100,
      });

      cursor = result[0];
      orderKeys.push(...result[1]);
    } while (cursor !== '0' && cursor !== 0);

    // Fetch all orders
    const orders: Order[] = [];
    for (const key of orderKeys) {
      const order = await kv.get<Order>(key);
      if (order) {
        // Filter by status if provided
        if (
          !status ||
          order.fulfillmentStatus === status ||
          order.paymentStatus === status
        ) {
          orders.push(order);
        }
      }
    }

    // Sort by creation date (newest first)
    orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    const response: OrderListResponse = {
      orders: paginatedOrders,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('[Admin Orders GET Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
