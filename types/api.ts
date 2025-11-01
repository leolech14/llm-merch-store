/**
 * API Type Definitions - Frontend-Backend Contract
 *
 * Replaces 'any' types with strict interfaces
 */

export interface Stats {
  totalVisitors: number;
  totalPageViews: number;
  addToCartEvents: number;
  totalSales: number;
  totalProducts: number;
  totalLikes: number;
  productLikes?: Record<string, number>;
  topProducts: Array<{
    name: string;
    clicks: number;
  }>;
  engagementRate: number;
  lastUpdated?: string;
}

export interface SaleStatus {
  isActive: boolean;
  status: 'before' | 'during' | 'after';
  startTime: string;
  endTime: string;
  timeUntilStart?: number;
  timeUntilEnd?: number;
}

export interface Product {
  name: string;
  stock: number;
  sold: boolean;
  soldAt?: string;
  collectorNickname?: string;
  soldPrice?: number;
}

export interface Inventory {
  products: Record<string, Product>;
  lastUpdated: string;
  stats?: {
    totalProducts: number;
    soldOut: number;
    available: number;
  };
}

export interface MarketPrice {
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

export interface MarketPrices {
  marketPrices: Record<string, MarketPrice>;
  trending: MarketPrice[];
  topGainers: MarketPrice[];
  basePrice: number;
}

export interface VisitorResponse {
  count: number;
}

export interface TelemetryResponse {
  success: boolean;
  telemetry?: any;
}
