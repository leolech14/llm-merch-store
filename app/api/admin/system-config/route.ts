import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';

const SYSTEM_CONFIG_FILE = path.join(process.cwd(), 'data', 'system-config.json');

interface SystemConfig {
  progressiveHeroEnabled: boolean;
  abTestingEnabled: boolean;
  analyticsEnabled: boolean;
  saleActive: boolean;
  lastUpdated: string;
}

/**
 * GET /api/admin/system-config
 *
 * Get system configuration
 * Public endpoint (used by frontend)
 */
export async function GET() {
  try {
    if (fs.existsSync(SYSTEM_CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(SYSTEM_CONFIG_FILE, 'utf-8'));
      return NextResponse.json(config);
    }

    // Default config
    const defaultConfig: SystemConfig = {
      progressiveHeroEnabled: true,
      abTestingEnabled: true,
      analyticsEnabled: true,
      saleActive: false,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

/**
 * POST /api/admin/system-config
 *
 * Update system configuration
 * Protected: Admin only
 *
 * Body: {
 *   feature: string,
 *   enabled: boolean
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { feature, enabled } = body;

    // Read current config
    let config: SystemConfig;

    if (fs.existsSync(SYSTEM_CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(SYSTEM_CONFIG_FILE, 'utf-8'));
    } else {
      config = {
        progressiveHeroEnabled: true,
        abTestingEnabled: true,
        analyticsEnabled: true,
        saleActive: false,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Update feature
    if (feature in config) {
      (config as any)[feature] = enabled;
      config.lastUpdated = new Date().toISOString();
    }

    // Save
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(SYSTEM_CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
