import { NextRequest, NextResponse } from 'next/server';
import { getEvents, recordEvent, Event, EventType } from '@/lib/event-store';

/**
 * GET /api/events
 *
 * Query events with filters:
 * - ?type=product_click,product_view
 * - ?productId=ask-anything-chest
 * - ?nickname=IronTensor
 * - ?startDate=2025-10-30T00:00:00Z
 * - ?endDate=2025-10-30T23:59:59Z
 * - ?limit=100
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const typeParam = searchParams.get('type');
    const productId = searchParams.get('productId') || undefined;
    const nickname = searchParams.get('nickname') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limitParam = searchParams.get('limit');

    const type = typeParam ? typeParam.split(',') as EventType[] : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const events = getEvents({
      type,
      productId,
      nickname,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 *
 * Record a new event manually
 * Body: Event (without id/timestamp)
 */
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    const event = recordEvent(eventData);

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record event' },
      { status: 500 }
    );
  }
}
