import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VISITORS_FILE = path.join(process.cwd(), 'data', 'visitors.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://llmmerch.space',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read current visitor count
function getVisitorCount(): number {
  ensureDataDir();
  try {
    if (fs.existsSync(VISITORS_FILE)) {
      const data = JSON.parse(fs.readFileSync(VISITORS_FILE, 'utf-8'));
      return data.count || 500;
    }
  } catch (error) {
    console.error('Error reading visitors file:', error);
  }
  return 500; // Starting count
}

// Save visitor count
function saveVisitorCount(count: number) {
  ensureDataDir();
  try {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }));
  } catch (error) {
    console.error('Error saving visitors file:', error);
  }
}

// GET: Fetch current visitor count
export async function GET() {
  const count = getVisitorCount();
  return NextResponse.json({ count }, { headers: corsHeaders });
}

// POST: Increment visitor count
export async function POST() {
  const currentCount = getVisitorCount();
  const newCount = currentCount + 1;
  saveVisitorCount(newCount);
  return NextResponse.json({ count: newCount }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}
