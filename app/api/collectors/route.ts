import { NextRequest, NextResponse } from 'next/server';
import { getCollectorProfile, getMetrics } from '@/lib/event-store';

/**
 * GET /api/collectors
 *
 * Get collector leaderboard or individual profile
 *
 * Query params:
 * - ?nickname=IronTensor (optional - get specific collector)
 *
 * Without nickname: Returns top collectors leaderboard
 * With nickname: Returns detailed profile for that collector
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nickname = searchParams.get('nickname');

    if (nickname) {
      // Get individual collector profile
      const profile = getCollectorProfile(nickname);

      return NextResponse.json({
        success: true,
        profile,
      });
    }

    // Get leaderboard
    const metrics = getMetrics();

    return NextResponse.json({
      success: true,
      topCollectors: metrics.topCollectors,
      totalCollectors: metrics.topCollectors.length,
      totalItemsSold: metrics.totalSales,
      totalRevenue: metrics.totalRevenue,
    });
  } catch (error) {
    console.error('Error fetching collectors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collector data' },
      { status: 500 }
    );
  }
}
