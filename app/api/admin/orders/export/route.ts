import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order } from '@/types/orders';

/**
 * GET /api/admin/orders/export?format=csv
 * Export orders to CSV for manufacturer
 * Requires admin authentication
 *
 * FIXED: Unbounded KV scan that caused 504 timeouts
 * - Added max iteration limit (2000 keys)
 * - Added batch fetching with kv.mget()
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch order keys with LIMIT
    const orderKeys: string[] = [];
    let cursor: string | number = '0';
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

      // Safety limit
      if (iterations >= MAX_ITERATIONS) {
        console.warn(`[Admin Orders Export] Hit max iterations (${MAX_ITERATIONS}), stopping scan. Found ${orderKeys.length} keys.`);
        break;
      }
    } while (cursor !== '0' && cursor !== 0);

    // Batch fetch orders
    const orders: Order[] = [];

    if (orderKeys.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < orderKeys.length; i += BATCH_SIZE) {
        const batch = orderKeys.slice(i, i + BATCH_SIZE);
        const batchOrders = await kv.mget<Order[]>(...batch);

        // Only include confirmed orders
        for (const order of batchOrders) {
          if (order && order.paymentStatus === 'CONFIRMED') {
            orders.push(order);
          }
        }
      }
    }

    // Sort by date
    orders.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Generate CSV
    const csvRows = [
      // Header
      'Order ID,Date,Customer Name,Email,Phone,Address,City,State,ZIP,Items,Quantity,Total,Status,Tracking',
    ];

    for (const order of orders) {
      const itemsList = order.items
        .map((item) => `${item.name} (${item.quantity})`)
        .join('; ');

      const totalQuantity = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const row = [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString('pt-BR'),
        order.shippingAddress.fullName,
        order.shippingAddress.email,
        order.shippingAddress.phone,
        `"${order.shippingAddress.address}"`,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.zipCode,
        `"${itemsList}"`,
        totalQuantity,
        order.total.toFixed(2),
        order.fulfillmentStatus || 'pending',
        order.trackingNumber || '',
      ].join(',');

      csvRows.push(row);
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${new Date()
          .toISOString()
          .split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[Admin Orders Export Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}
