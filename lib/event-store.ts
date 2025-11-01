/**
 * Unified Event Store - Single source of truth for ALL metrics
 *
 * Tracks:
 * - Visits, page views, engagement
 * - Product interactions (clicks, likes, views)
 * - Transactions (P2P sales, offers, purchases)
 * - User actions with nicknames
 * - Performance metrics
 * - Detailed logs with full context
 */

import fs from 'fs';
import path from 'path';

const EVENT_STORE_FILE = path.join(process.cwd(), 'data', 'event-store.json');

// ============================================
// TYPE DEFINITIONS
// ============================================

export type EventType =
  // Traffic events
  | 'visitor'
  | 'page_view'
  | 'session_start'
  | 'session_end'

  // Product events
  | 'product_view'
  | 'product_click'
  | 'product_like'
  | 'product_unlike'
  | 'add_to_cart'
  | 'remove_from_cart'

  // Transaction events (P2P)
  | 'purchase_initiated'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'offer_made'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'resale_listed'
  | 'resale_sold'

  // Performance events
  | 'page_load_time'
  | 'api_response_time'
  | 'error_occurred';

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string; // Hashed for privacy
}

export interface ProductEvent extends BaseEvent {
  type: 'product_view' | 'product_click' | 'product_like' | 'product_unlike' | 'add_to_cart' | 'remove_from_cart';
  productId: string;
  productName: string;
  productCategory?: string;
  productPrice?: number;
}

export interface TransactionEvent extends BaseEvent {
  type: 'purchase_initiated' | 'purchase_completed' | 'purchase_failed' | 'offer_made' | 'offer_accepted' | 'offer_rejected' | 'resale_listed' | 'resale_sold';

  // Buyer info
  buyerNickname: string;
  buyerSessionId?: string;

  // Seller info (for P2P)
  sellerNickname?: string;
  sellerSessionId?: string;

  // Product info
  productId: string;
  productName: string;

  // Transaction details
  price: number;
  currency: string;
  paymentMethod?: 'pix' | 'credit_card' | 'cash' | 'other';

  // Offer details (if applicable)
  offerId?: string;
  originalPrice?: number;
  offerAmount?: number;
  priceIncrease?: number;
  percentageGain?: number;

  // Metadata
  notes?: string;
  location?: string;
}

export interface PerformanceEvent extends BaseEvent {
  type: 'page_load_time' | 'api_response_time';
  metric: string;
  value: number;
  unit: 'ms' | 's';
}

export interface ErrorEvent extends BaseEvent {
  type: 'error_occurred';
  errorType: string;
  errorMessage: string;
  stack?: string;
  context?: any;
}

export type Event = BaseEvent | ProductEvent | TransactionEvent | PerformanceEvent | ErrorEvent;

export interface EventStore {
  events: Event[];

  // Aggregated metrics (computed on read)
  metrics: {
    totalVisitors: number;
    totalPageViews: number;
    totalSessions: number;

    // Product metrics
    productViews: { [productId: string]: number };
    productClicks: { [productId: string]: number };
    productLikes: { [productId: string]: number };
    addToCartEvents: number;

    // Transaction metrics
    totalSales: number;
    totalRevenue: number;
    averageTransactionValue: number;
    totalOffers: number;
    acceptedOffers: number;

    // P2P metrics
    resaleVolume: number;
    averagePriceAppreciation: number;
    topCollectors: Array<{ nickname: string; itemsOwned: number; totalSpent: number }>;

    // Performance
    averagePageLoadTime: number;
    averageApiResponseTime: number;

    lastUpdated: string;
  };

