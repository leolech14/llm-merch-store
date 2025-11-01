import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

const HERO_CONFIG_FILE = path.join(process.cwd(), 'data', 'hero-config.json');

interface HeroVariantStats {
  views: number;
  clicks: number;
  conversion: number;
}

interface HeroConfig {
  wtf: HeroVariantStats;
  cognitive: HeroVariantStats;
  skate: HeroVariantStats;
  minimal: HeroVariantStats;
  winner: string;
  lastUpdated: string;
}

/**
 * GET /api/admin/hero-config
 *
 * Returns A/B testing results for hero variants
 * Protected: Admin only
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Read hero config or create default
    let config: HeroConfig;

    if (fs.existsSync(HERO_CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(HERO_CONFIG_FILE, 'utf-8'));
    } else {
      config = {
        wtf: { views: 0, clicks: 0, conversion: 0 },
        cognitive: { views: 0, clicks: 0, conversion: 0 },
        skate: { views: 0, clicks: 0, conversion: 0 },
        minimal: { views: 0, clicks: 0, conversion: 0 },
        winner: 'Testing...',
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate conversions
    config.wtf.conversion = config.wtf.views > 0 ? (config.wtf.clicks / config.wtf.views) * 100 : 0;
    config.cognitive.conversion = config.cognitive.views > 0 ? (config.cognitive.clicks / config.cognitive.views) * 100 : 0;
    config.skate.conversion = config.skate.views > 0 ? (config.skate.clicks / config.skate.views) * 100 : 0;
    config.minimal.conversion = config.minimal.views > 0 ? (config.minimal.clicks / config.minimal.views) * 100 : 0;

    // Determine winner
    const variants = [
      { name: 'WTF', conversion: config.wtf.conversion },
      { name: 'Cognitive', conversion: config.cognitive.conversion },
      { name: 'Skate', conversion: config.skate.conversion },
      { name: 'Minimal', conversion: config.minimal.conversion },
    ];

    const winner = variants.reduce((a, b) => a.conversion > b.conversion ? a : b);
    config.winner = winner.conversion > 0 ? winner.name : 'Testing...';

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching hero config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

/**
 * POST /api/admin/hero-config
 *
 * Update hero variant stats
 * Protected: Admin only
 *
 * Body: {
 *   variant: 'wtf' | 'cognitive' | 'skate' | 'minimal',
 *   action: 'view' | 'click'
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { variant, action } = body;

    if (!['wtf', 'cognitive', 'skate', 'minimal'].includes(variant)) {
      return NextResponse.json({ error: 'Invalid variant' }, { status: 400 });
    }

    if (!['view', 'click'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Read current config
    let config: HeroConfig;

    if (fs.existsSync(HERO_CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(HERO_CONFIG_FILE, 'utf-8'));
    } else {
      config = {
        wtf: { views: 0, clicks: 0, conversion: 0 },
        cognitive: { views: 0, clicks: 0, conversion: 0 },
        skate: { views: 0, clicks: 0, conversion: 0 },
        minimal: { views: 0, clicks: 0, conversion: 0 },
        winner: 'Testing...',
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update stats
    const variantKey = variant as 'wtf' | 'cognitive' | 'skate' | 'minimal';
    if (action === 'view') {
      config[variantKey].views++;
    } else {
      config[variantKey].clicks++;
    }

    config.lastUpdated = new Date().toISOString();

    // Save
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(HERO_CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error updating hero config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
