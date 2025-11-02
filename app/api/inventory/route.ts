import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const INVENTORY_FILE = path.join(process.cwd(), 'data', 'inventory.json');

interface InventoryData {
  products: {
    [key: string]: {
      name: string;
      stock: number;
      sold: boolean;
      soldAt?: string;
      collectorNickname?: string;
      soldPrice?: number;
    }
  };
  lastUpdated: string;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getInventory(): InventoryData {
  ensureDataDir();
  try {
    if (fs.existsSync(INVENTORY_FILE)) {
      return JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading inventory file:', error);
  }

  // Default inventory - ALL START AT R$149
  const basePrice = 149;
  return {
    products: {
      "ask-anything-chest": { name: "Ask Anything Tee", stock: 1, sold: false, soldPrice: basePrice },
      "chatgpt-pro": { name: "ChatGPT 5 Pro Tee", stock: 1, sold: false, soldPrice: basePrice },
      "mic-small": { name: "Mic Icon Tee", stock: 1, sold: false, soldPrice: basePrice },
      "backprop-blue": { name: "Back-Propagation (Blue)", stock: 1, sold: false, soldPrice: basePrice },
      "backprop-red": { name: "Back-Propagation (Red)", stock: 1, sold: false, soldPrice: basePrice },
      "cross-attention": { name: "Cross-Attention Tee", stock: 1, sold: false, soldPrice: basePrice },
      "self-attention": { name: "Self-Attention Tee", stock: 1, sold: false, soldPrice: basePrice },
      "query-key": { name: "Query-Key Matrix Tee", stock: 1, sold: false, soldPrice: basePrice },
      "value-matrix": { name: "Value Matrix Tee", stock: 1, sold: false, soldPrice: basePrice },
      "transformer": { name: "Transformer Architecture Tee", stock: 1, sold: false, soldPrice: basePrice },
      "fluffy-creature": { name: "Fluffy Creature Layers Tee", stock: 1, sold: false, soldPrice: basePrice },
      "fluffy-creature-y": { name: "Fluffy Creature Y Tee", stock: 1, sold: false, soldPrice: basePrice },
      "llm-brunette-color": { name: "Large Language Model (Brunette)", stock: 1, sold: false, soldPrice: basePrice },
      "llm-brunette-bw": { name: "Large Language Model B&W (Brunette)", stock: 1, sold: false, soldPrice: basePrice },
      "llm-brunette-bw-50": { name: "Large Language Model B&W-50 (Brunette)", stock: 1, sold: false, soldPrice: basePrice },
      "llm-blonde-color": { name: "Large Language Model (Blonde)", stock: 1, sold: false, soldPrice: basePrice },
      "llm-blonde-bw": { name: "Large Language Model B&W (Blonde)", stock: 1, sold: false, soldPrice: basePrice },
      "fresh-models": { name: "Fresh Models Tee", stock: 1, sold: false, soldPrice: basePrice },
      "gossip": { name: "Gossip Network Tee", stock: 1, sold: false, soldPrice: basePrice },
      "info-theory": { name: "Information Theory Tee", stock: 1, sold: false, soldPrice: basePrice },
      "info-theory-2": { name: "Information Theory Graph Tee", stock: 1, sold: false, soldPrice: basePrice },
      "circular-graph": { name: "Circular Node Graph Tee", stock: 1, sold: false, soldPrice: basePrice },
      "circular-graph-small": { name: "Circular Node Graph (Small)", stock: 1, sold: false, soldPrice: basePrice },
      "data-cube": { name: "Data Cloud Cube Tee", stock: 1, sold: false, soldPrice: basePrice },
      "paris-city": { name: "Paris is a City Tee", stock: 1, sold: false, soldPrice: basePrice },
      "tunable-params": { name: "Tunable Parameters Tee", stock: 1, sold: false, soldPrice: basePrice }
    },
    lastUpdated: new Date().toISOString()
  };
}

function saveInventory(data: InventoryData) {
  ensureDataDir();
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving inventory file:', error);
  }
}

// CORS headers for public API
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://llmmerch.space',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET: Fetch inventory status
export async function GET() {
  const inventory = getInventory();

  // Calculate stats
  const totalProducts = Object.keys(inventory.products).length;
  const soldOut = Object.values(inventory.products).filter(p => p.sold).length;
  const available = totalProducts - soldOut;

  return NextResponse.json({
    ...inventory,
    stats: {
      totalProducts,
      soldOut,
      available
    }
  }, {
    headers: corsHeaders
  });
}

// OPTIONS: CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: corsHeaders,
    status: 200
  });
}

// POST: Mark product as sold with collector nickname
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, collectorNickname, price } = body;

    const inventory = getInventory();

    if (!inventory.products[productId]) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (inventory.products[productId].sold) {
      return NextResponse.json({ success: false, error: 'Already sold out' }, { status: 400 });
    }

    if (!collectorNickname || collectorNickname.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Collector nickname required' }, { status: 400 });
    }

    // Mark as sold with collector info
    inventory.products[productId].stock = 0;
    inventory.products[productId].sold = true;
    inventory.products[productId].soldAt = new Date().toISOString();
    inventory.products[productId].collectorNickname = collectorNickname.trim();
    inventory.products[productId].soldPrice = price;
    inventory.lastUpdated = new Date().toISOString();

    saveInventory(inventory);

    return NextResponse.json({ success: true, inventory });
  } catch (error) {
    console.error('Inventory error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update inventory' }, { status: 500 });
  }
}
