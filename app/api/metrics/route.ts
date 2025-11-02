import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/event-store';
import fs from 'fs';
import path from 'path';

const INVENTORY_FILE = path.join(process.cwd(), 'data', 'inventory.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://llmmerch.space',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * GET /api/metrics
 *
 * Returns all computed metrics from the Event Store
 * Plus dynamic product count from inventory
 */
export async function GET() {
  try {
    const metrics = getMetrics();

    // Calculate total products dynamically from inventory
    let totalProducts = 0;
    let soldOut = 0;
    let available = 0;

    if (fs.existsSync(INVENTORY_FILE)) {
      const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
      const products: Record<string, { sold: boolean }> = inventoryData.products || {};

      totalProducts = Object.keys(products).length;
      soldOut = Object.values(products).filter((p) => p.sold).length;
      available = totalProducts - soldOut;
    }

    return NextResponse.json({
      ...metrics,
      totalProducts, // ← Dynamically calculated!
      soldOut,
      available,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}
