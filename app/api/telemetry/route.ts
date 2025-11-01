import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TELEMETRY_FILE = path.join(process.cwd(), 'data', 'telemetry.json');

interface TelemetryData {
  totalVisitors: number;
  totalPageViews: number;
  productClicks: { [key: string]: number };
  productLikes: { [key: string]: number };
  addToCartEvents: number;
  totalSales: number;
  totalProducts: number;
  lastUpdated: string;
  recentEvents: Array<{
    type: string;
    timestamp: string;
    data?: Record<string, unknown>;
  }>;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getTelemetryData(): TelemetryData {
  ensureDataDir();
  try {
    if (fs.existsSync(TELEMETRY_FILE)) {
      return JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading telemetry file:', error);
  }

  return {
    totalVisitors: 500,
    totalPageViews: 1247,
    productClicks: {},
    productLikes: {},
    addToCartEvents: 89,
    totalSales: 156,
    totalProducts: 24,
    lastUpdated: new Date().toISOString(),
    recentEvents: []
  };
}

function saveTelemetryData(data: TelemetryData) {
  ensureDataDir();
  try {
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving telemetry file:', error);
  }
}

// POST: Track events
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, eventData } = body;

    const telemetry = getTelemetryData();

    // Track different event types
    switch (eventType) {
      case 'page_view':
        telemetry.totalPageViews += 1;
        break;

      case 'visitor':
        telemetry.totalVisitors += 1;
        break;

      case 'product_click':
        const productName = eventData?.productName || 'unknown';
        telemetry.productClicks[productName] = (telemetry.productClicks[productName] || 0) + 1;
        break;

      case 'product_like':
        const likedProduct = eventData?.productName || 'unknown';
        telemetry.productLikes[likedProduct] = (telemetry.productLikes[likedProduct] || 0) + 1;
        break;

      case 'add_to_cart':
        telemetry.addToCartEvents += 1;
        break;

      case 'sale':
        telemetry.totalSales += 1;
        break;
    }

    // Store recent events (keep last 50)
    telemetry.recentEvents.unshift({
      type: eventType,
      timestamp: new Date().toISOString(),
      data: eventData
    });
    telemetry.recentEvents = telemetry.recentEvents.slice(0, 50);

    telemetry.lastUpdated = new Date().toISOString();
    saveTelemetryData(telemetry);

    return NextResponse.json({ success: true, telemetry });
  } catch (error) {
    console.error('Telemetry error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track event' }, { status: 500 });
  }
}

// GET: Fetch telemetry data
export async function GET() {
  const telemetry = getTelemetryData();
  return NextResponse.json(telemetry);
}
