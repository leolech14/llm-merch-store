import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');
const INVENTORY_FILE = path.join(process.cwd(), 'data', 'inventory.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface MarketPrice {
  productId: string;
  productName: string;
  basePrice: number;
  highestOffer: number;
  totalOffers: number;
  priceAppreciation: number;
  percentageGain: number;
  isTrending: boolean;
  lastOfferTime?: string;
  status: 'available' | 'sold';
  soldPrice?: number;
}

export async function GET() {
  try {
    const basePrice = 149;
    const marketPrices: { [key: string]: MarketPrice } = {};

    // Read offers
    interface OffersData {
      offers: Array<{
        productId: string;
        offerAmount: number;
        createdAt: string;
        [key: string]: any;
      }>;
    }
    let offersData: OffersData = { offers: [] };
    if (fs.existsSync(OFFERS_FILE)) {
      offersData = JSON.parse(fs.readFileSync(OFFERS_FILE, 'utf-8'));
    }

    // Read inventory
    interface InventoryData {
      products: Record<string, { name: string; sold: boolean; soldPrice?: number }>;
    }
    let inventoryData: InventoryData = { products: {} };
    if (fs.existsSync(INVENTORY_FILE)) {
      inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    }

    // Calculate market prices for each product
    Object.entries(inventoryData.products || {}).forEach(([productId, product]) => {
      // Get all offers for this product
      const productOffers = offersData.offers.filter((o) => o.productId === productId);
      const highestOffer = productOffers.length > 0
        ? Math.max(...productOffers.map((o) => o.offerAmount))
        : basePrice;

      const priceAppreciation = highestOffer - basePrice;
      const percentageGain = ((highestOffer - basePrice) / basePrice) * 100;

      // Check if trending (3+ offers in last hour)
      const recentOffers = productOffers.filter((o) => {
        const offerTime = new Date(o.createdAt).getTime();
        const hourAgo = Date.now() - (60 * 60 * 1000);
        return offerTime > hourAgo;
      });

      marketPrices[productId] = {
        productId,
        productName: product.name,
        basePrice,
        highestOffer,
        totalOffers: productOffers.length,
        priceAppreciation,
        percentageGain: Math.round(percentageGain),
        isTrending: recentOffers.length >= 3,
        lastOfferTime: productOffers.length > 0
          ? (productOffers[productOffers.length - 1] as any)?.createdAt
          : undefined,
        status: product.sold ? 'sold' : 'available',
        soldPrice: product.soldPrice
      };
    });

    // Sort by highest appreciation
    const sorted = Object.values(marketPrices).sort((a, b) => b.priceAppreciation - a.priceAppreciation);

    return NextResponse.json({
      marketPrices,
      trending: sorted.filter(p => p.isTrending),
      topGainers: sorted.slice(0, 5),
      basePrice
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error calculating market prices:', error);
    return NextResponse.json({ error: 'Failed to calculate market prices' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders, status: 200 });
}
