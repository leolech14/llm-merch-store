import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Order } from '@/types/orders';

/**
 * GET /api/admin/orders/export?format=csv
 * Export orders to CSV for manufacturer
 * Requires admin authentication
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

    // Fetch all orders
    const orderKeys: string[] = [];
    let cursor: string | number = '0';

    do {
      const result: [number | string, string[]] = await kv.scan(cursor, {
        match: 'order:*',
        count: 100,
      });

      cursor = result[0];
      orderKeys.push(...result[1]);
    } while (cursor !== '0' && cursor !== 0);

    const orders: Order[] = [];
    for (const key of orderKeys) {
      const order = await kv.get<Order>(key);
      if (order && order.paymentStatus === 'CONFIRMED') {
        orders.push(order);
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
