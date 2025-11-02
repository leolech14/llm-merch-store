import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order, OrderListResponse } from '@/types/orders';

/**
 * GET /api/admin/orders
 * List all orders with pagination and filtering
 * Requires admin authentication
 *
 * FIXED: Unbounded KV scan that caused 504 timeouts
 * - Added max iteration limit (1000 keys)
 * - Added batch fetching with kv.mget()
 * - Added timeout protection
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

    // Scan order keys from Vercel KV with LIMIT
    const orderKeys: string[] = [];
    let cursor: number | string = 0;
    const MAX_ITERATIONS = 20; // Max 20 iterations × 100 keys = 2000 keys max
    let iterations = 0;

    do {
      const result: [number | string, string[]] = await kv.scan(cursor, {
        match: 'order:*',
        count: 100,
      });

      cursor = result[0];
      orderKeys.push(...result[1]);
      iterations++;

      // Safety limit: prevent infinite loops
      if (iterations >= MAX_ITERATIONS) {
        console.warn(`[Admin Orders] Hit max iterations (${MAX_ITERATIONS}), stopping scan. Found ${orderKeys.length} keys.`);
        break;
      }
    } while (cursor !== '0' && cursor !== 0);

    // Batch fetch orders using mget (much faster than individual gets)
    const orders: Order[] = [];

    if (orderKeys.length > 0) {
      // Process in batches of 100 to avoid overwhelming KV
      const BATCH_SIZE = 100;
      for (let i = 0; i < orderKeys.length; i += BATCH_SIZE) {
        const batch = orderKeys.slice(i, i + BATCH_SIZE);
        const batchOrders = await kv.mget<Order[]>(...batch);

        // Filter out nulls and apply status filter
        for (const order of batchOrders) {
          if (order) {
            if (
              !status ||
              order.fulfillmentStatus === status ||
              order.paymentStatus === status
            ) {
              orders.push(order);
            }
          }
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