  // Inventory state (derived from events)
  inventory: {
    [productId: string]: {
      name: string;
      currentOwner?: string; // Nickname
      purchaseHistory: Array<{
        buyer: string;
        seller?: string;
        price: number;
        timestamp: string;
      }>;
      sold: boolean;
      lastSalePrice?: number;
    };
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getEventStore(): EventStore {
  ensureDataDir();

  try {
    if (fs.existsSync(EVENT_STORE_FILE)) {
      return JSON.parse(fs.readFileSync(EVENT_STORE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading event store:', error);
  }

  // Initialize empty store
  return {
    events: [],
    metrics: {
      totalVisitors: 0,
      totalPageViews: 0,
      totalSessions: 0,
      productViews: {},
      productClicks: {},
      productLikes: {},
      addToCartEvents: 0,
      totalSales: 0,
      totalRevenue: 0,
      averageTransactionValue: 0,
      totalOffers: 0,
      acceptedOffers: 0,
      resaleVolume: 0,
      averagePriceAppreciation: 0,
      topCollectors: [],
      averagePageLoadTime: 0,
      averageApiResponseTime: 0,
      lastUpdated: new Date().toISOString(),
    },
    inventory: {},
  };
}

function saveEventStore(store: EventStore) {
  ensureDataDir();
  try {
    fs.writeFileSync(EVENT_STORE_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error('Error saving event store:', error);
  }
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Record a new event and update metrics
 */
export function recordEvent(event: Omit<Event, 'id' | 'timestamp'>): Event {
  const store = getEventStore();

  const fullEvent: Event = {
    ...event,
    id: generateEventId(),
    timestamp: new Date().toISOString(),
  } as Event;

  // Add to events array
  store.events.push(fullEvent);

  // Keep only last 10,000 events (prevent unlimited growth)
  if (store.events.length > 10000) {
    store.events = store.events.slice(-10000);
  }

  // Recompute metrics
  store.metrics = computeMetrics(store.events);
  store.metrics.lastUpdated = new Date().toISOString();

  // Update inventory state
  if (isTransactionEvent(fullEvent)) {
    updateInventoryFromEvent(store, fullEvent);
  }

  saveEventStore(store);

  return fullEvent;
}

/**
 * Get events with filtering
 */
export function getEvents(options: {
  type?: EventType | EventType[];
  productId?: string;
  nickname?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Event[] {
  const store = getEventStore();
  let filtered = store.events;

  // Filter by type
  if (options.type) {
    const types = Array.isArray(options.type) ? options.type : [options.type];
    filtered = filtered.filter(e => types.includes(e.type));
  }

  // Filter by product
  if (options.productId && isProductEvent(filtered[0])) {
    filtered = filtered.filter(e => (e as ProductEvent).productId === options.productId);
  }

  // Filter by nickname
  if (options.nickname) {
    filtered = filtered.filter(e => {
      if (isTransactionEvent(e)) {
        return e.buyerNickname === options.nickname || e.sellerNickname === options.nickname;
      }
      return false;
    });
  }

  // Filter by date range
  if (options.startDate) {
    filtered = filtered.filter(e => e.timestamp >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter(e => e.timestamp <= options.endDate!);
  }

  // Limit results
  if (options.limit) {
    filtered = filtered.slice(-options.limit);
  }

  return filtered;
}

/**
 * Get computed metrics
 */
export function getMetrics(): EventStore['metrics'] {
  const store = getEventStore();
  return store.metrics;
}

/**
 * Get inventory state
 */
export function getInventoryState(): EventStore['inventory'] {
  const store = getEventStore();
  return store.inventory;
}

/**
 * Query: Who bought what from whom
 */
export function getTransactionHistory(productId?: string): Array<{
  productId: string;
  productName: string;
  buyer: string;
  seller?: string;
  price: number;
  timestamp: string;
  type: 'initial_sale' | 'resale';
}> {
  const store = getEventStore();

  const transactions = store.events.filter(e =>
    e.type === 'purchase_completed' || e.type === 'resale_sold'
  ) as TransactionEvent[];

  if (productId) {
    return transactions
      .filter(t => t.productId === productId)
      .map(t => ({
        productId: t.productId,
        productName: t.productName,
        buyer: t.buyerNickname,
        seller: t.sellerNickname,
        price: t.price,
        timestamp: t.timestamp,
        type: t.sellerNickname ? 'resale' : 'initial_sale',
      }));
  }

  return transactions.map(t => ({
    productId: t.productId,
    productName: t.productName,
    buyer: t.buyerNickname,
    seller: t.sellerNickname,
    price: t.price,
    timestamp: t.timestamp,
    type: t.sellerNickname ? 'resale' : 'initial_sale',
  }));
}

// ============================================
// INTERNAL HELPERS
// ============================================

function computeMetrics(events: Event[]): EventStore['metrics'] {
  const metrics: EventStore['metrics'] = {
    totalVisitors: 0,
    totalPageViews: 0,
    totalSessions: 0,
    productViews: {},
    productClicks: {},
    productLikes: {},
    addToCartEvents: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageTransactionValue: 0,
    totalOffers: 0,
    acceptedOffers: 0,
    resaleVolume: 0,
    averagePriceAppreciation: 0,
    topCollectors: [],
    averagePageLoadTime: 0,
    averageApiResponseTime: 0,
    lastUpdated: new Date().toISOString(),
  };

  const uniqueVisitors = new Set<string>();
  const uniqueSessions = new Set<string>();
  const pageLoadTimes: number[] = [];
  const apiResponseTimes: number[] = [];
  const transactions: TransactionEvent[] = [];
  const collectorSpending: { [nickname: string]: { items: number; spent: number } } = {};

  for (const event of events) {
    switch (event.type) {
      case 'visitor':
        if (event.sessionId) uniqueVisitors.add(event.sessionId);
        metrics.totalVisitors++;
        break;

      case 'page_view':
        metrics.totalPageViews++;
        break;

      case 'session_start':
        if (event.sessionId) uniqueSessions.add(event.sessionId);
        break;

      case 'product_view':
        const viewEvent = event as ProductEvent;
        metrics.productViews[viewEvent.productId] = (metrics.productViews[viewEvent.productId] || 0) + 1;
        break;

      case 'product_click':
        const clickEvent = event as ProductEvent;
        metrics.productClicks[clickEvent.productId] = (metrics.productClicks[clickEvent.productId] || 0) + 1;
        break;

      case 'product_like':
        const likeEvent = event as ProductEvent;
        metrics.productLikes[likeEvent.productId] = (metrics.productLikes[likeEvent.productId] || 0) + 1;
        break;

      case 'product_unlike':
        const unlikeEvent = event as ProductEvent;
        metrics.productLikes[unlikeEvent.productId] = Math.max(0, (metrics.productLikes[unlikeEvent.productId] || 0) - 1);
        break;

      case 'add_to_cart':
        metrics.addToCartEvents++;
        break;

      case 'purchase_completed':
        const purchaseEvent = event as TransactionEvent;
        metrics.totalSales++;
        metrics.totalRevenue += purchaseEvent.price;
        transactions.push(purchaseEvent);

        // Track collector spending
        if (!collectorSpending[purchaseEvent.buyerNickname]) {
          collectorSpending[purchaseEvent.buyerNickname] = { items: 0, spent: 0 };
        }
        collectorSpending[purchaseEvent.buyerNickname].items++;
        collectorSpending[purchaseEvent.buyerNickname].spent += purchaseEvent.price;
        break;

      case 'offer_made':
        metrics.totalOffers++;
        break;

      case 'offer_accepted':
        metrics.acceptedOffers++;
        break;

      case 'resale_sold':
        const resaleEvent = event as TransactionEvent;
        metrics.resaleVolume++;
        if (resaleEvent.originalPrice && resaleEvent.price > resaleEvent.originalPrice) {
          const appreciation = resaleEvent.price - resaleEvent.originalPrice;
          metrics.averagePriceAppreciation =
            ((metrics.averagePriceAppreciation * (metrics.resaleVolume - 1)) + appreciation) / metrics.resaleVolume;
        }
        break;

      case 'page_load_time':
        const loadEvent = event as PerformanceEvent;
        pageLoadTimes.push(loadEvent.value);
        break;

      case 'api_response_time':
        const apiEvent = event as PerformanceEvent;
        apiResponseTimes.push(apiEvent.value);
        break;
    }
  }

  // Compute averages
  metrics.totalSessions = uniqueSessions.size;
  metrics.averageTransactionValue = metrics.totalSales > 0 ? metrics.totalRevenue / metrics.totalSales : 0;
  metrics.averagePageLoadTime = pageLoadTimes.length > 0
    ? pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length
    : 0;
  metrics.averageApiResponseTime = apiResponseTimes.length > 0
    ? apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length
    : 0;

  // Top collectors
  metrics.topCollectors = Object.entries(collectorSpending)
    .map(([nickname, data]) => ({ nickname, itemsOwned: data.items, totalSpent: data.spent }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return metrics;
}

function updateInventoryFromEvent(store: EventStore, event: TransactionEvent) {
  const { productId, productName, buyerNickname, sellerNickname, price } = event;

  if (!store.inventory[productId]) {
    store.inventory[productId] = {
      name: productName,
      purchaseHistory: [],
      sold: false,
    };
  }

  const item = store.inventory[productId];

  if (event.type === 'purchase_completed' || event.type === 'resale_sold') {
    item.currentOwner = buyerNickname;
    item.sold = true;
    item.lastSalePrice = price;
    item.purchaseHistory.push({
      buyer: buyerNickname,
      seller: sellerNickname,
      price,
      timestamp: event.timestamp,
    });
  }
}

function isProductEvent(event: any): event is ProductEvent {
  return event && ['product_view', 'product_click', 'product_like', 'product_unlike', 'add_to_cart', 'remove_from_cart'].includes(event.type);
}

function isTransactionEvent(event: any): event is TransactionEvent {
  return event && ['purchase_initiated', 'purchase_completed', 'purchase_failed', 'offer_made', 'offer_accepted', 'offer_rejected', 'resale_listed', 'resale_sold'].includes(event.type);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Track a visitor
 */
export function trackVisitor(sessionId?: string): Event {
  return recordEvent({
    type: 'visitor',
    sessionId,
  });
}

/**
 * Track a page view
 */
export function trackPageView(sessionId?: string): Event {
  return recordEvent({
    type: 'page_view',
    sessionId,
  });
}

/**
 * Track product interaction
 */
export function trackProductEvent(
  type: 'product_view' | 'product_click' | 'product_like' | 'add_to_cart',
  productId: string,
  productName: string,
  options?: {
    category?: string;
    price?: number;
    sessionId?: string;
  }
): Event {
  return recordEvent({
    type,
    productId,
    productName,
    productCategory: options?.category,
    productPrice: options?.price,
    sessionId: options?.sessionId,
  } as ProductEvent);
}

/**
 * Record a purchase (initial sale OR resale)
 */
export function recordPurchase(
  productId: string,
  productName: string,
  buyerNickname: string,
  price: number,
  options?: {
    sellerNickname?: string; // If P2P resale
    originalPrice?: number;
    paymentMethod?: 'pix' | 'credit_card' | 'cash' | 'other';
    sessionId?: string;
    notes?: string;
  }
): Event {
  const type = options?.sellerNickname ? 'resale_sold' : 'purchase_completed';

  return recordEvent({
    type,
    productId,
    productName,
    buyerNickname,
    sellerNickname: options?.sellerNickname,
    price,
    currency: 'BRL',
    paymentMethod: options?.paymentMethod || 'pix',
    originalPrice: options?.originalPrice,
    priceIncrease: options?.originalPrice ? price - options.originalPrice : undefined,
    percentageGain: options?.originalPrice ? Math.round(((price - options.originalPrice) / options.originalPrice) * 100) : undefined,
    sessionId: options?.sessionId,
    notes: options?.notes,
  } as TransactionEvent);
}

/**
 * Record an offer
 */
export function recordOffer(
  productId: string,
  productName: string,
  buyerNickname: string,
  offerAmount: number,
  currentOwner?: string,
  options?: {
    accepted?: boolean;
    originalPrice?: number;
    sessionId?: string;
  }
): Event {
  const type = options?.accepted ? 'offer_accepted' : 'offer_made';

  return recordEvent({
    type,
    productId,
    productName,
    buyerNickname,
    sellerNickname: currentOwner,
    price: offerAmount,
    currency: 'BRL',
    originalPrice: options?.originalPrice,
    sessionId: options?.sessionId,
  } as TransactionEvent);
}

/**
 * Query: Get full transaction log for a product
 */
export function getProductTimeline(productId: string): Array<{
  timestamp: string;
  eventType: string;
  details: string;
}> {
  const events = getEvents({ productId });

  return events.map(e => {
    let details = '';

    if (isProductEvent(e)) {
      details = `${e.type}: ${e.productName}`;
    } else if (isTransactionEvent(e)) {
      if (e.type === 'purchase_completed') {
        details = `${e.buyerNickname} bought "${e.productName}" for R$${e.price}`;
      } else if (e.type === 'resale_sold') {
        details = `${e.buyerNickname} bought from ${e.sellerNickname} for R$${e.price} (+${e.percentageGain}%)`;
      } else if (e.type === 'offer_made') {
        details = `${e.buyerNickname} offered R$${e.price}`;
      }
    }

    return {
      timestamp: e.timestamp,
      eventType: e.type,
      details,
    };
  });
}

/**
 * Query: Get collector profile
 */
export function getCollectorProfile(nickname: string): {
  nickname: string;
  itemsOwned: string[];
  totalSpent: number;
  itemsSold: number;
  totalEarned: number;
  netPosition: number;
  timeline: Array<{
    timestamp: string;
    action: string;
    productName: string;
    amount: number;
  }>;
} {
  const events = getEvents({ nickname }) as TransactionEvent[];

  const profile = {
    nickname,
    itemsOwned: [] as string[],
    totalSpent: 0,
    itemsSold: 0,
    totalEarned: 0,
    netPosition: 0,
    timeline: [] as Array<{ timestamp: string; action: string; productName: string; amount: number }>,
  };

  for (const event of events) {
    if (event.buyerNickname === nickname) {
      profile.totalSpent += event.price;
      profile.itemsOwned.push(event.productName);
      profile.timeline.push({
        timestamp: event.timestamp,
        action: 'BOUGHT',
        productName: event.productName,
        amount: -event.price,
      });
    }

    if (event.sellerNickname === nickname) {
      profile.totalEarned += event.price;
      profile.itemsSold++;
      profile.itemsOwned = profile.itemsOwned.filter(name => name !== event.productName);
      profile.timeline.push({
        timestamp: event.timestamp,
        action: 'SOLD',
        productName: event.productName,
        amount: event.price,
      });
    }
  }

  profile.netPosition = profile.totalEarned - profile.totalSpent;
  profile.timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return profile;
}

export default {
  recordEvent,
  getEvents,
  getMetrics,
  getInventoryState,
  getTransactionHistory,
  getCollectorProfile,
  trackVisitor,
  trackPageView,
  trackProductEvent,
  recordPurchase,
  recordOffer,
};
